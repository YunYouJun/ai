import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const assets = new URL('../plugins/ai-coding/skills/triage-issues/assets/', import.meta.url)
const policy = JSON.parse(readFileSync(new URL('valaxy.policy.example.json', assets), 'utf8'))
const record = JSON.parse(readFileSync(new URL('task-record.example.json', assets), 'utf8'))

// These are example-contract regression checks, not a runtime policy engine.
describe('issue autopilot examples', () => {
  it('defaults to one verified repository and a read-only, undeployed event adapter', () => {
    expect(policy.scope).toEqual({
      repository: 'YunYouJun/valaxy',
      repositoryId: 467617659,
      baseBranch: 'main',
      allowOtherRepositories: false,
    })
    expect(policy.mode).toBe('dry-run')
    expect(policy.trigger).toEqual({
      strategy: 'event-first',
      initialInventoryOnce: true,
      events: ['issues.opened', 'issues.labeled'],
      eligibilityLabel: 'ai-ready',
      polling: false,
      adapterConfigured: false,
    })
    expect(policy.runtimeEnforcement).toEqual({
      implemented: false,
      policyIsNotSandbox: true,
      failClosedWithoutEnforcement: true,
    })
  })

  it('keeps approval, deduplication, locks and bounded budgets explicit', () => {
    expect(policy.eligibility.requireMaintainerApproval).toBe(true)
    expect(policy.eligibility.requireReproduction).toBe(true)
    expect(policy.deduplication.versionKey).toEqual(['repositoryId', 'issueNumber', 'updatedAt'])
    expect(policy.deduplication.existingTaskOrPullRequestBlocksNewTask).toBe(true)
    expect(policy.taskLock.atomicAcquireRequired).toBe(true)
    expect(policy.taskLock.repositoryConcurrencyLock).toBe(true)
    expect(policy.taskLock.staleLockAction).toBe('stop-for-human')
    expect(policy.budget).toEqual({
      maxConcurrency: 1,
      maxIssuesPerPilot: 1,
      maxRetries: 2,
      maxMinutesPerIssue: 45,
      maxReviewCycles: 2,
      allowPaidServices: false,
    })
    expect(policy.fileBounds.requireExactFileAllowlistBeforeEdit).toBe(true)
    expect(policy.fileBounds.maxFiles).toBe(5)
    expect(policy.fileBounds.maxChangedLines).toBe(200)
    expect(policy.fileBounds.highRiskExclusions).toContain('credentials')
    expect(policy.fileBounds.highRiskExclusions).toContain('public-api-breaks')
  })

  it('requires ordered verification gates and draft-only authorized publication', () => {
    expect(policy.gates).toEqual([
      'dry-run',
      'maintainer-approved-low-risk-selection',
      'dedupe-and-lock',
      'reproduction',
      'minimal-fix',
      'tests',
      'independent-review',
      'draft-pr',
    ])
    expect(policy.publication).toEqual({
      draftOnly: true,
      requireExplicitPublishAuthorization: true,
      autoMerge: false,
      release: false,
      deploy: false,
      postIssueComments: false,
      postPrComments: false,
    })
  })

  it('does not preapprove an issue, file edit, test result or PR in the blank record', () => {
    expect(record.repositoryId).toBe(policy.scope.repositoryId)
    expect(record.mode).toBe('dry-run')
    expect(record.status).toBe('unselected')
    expect(record.issueNumber).toBeNull()
    expect(record.approval).toEqual({ actor: null, permission: null, source: null })
    expect(record.exactFileAllowlist).toEqual([])
    expect(record.checks).toEqual([])
    expect(record.publicationAuthorization).toBeNull()
    expect(record.replyAuthorization).toBeNull()
    expect(record.draftPullRequest).toBeNull()
  })
})
