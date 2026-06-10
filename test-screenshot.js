const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[browser console] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[browser error] ${err.message}`);
  });

  page.on('request', request => {
    if (request.url().includes('3d-models') || request.url().includes('draco')) {
      console.log(`[request] ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('3d-models') || response.url().includes('draco')) {
      console.log(`[response] ${response.url()} -> ${response.status()}`);
    }
  });

  console.log('Navigating to http://localhost:3000/...');
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 30000 });
    console.log('Waiting 20 seconds for 3D models to load and render...');
    await page.waitForTimeout(20000);
    
    const screenshotPath = path.join(__dirname, 'landing-test.png');
    console.log(`Saving screenshot to ${screenshotPath}...`);
    await page.screenshot({ path: screenshotPath });
    console.log('Done!');
  } catch (err) {
    console.error('Error occurred:', err);
  } finally {
    await browser.close();
  }
})();
