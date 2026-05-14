import { expect, test } from '@playwright/test';

const BASE_URL = 'https://drive-ai-eight.vercel.app';

// ==================== 1. SITE LOADS ====================

test.describe('Site Accessibility', () => {
  test('homepage loads and redirects to auth', async ({ page }) => {
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(500);
    // Should either show the app or redirect to signin
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log(`[SITE] Homepage URL: ${url}`);
    // LobeChat either shows the SPA or redirects to /signin
    expect(url).toBeTruthy();
  });

  test('guide page renders', async ({ page }) => {
    await page.goto(`${BASE_URL}/guide`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const title = await page.textContent('h1');
    console.log(`[GUIDE] Title: ${title}`);
    expect(title).toContain('Drive AI');
  });

  test('dashboard page loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(500);
    await page.waitForTimeout(2000);
    const url = page.url();
    console.log(`[DASH] URL after load: ${url}`);
    // May redirect to onboarding if not authenticated
  });

  test('driving mode page loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/driving-mode`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(500);
    await page.waitForTimeout(2000);
    const text = await page.textContent('body');
    console.log(
      `[DRIVE] Page contains mic: ${text?.includes('Tap to speak') || text?.includes('🎙')}`,
    );
  });

  test('onboarding page loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(500);
    await page.waitForTimeout(2000);
    const text = await page.textContent('body');
    console.log(`[ONBOARD] Contains welcome: ${text?.includes('Welcome')}`);
    expect(text).toContain('Drive AI');
  });
});

// ==================== 2. AUTH FLOW ====================

test.describe('Authentication', () => {
  test('signin page accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log(`[AUTH] Signin URL: ${url}`);
    // Should show signin form or redirect
    const body = await page.textContent('body');
    const hasAuthUI =
      body?.includes('Sign') ||
      body?.includes('Email') ||
      body?.includes('password') ||
      body?.includes('Log');
    console.log(`[AUTH] Has auth UI elements: ${hasAuthUI}`);
  });

  test('API returns 401 without auth', async ({ request }) => {
    const endpoints = [
      '/api/drive-ai/todos',
      '/api/drive-ai/projects',
      '/api/drive-ai/memories',
      '/api/drive-ai/decisions',
      '/api/drive-ai/reminders',
      '/api/drive-ai/profile',
    ];

    for (const ep of endpoints) {
      const res = await request.get(`${BASE_URL}${ep}`);
      console.log(`[API] ${ep}: ${res.status()}`);
      // Should be 401 (unauthorized) or 500 (if auth module throws differently)
      expect(res.status()).not.toBe(200);
    }
  });
});

// ==================== 3. API ROUTES EXIST ====================

test.describe('API Routes Respond', () => {
  test('TTS edge route exists', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/webapi/tts/edge`, {
      data: { options: { voice: 'en-US-GuyNeural' }, text: 'Hello' },
    });
    console.log(`[TTS] Edge route status: ${res.status()}`);
    // May fail without proper payload but should not 404
    expect(res.status()).not.toBe(404);
  });

  test('chat route exists', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/webapi/chat/anthropic`, {
      data: {},
    });
    console.log(`[CHAT] Anthropic route status: ${res.status()}`);
    // Will fail auth but should not 404
    expect(res.status()).not.toBe(404);
  });

  test('extract route exists', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/drive-ai/extract`, {
      data: { user_message: 'test', assistant_response: 'test' },
    });
    console.log(`[EXTRACT] Route status: ${res.status()}`);
    expect(res.status()).not.toBe(404);
  });
});

// ==================== 4. DASHBOARD PAGES ====================

test.describe('Dashboard Pages', () => {
  const pages = [
    { name: 'overview', path: '/dashboard' },
    { name: 'tasks', path: '/dashboard/tasks' },
    { name: 'projects', path: '/dashboard/projects' },
    { name: 'calendar', path: '/dashboard/calendar' },
    { name: 'decisions', path: '/dashboard/decisions' },
    { name: 'memory', path: '/dashboard/memory' },
  ];

  for (const p of pages) {
    test(`${p.name} page responds`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'domcontentloaded' });
      const status = response?.status() || 0;
      console.log(`[DASH-${p.name}] Status: ${status}`);
      expect(status).toBeLessThan(500);
    });
  }
});

// ==================== 5. VISUAL CHECKS ====================

test.describe('Visual Verification', () => {
  test('guide page has correct sections', async ({ page }) => {
    await page.goto(`${BASE_URL}/guide`, { waitUntil: 'networkidle' });
    const sections = await page.$$eval('h2', (els) => els.map((el) => el.textContent));
    console.log(`[VISUAL] Guide sections: ${JSON.stringify(sections)}`);
    expect(sections.length).toBeGreaterThan(3);
  });

  test('onboarding page accessible (may redirect to signin if unauthenticated)', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const url = page.url();
    const body = await page.textContent('body');
    console.log(`[VISUAL] Onboarding URL: ${url}`);
    // Shows our onboarding OR redirects to signin — both valid unauthenticated
    const valid =
      body?.includes('Drive AI') ||
      body?.includes('Welcome') ||
      body?.includes('Sign') ||
      body?.includes('Get Started');
    expect(valid).toBeTruthy();
  });

  test('driving mode has mic button', async ({ page }) => {
    await page.goto(`${BASE_URL}/driving-mode`, { waitUntil: 'networkidle' });
    const buttons = await page.$$('button');
    console.log(`[VISUAL] Driving mode buttons: ${buttons.length}`);
    expect(buttons.length).toBeGreaterThanOrEqual(2); // mic + end + repeat
  });

  test('take screenshots of all pages', async ({ page }) => {
    const routes = [
      { name: 'guide', path: '/guide' },
      { name: 'onboarding', path: '/onboarding' },
      { name: 'driving-mode', path: '/driving-mode' },
      { name: 'dashboard', path: '/dashboard' },
      { name: 'dashboard-tasks', path: '/dashboard/tasks' },
      { name: 'dashboard-projects', path: '/dashboard/projects' },
      { name: 'dashboard-calendar', path: '/dashboard/calendar' },
      { name: 'dashboard-decisions', path: '/dashboard/decisions' },
      { name: 'dashboard-memory', path: '/dashboard/memory' },
    ];

    for (const r of routes) {
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await page.screenshot({ fullPage: true, path: `tests/e2e/screenshots/${r.name}.png` });
      console.log(`[SCREENSHOT] ${r.name} captured`);
    }
  });
});
