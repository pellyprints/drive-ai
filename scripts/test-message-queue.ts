/**
 * Manual test script for Message Queue feature (LOBE-6001)
 *
 * Tests that:
 * 1. Input stays enabled during agent execution
 * 2. Messages sent during execution are queued and injected
 *
 * Usage: bunx tsx scripts/test-message-queue.ts
 */
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function main() {
  console.log('🚀 Starting Message Queue test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // Enable debug logging from the app
  page.on('console', (msg) => {
    const text = msg.text();
    if (
      text.includes('message-queue') ||
      text.includes('streaming-executor') ||
      text.includes('Injecting') ||
      text.includes('enqueue')
    ) {
      console.log(`  [app] ${text}`);
    }
  });

  // Navigate to the app — go directly to chat with default agent
  console.log('📍 Navigating to app...');
  await page.goto(`${BASE_URL}/chat?lng=zh-CN`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✅ App loaded\n');

  await page.screenshot({ path: '/tmp/mq-test-1-loaded.png' });
  console.log('📸 Screenshot: /tmp/mq-test-1-loaded.png');

  // Look for the chat input — it's a contenteditable div inside the chat area
  console.log('\n📍 Looking for chat input...');

  // Try multiple selectors
  let chatInput = page.locator('[contenteditable="true"]').first();
  let visible = await chatInput.isVisible().catch(() => false);

  if (!visible) {
    // Try clicking on the chat area first to make input appear
    console.log('  Trying to find input area by role...');
    chatInput = page.locator('div[role="textbox"]').first();
    visible = await chatInput.isVisible().catch(() => false);
  }

  if (!visible) {
    // Maybe we need to click somewhere to activate the input
    console.log('  Looking for any text input area...');
    chatInput = page.locator('.lobe-editor-content, .ProseMirror, [data-placeholder]').first();
    visible = await chatInput.isVisible().catch(() => false);
  }

  console.log(`  Chat input visible: ${visible}`);

  if (!visible) {
    console.log('\n⚠️  Chat input not found. Taking screenshot...');
    await page.screenshot({ path: '/tmp/mq-test-2-no-input.png' });
    console.log('📸 Screenshot: /tmp/mq-test-2-no-input.png');
    console.log('\n🔍 Keeping browser open for 120s for manual inspection...');
    await page.waitForTimeout(120000);
    await browser.close();
    return;
  }

  // Test 1: Type and verify input is available
  console.log('\n📍 Test 1: Verify input is always enabled');
  await chatInput.click();
  await page.waitForTimeout(500);
  await page.keyboard.type('请帮我搜索一下今天的天气', { delay: 30 });
  await page.screenshot({ path: '/tmp/mq-test-3-typed.png' });
  console.log('📸 Screenshot: /tmp/mq-test-3-typed.png');

  // Send the message
  console.log('\n📍 Sending first message...');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/mq-test-4-sent.png' });
  console.log('📸 Screenshot: /tmp/mq-test-4-sent.png');

  // Test 2: While agent is responding, try to type and send another message
  console.log('\n📍 Test 2: Send second message while agent is running...');
  await page.waitForTimeout(1000);

  // Check if input is still enabled (the key test!)
  const inputAfterSend = page.locator('[contenteditable="true"]').first();
  const stillVisible = await inputAfterSend.isVisible().catch(() => false);
  console.log(`  Input still visible after sending: ${stillVisible}`);

  if (stillVisible) {
    await inputAfterSend.click();
    await page.waitForTimeout(300);
    await page.keyboard.type('另外也查一下明天的', { delay: 50 });
    await page.screenshot({ path: '/tmp/mq-test-5-second-msg.png' });
    console.log('📸 Screenshot: /tmp/mq-test-5-second-msg.png');

    // Send second message (should be queued)
    await page.keyboard.press('Enter');
    console.log('  ✅ Second message sent (should be queued)');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/mq-test-6-queued.png' });
    console.log('📸 Screenshot: /tmp/mq-test-6-queued.png');
  } else {
    console.log('  ❌ Input is disabled/hidden after sending — queue feature may not be working');
  }

  // Wait and observe the result
  console.log('\n📍 Waiting for agent to finish and process queued message...');
  await page.waitForTimeout(15000);
  await page.screenshot({ path: '/tmp/mq-test-7-result.png' });
  console.log('📸 Screenshot: /tmp/mq-test-7-result.png');

  console.log('\n✅ Test sequence complete.');
  console.log('🔍 Keeping browser open for 120s for manual verification...\n');
  await page.waitForTimeout(120000);
  await browser.close();
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
