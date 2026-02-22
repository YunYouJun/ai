import { describe, expect, it } from 'vitest'

/**
 * Demo test suite showcasing basic Vitest usage.
 */
describe('demo', () => {
  it('should perform basic arithmetic', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const greeting = `Hello, ${'YunYouJun'}`
    expect(greeting).toBe('Hello, YunYouJun')
    expect(greeting).toContain('YunYouJun')
  })

  it('should work with arrays', () => {
    const tools = ['vite', 'vitest', 'vitepress']
    expect(tools).toHaveLength(3)
    expect(tools).toContain('vitest')
  })

  it('should work with objects', () => {
    const config = { name: '@yunyoujun/ai', private: true }
    expect(config).toMatchObject({ name: '@yunyoujun/ai' })
    expect(config).toHaveProperty('private', true)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve(42)
    expect(result).toBe(42)
  })
})
