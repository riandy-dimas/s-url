import { afterEach, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@supabase/ssr', () => ({
  createServerClient: (_url: string, _key: string, options: {
    cookies: { getAll: () => { name: string; value: string }[]; setAll: (values: unknown[]) => void }
  }) => ({
    auth: {
      getUser: async () => {
        const session = options.cookies.getAll().find((cookie) => cookie.name === 'session')
        options.cookies.setAll([{ name: 'session', value: `${session?.value}-refreshed`, options: { httpOnly: true, path: '/' } }])
        return { data: { user: null }, error: null }
      },
    },
  }),
}))
import { proxy } from '../proxy'

afterEach(() => vi.unstubAllEnvs())

it('refreshes request and response cookies independently for concurrent requests', async () => {
  vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co')
  vi.stubEnv('SUPABASE_ANON_KEY', 'test-public-key')
  const requests = ['alice', 'bob'].map((value) => new NextRequest('https://short.example/link', {
    headers: { cookie: `session=${value}` },
  }))
  const responses = await Promise.all(requests.map(proxy))
  for (const [index, value] of ['alice', 'bob'].entries()) {
    expect(requests[index].cookies.get('session')?.value).toBe(`${value}-refreshed`)
    expect(responses[index].cookies.get('session')).toMatchObject({ value: `${value}-refreshed`, httpOnly: true })
  }
})
