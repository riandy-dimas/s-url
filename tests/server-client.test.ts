import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ cookies: vi.fn(), createServerClient: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: mocks.cookies }))
vi.mock('@supabase/ssr', () => ({ createServerClient: mocks.createServerClient }))
import { createClient } from '../utils/supabase/server'

afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs() })

describe('server client with asynchronous cookies', () => {
  it('waits for the request cookie store and passes cookie updates through', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('SUPABASE_ANON_KEY', 'test-public-key')
    const store = { getAll: vi.fn(() => [{ name: 'session', value: 'original' }]), set: vi.fn() }
    let resolveStore!: (value: typeof store) => void
    mocks.cookies.mockReturnValue(new Promise<typeof store>((resolve) => { resolveStore = resolve }))
    mocks.createServerClient.mockReturnValue({ auth: {} })
    const pendingClient = createClient()
    expect(mocks.createServerClient).not.toHaveBeenCalled()
    resolveStore(store)
    await pendingClient
    const options = mocks.createServerClient.mock.calls[0][2]
    expect(options.cookies.getAll()).toEqual([{ name: 'session', value: 'original' }])
    options.cookies.setAll([{ name: 'session', value: 'refreshed', options: { httpOnly: true } }])
    expect(store.set).toHaveBeenCalledWith('session', 'refreshed', { httpOnly: true })
  })
})
