import { afterEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), insert: vi.fn() }))
vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => ({
    from: (table: string) => table === 'urls'
      ? { select: () => ({ eq: mocks.lookup }) }
      : { insert: mocks.insert },
  }),
}))
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NOT_FOUND') } }))
vi.mock('@/utils/Redirect', () => ({ default: () => null }))
import Main from '../app/[shortId]/page'

afterEach(() => vi.resetAllMocks())

it('awaits route parameters and records only supported scalar UTM values', async () => {
  mocks.lookup.mockResolvedValue({ data: [{ id: 7, long_url: 'https://example.com' }], error: null })
  await Main({
    params: Promise.resolve({ shortId: 'hello' }),
    searchParams: Promise.resolve({ utm_source: 'newsletter', utm_medium: 'email', utm_campaign: ['ignored'], extra: 'ignored' }),
  })
  expect(mocks.lookup).toHaveBeenCalledWith('short_id', 'hello')
  expect(mocks.insert).toHaveBeenCalledWith({ url_id: 7, utm_source: 'newsletter', utm_medium: 'email' })
})

it('returns not found without recording analytics for an unknown short link', async () => {
  mocks.lookup.mockResolvedValue({ data: [], error: null })
  await expect(Main({ params: Promise.resolve({ shortId: 'missing' }) })).rejects.toThrow('NOT_FOUND')
  expect(mocks.insert).not.toHaveBeenCalled()
})
