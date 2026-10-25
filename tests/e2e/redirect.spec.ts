import { test, expect } from '@playwright/test'

test('redirects a short link and records its UTM values against an isolated API', async ({ page, request }) => {
  await request.delete('http://127.0.0.1:3101/visits')
  await page.goto('/hello?utm_source=newsletter&utm_campaign=upgrade')
  await expect(page.getByRole('heading', { name: 'Test destination' })).toBeVisible()
  const visits = await request.get('http://127.0.0.1:3101/visits')
  expect(await visits.json()).toContainEqual({ url_id: 7, utm_source: 'newsletter', utm_campaign: 'upgrade' })
})

test('returns 404 without recording a visit for a missing short link', async ({ request }) => {
  await request.delete('http://127.0.0.1:3101/visits')
  const response = await request.get('/missing')
  expect(response.status()).toBe(404)
  const visits = await request.get('http://127.0.0.1:3101/visits')
  expect(await visits.json()).toEqual([])
})
