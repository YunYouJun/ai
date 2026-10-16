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

  it('checks out the callee runtime prompt before interpolation', () => {
    const steps = workflow.jobs.activation.steps
    const guard = steps.findIndex((step: { name?: string }) => step.name === 'Require the exact reusable workflow revision')
    const checkout = steps.findIndex((step: { name?: string }) => step.name === 'Checkout trusted runtime prompt')
    const render = steps.findIndex((step: { name?: string }) => step.name === 'Interpolate variables and render templates')
    expect(guard).toBeGreaterThanOrEqual(0)
    expect(guard).toBeLessThan(checkout)
    expect(checkout).toBeLessThan(render)
    expect(steps[checkout].with).toEqual({
      'repository': expression('job.workflow_repository'),
      'ref': expression('job.workflow_sha'),
      'persist-credentials': false,
      'sparse-checkout': '.github/workflows',
    })
    expect(compiled).toContain('{{#runtime-import .github/workflows/release-notes.md}}')
  })

  it('keeps automatic and compact manual callers within the permission contract', () => {
    for (const file of ['release-notes-minimal.yml', 'release-notes.yml', 'release-notes-options.yml']) {
      const caller = parse(read(`examples/copilot-release-notes/.github/workflows/${file}`))
      const job: any = Object.values(caller.jobs)[0]
      const entry = file === 'release-notes-minimal.yml' ? 'release-notes.lock.yml' : 'release-notes.yml'
      expect(job.uses).toBe(`YunYouJun/ai/.github/workflows/${entry}@release-notes-v1`)
      expect(job).not.toHaveProperty('secrets')
      const levels: Record<string, number> = { none: 0, read: 1, write: 2 }
      for (const called of Object.values(workflow.jobs) as { permissions?: Record<string, string> }[]) {
        for (const [scope, level] of Object.entries(called.permissions || {}))
          expect(levels[job.permissions[scope] || 'none'], scope).toBeGreaterThanOrEqual(levels[level])
      }
      expect(caller.on.release.types).toEqual(['published'])
      if (file !== 'release-notes-minimal.yml') {
        expect(job).not.toHaveProperty('with')
        expect(Object.keys(caller.on.workflow_dispatch.inputs)).toEqual(file === 'release-notes.yml' ? ['tag'] : ['tag', 'options'])
        expect(caller.on.workflow_dispatch.inputs.tag).toMatchObject({ type: 'string', required: true })
      }
    }
    expect(workflow.on.workflow_call.inputs.automatic.default).toBe(true)
    expect(workflow.on).not.toHaveProperty('release')
  })

  it('adapts caller events centrally and keeps the typed programmatic API compatible', () => {
    const adapter = parse(read('.github/workflows/release-notes.yml'))
    expect(adapter.on.workflow_call).toBeNull()
    expect(adapter.permissions).toEqual({})
    expect(adapter.jobs.notes.uses).toBe('./.github/workflows/release-notes.lock.yml')
    expect(adapter.jobs.notes).not.toHaveProperty('secrets')
    expect(adapter.jobs.notes.with).toEqual({
      tag: expression('github.event.inputs.tag || github.event.release.tag_name'),
      options: expression('github.event.inputs.options || \'\''),
      automatic: expression('github.event_name == \'release\''),
    })
    expect(workflow.on.workflow_call.inputs.options).toEqual({ type: 'string', default: '' })
    expect(workflow.on.workflow_call.inputs.tag.required).toBe(true)
    for (const [job, run] of [['pre_activation', 'node ../scripts/release-notes.mjs prepare'], ['publish_release_notes', 'node scripts/release-notes.mjs publish']]) {
      const step = workflow.jobs[job].steps.find((step: { run?: string }) => step.run === run)
      expect(step.env.RELEASE_NOTES_OPTIONS).toBe(expression('inputs.options'))
    }
  })
})
