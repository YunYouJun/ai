import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const source = read('.github/workflows/release-notes.md')
const compiled = read('.github/workflows/release-notes.lock.yml')
const workflow = parse(compiled)
const expression = (value: string) => `$${'{'}{ ${value} }}`

describe('cross-repository release notes', () => {
  it('uses the caller token for inference and writes only after detection', () => {
    expect(compiled).toContain(`COPILOT_GITHUB_TOKEN: ${expression('github.token')}`)
    expect(source).not.toContain('secrets.')
    expect(compiled).not.toContain('secrets.COPILOT_GITHUB_TOKEN')
    expect(workflow.jobs.activation.permissions.actions).toBe('read')
    expect(workflow.jobs.pre_activation.permissions).toEqual({ contents: 'read' })
    expect(workflow.jobs.agent.permissions.contents).toBe('read')
    expect(workflow.jobs.agent.permissions['copilot-requests']).toBe('write')
    expect(workflow.jobs.activation.if).toContain('needs.pre_activation.outputs.should_run == \'true\'')
    expect(workflow.jobs.publish_release_notes.if).toContain('needs.detection.outputs.detection_success == \'true\'')
    expect(workflow.jobs.publish_release_notes.permissions).toEqual({ contents: 'write' })
  })

  it('loads trusted scripts at the callee SHA and analyzes the caller history', () => {
    const pre = workflow.jobs.pre_activation.steps
    const publisher = workflow.jobs.publish_release_notes.steps
    for (const steps of [pre, publisher]) {
      const guard = steps.find((step: { name?: string }) => step.name === 'Require the exact reusable workflow revision')
      const implementation = steps.find((step: { name?: string }) => step.name === 'Checkout trusted workflow implementation')
      expect(guard.run).toContain('[[ "$WORKFLOW_SHA" =~ ^[0-9a-f]{40}$ ]]')
      expect(steps.indexOf(guard)).toBeLessThan(steps.indexOf(implementation))
      expect(implementation.with).toEqual({
        'repository': expression('job.workflow_repository'),
        'ref': expression('job.workflow_sha'),
        'persist-credentials': false,
      })
    }
    const history = pre.find((step: { name?: string }) => step.name === 'Checkout caller release history')
    expect(history.with).toMatchObject({ 'repository': expression('github.repository'), 'path': 'source', 'fetch-depth': 0 })
    const prepare = pre.find((step: { id?: string }) => step.id === 'release_scope')
    expect(prepare).toMatchObject({ 'working-directory': 'source', 'run': 'node ../scripts/release-notes.mjs prepare' })
    const analysis = workflow.jobs.agent.steps.find((step: { uses?: string }) => step.uses?.startsWith('actions/checkout@') && (step as any).with?.repository === expression('github.repository'))
    expect(analysis.with).toMatchObject({ 'repository': expression('github.repository'), 'fetch-depth': 0, 'persist-credentials': false })
    expect(publisher.filter((step: { uses?: string }) => step.uses?.startsWith('actions/checkout@'))).toHaveLength(1)
    expect(publisher.find((step: { run?: string }) => step.run === 'node scripts/release-notes.mjs publish')).toBeDefined()
  })

  it('keeps the minimal and manual callers within the permission and input contracts', () => {
    for (const file of ['release-notes-minimal.yml', 'release-notes.yml']) {
      const text = read(`examples/copilot-release-notes/.github/workflows/${file}`)
      const caller = parse(text)
      const job: any = Object.values(caller.jobs)[0]
      expect(job.uses).toBe('YunYouJun/ai/.github/workflows/release-notes.lock.yml@release-notes-v1')
      expect(job).not.toHaveProperty('secrets')
      const levels: Record<string, number> = { none: 0, read: 1, write: 2 }
      for (const called of Object.values(workflow.jobs) as { permissions?: Record<string, string> }[]) {
        for (const [scope, level] of Object.entries(called.permissions || {}))
          expect(levels[job.permissions[scope] || 'none'], scope).toBeGreaterThanOrEqual(levels[level])
      }
      for (const input of Object.keys(job.with))
        expect(workflow.on.workflow_call.inputs).toHaveProperty(input)
      expect(caller.on.release.types).toEqual(['published'])
      if (file === 'release-notes.yml') {
        expect(caller.on.workflow_dispatch.inputs.automatic.default).toBe(false)
        expect(caller.on.workflow_dispatch.inputs.language.options).toEqual(['both', 'zh-CN', 'en'])
      }
    }
    expect(workflow.on.workflow_call.inputs.automatic.default).toBe(true)
    expect(workflow.on).not.toHaveProperty('release')
  })
})
