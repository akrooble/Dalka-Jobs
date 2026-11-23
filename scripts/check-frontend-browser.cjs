// Optional local QA tool: npm install --prefix .local/frontend-qa --ignore-scripts --save-exact playwright@1.65.1
// Uses an isolated installed Chrome profile and the fictional loopback preview only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('../.local/frontend-qa/node_modules/playwright');

const origin = 'http://127.0.0.1:3100';
const mode = process.argv[2] || 'all';
assert.ok(['all', 'layout', 'journeys'].includes(mode), 'Use all, layout or journeys');
assert.notEqual(process.env.DALKA_WEBSITE_MODE, 'live', 'Refuse live mode');
const output = path.resolve(__dirname, '../output/qa/2026-11-22-frontend/browser');
fs.mkdirSync(output, { recursive: true });
const report = { started: new Date().toISOString(), mode, origin, browser: '', checks: [], failures: [], runtimeErrors: [], blockedRequests: [], samplesOnly: true };
let browser;
let page;

async function check(name, action) {
  try {
    await action();
    report.checks.push(name);
    console.log('PASS: ' + name);
  } catch (error) {
    report.failures.push({ name, message: error.message });
    console.log('FAIL: ' + name + ': ' + error.message.slice(0, 900));
    await page.screenshot({ path: path.join(output, 'failure-' + name.replace(/[^a-z0-9-]/gi, '-').slice(0, 95) + '.png'), fullPage: true }).catch(() => {});
  }
}

async function open(url) {
  const response = await page.goto(origin + url, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, url);
  await page.locator('main').waitFor();
}

async function clickLink(href) {
  await page.locator('a[href="' + href + '"]:visible').first().click();
  await page.waitForLoadState('networkidle');
}

async function text(locator, expression) {
  await locator.filter({ hasText: expression }).first().waitFor();
}

async function layout() {
  const { adminSections, extraAdminSections, accountSections } = await import('../web/lib/frontend-demo.ts');
  const { demoJobs } = await import('../web/lib/demo-jobs.ts');
  const { prototypeScreens, prototypeHref } = await import('../web/lib/prototype.ts');
  const routes = [...new Set(['/', '/admin', '/admin/sign-in', ...adminSections.map(section => '/admin/' + section[0]), ...extraAdminSections.map(section => '/admin/' + section), '/account', ...accountSections.map(section => '/account/' + section), '/preview-job?id=sample-01', ...['jobs', 'candidates', 'rejected', 'progress'].map(section => '/workspace/company/' + section), ...['jobs', 'candidates', 'interviews', 'candidate'].map(section => '/workspace/recruiter/' + section), ...['about', 'contact', 'privacy', 'terms', 'ui-preview', 'prototype'].map(section => '/' + section), ...demoJobs.map(job => '/jobs/' + job.slug), ...prototypeScreens.map(prototypeHref)])];
  const screenshotRoutes = ['/', '/jobs/' + demoJobs[1].slug, '/account/sign-in', '/account/profile', '/account/applications', '/admin', '/admin/job-editor', '/admin/recruitment', '/admin/invoice-detail?id=sample-invoice-01', '/workspace/company/candidates', '/workspace/recruiter/candidates'];
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 960 });
    for (const route of routes) {
      await check('layout ' + width + ' ' + route, async () => {
        await open(route);
        assert.equal(await page.locator('main').count(), 1, 'One main landmark');
        assert.equal(await page.locator('main h1').count(), 1, 'One primary page heading');
        const overflow = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth, elements: [...document.querySelectorAll('body *')].filter(element => { const r = element.getBoundingClientRect(); return r.width && (r.right > innerWidth + 2 || r.left < -2) && getComputedStyle(element).position !== 'absolute' && !element.closest('.ui-table-wrap'); }).slice(0, 8).map(element => ({ tag: element.tagName, className: element.className })) }));
        assert.ok(overflow.width <= overflow.viewport + 1, 'Horizontal page overflow: ' + JSON.stringify(overflow));
        const unlabeled = await page.locator('input:not([type="hidden"]),select,textarea').evaluateAll(elements => elements.filter(element => !element.labels?.length && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')).map(element => element.id || element.outerHTML.slice(0, 100)));
        assert.deepEqual(unlabeled, [], 'Form controls need accessible labels');
        const sensitive = page.locator('input[type="password"]:enabled,input[type="file"]:enabled');
        assert.equal(await sensitive.count(), 0, 'No real credential/file collection in sample pages');
        if (screenshotRoutes.includes(route)) await page.screenshot({ path: path.join(output, width + '-' + (route === '/' ? 'home' : route.replace(/[^a-z0-9-]/gi, '-')) + '.png'), fullPage: true });
      });
    }
  }
}

async function journeys() {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await check('A02 search filters empty reset and results focus', async () => {
    await open('/');
    const initial = await page.locator('.job-card').count();
    assert.ok(initial > 0);
    await page.getByLabel('Search by job title, keyword or employer').fill('NoMatchingFictionalOpportunity');
    await page.getByRole('button', { name: 'Search jobs' }).click();
    await page.getByRole('heading', { name: 'No matches just yet.' }).waitFor();
    assert.equal(await page.locator('.job-card').count(), 0);
    assert.ok(await page.locator('.results-header h2').evaluate(element => element === document.activeElement));
    await page.getByRole('button', { name: 'Clear filters and explore' }).click();
    assert.equal(await page.locator('.job-card').count(), initial);
    await page.locator('#location').selectOption('Baidoa');
    assert.equal(await page.locator('.job-card').count(), 1);
    await page.getByRole('button', { name: 'Clear all filters' }).click();
    await page.locator('#sort').selectOption('closing');
    assert.equal(await page.locator('.job-card').count(), initial);
  });

  await check('S02 modal focus trap Escape return and validation links', async () => {
    await open('/ui-preview');
    const trigger = page.getByRole('button', { name: 'Open example dialog' });
    await trigger.click();
    await page.getByRole('dialog').waitFor();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      assert.ok(await page.locator('dialog[open]').evaluate(element => element.contains(document.activeElement)), 'Modal keyboard focus must remain inside');
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    assert.ok(await trigger.evaluate(element => element === document.activeElement), 'Focus returns to trigger');
    await page.getByRole('button', { name: 'Validate example', exact: true }).click();
    assert.ok(await page.locator('#example-validation').evaluate(element => element === document.activeElement));
    await page.locator('#example-validation a').first().click();
    assert.ok(await page.locator('#example-name').evaluate(element => element === document.activeElement));
  });

  await check('S02 mobile filter modal and workspace navigation', async () => {
    await page.setViewportSize({ width: 375, height: 900 });
    await open('/');
    const trigger = page.getByRole('button', { name: /^Filters/ });
    await trigger.click();
    await page.locator('#mobile-location').selectOption('Baidoa');
    await page.getByRole('button', { name: 'Show 1 sample jobs' }).click();
    assert.equal(await page.locator('dialog[open]').count(), 0);
    assert.equal(await page.locator('.job-card').count(), 1);
    assert.ok(await page.locator('.results-header h2').evaluate(element => element === document.activeElement));
    await open('/admin');
    await page.getByRole('button', { name: /Administration menu/ }).click();
    await page.locator('#mobile-workspace-menu a[href="/admin/jobs"]').click();
    await page.getByRole('heading', { name: 'Make the next opportunity count.' }).waitFor();
    assert.equal(await page.getByRole('button', { name: /Administration menu/ }).getAttribute('aria-expanded'), 'false');
    await page.setViewportSize({ width: 1440, height: 1000 });
  });

  await check('A04 company create edit linked job draft publish archive reset', async () => {
    await open('/admin/companies');
    await page.getByRole('button', { name: '+ Add company', exact: true }).click();
    await page.getByLabel('Company name', { exact: true }).fill('Fictional QA Company');
    await page.getByRole('button', { name: 'Save sample company' }).click();
    await text(page.getByRole('row'), 'Fictional QA Company');
    await page.getByRole('row').filter({ hasText: 'Fictional QA Company' }).getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByLabel('About the company').fill('A fictional organisation for frontend acceptance only.');
    await page.getByRole('button', { name: 'Save sample company' }).click();
    await clickLink('/admin/jobs');
    await page.getByRole('link', { name: '+ Create job' }).click();
    await page.getByLabel('Job title', { exact: true }).fill('Fictional QA Opportunity');
    await page.getByLabel('Company', { exact: true }).selectOption({ label: 'Fictional QA Company' });
    await page.getByLabel('About the role').fill('An entirely fictional opportunity used to verify the frontend journey.');
    await page.getByLabel('Responsibilities', { exact: true }).fill('Review fictional records');
    await page.getByLabel('Requirements', { exact: true }).fill('Illustrative sample experience');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    let row = page.getByRole('row').filter({ hasText: 'Fictional QA Opportunity' });
    await row.waitFor();
    assert.match(await row.innerText(), /Draft/);
    await row.getByRole('link', { name: 'Edit', exact: true }).click();
    await page.getByRole('button', { name: 'Preview content', exact: true }).click();
    await page.getByRole('dialog').getByText('Fictional QA Opportunity', { exact: true }).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Publish sample job' }).click();
    row = page.getByRole('row').filter({ hasText: 'Fictional QA Opportunity' });
    assert.match(await row.innerText(), /Published/);
    await row.getByRole('button', { name: 'Archive', exact: true }).click();
    await page.getByRole('button', { name: 'Archive sample job', exact: true }).click();
    assert.match(await row.innerText(), /Archived/);
    await page.getByRole('button', { name: 'Reset sample data', exact: true }).click();
    await page.getByRole('button', { name: 'Reset sample workspace', exact: true }).click();
    assert.equal(await page.getByRole('row').filter({ hasText: 'Fictional QA Opportunity' }).count(), 0);
  });

  await check('A05 applicant validation CV application duplicate and tracker', async () => {
    await open('/account/apply?job=sample-04');
    await page.getByLabel('Why does this sample role interest you?').fill('Fictional community experience for this QA sample application.');
    await page.getByRole('button', { name: 'Add sample application' }).click();
    await text(page.getByRole('alert'), 'Attach the built-in sample CV');
    await clickLink('/account/profile');
    await page.getByLabel('Sample full name').fill('Q');
    await page.getByRole('button', { name: 'Save sample profile' }).click();
    await text(page.getByRole('alert'), 'at least three');
    assert.ok(await page.getByRole('alert').evaluate(element => element === document.activeElement));
    await page.getByLabel('Sample full name').fill('Sample QA Applicant');
    await page.getByRole('button', { name: 'Attach built-in sample CV' }).click();
    await page.getByRole('button', { name: 'Save sample profile' }).click();
    await clickLink('/#jobs');
    const jobLink = page.locator('.job-card a').filter({ hasText: 'Programme Coordinator' });
    await jobLink.first().click();
    await page.getByRole('link', { name: 'Try sample application' }).click();
    await page.getByLabel('Why does this sample role interest you?').fill('Fictional community experience for this QA sample application.');
    await page.getByRole('button', { name: 'Add sample application' }).click();
    await text(page.getByRole('alert'), 'checkbox');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Add sample application' }).click();
    await page.getByRole('heading', { name: 'Application summary', exact: true }).waitFor();
    await clickLink('/account/applications');
    assert.equal(await page.locator('.application-record').count(), 2);
    await clickLink('/#jobs');
    await page.locator('.job-card a').filter({ hasText: 'Programme Coordinator' }).first().click();
    await page.getByRole('link', { name: 'Try sample application' }).click();
    await page.getByLabel('Why does this sample role interest you?').fill('A second fictional sample attempt must not create a duplicate.');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Add sample application' }).click();
    await text(page.getByRole('alert'), 'already');
  });

  await check('A06 recruiter notes stage update notification and assignment scope', async () => {
    await open('/workspace/recruiter/jobs');
    await page.getByRole('link', { name: /View candidates/ }).first().click();
    assert.ok(page.url().includes('job=sample-02'));
    await page.getByRole('row').filter({ hasText: 'Sample Candidate C' }).getByRole('link', { name: /Review candidate/ }).click();
    await page.getByLabel('Add an internal note').fill('Q');
    await page.getByRole('button', { name: 'Add sample note' }).click();
    const notes = page.locator('section.desk-card').filter({ has: page.getByRole('heading', { name: 'Private staff notes', exact: true }) });
    await text(notes.getByRole('alert'), 'at least three');
    assert.equal(await page.getByLabel('Add an internal note').getAttribute('aria-invalid'), 'true');
    await notes.getByRole('alert').getByRole('link').click();
    assert.ok(await page.getByLabel('Add an internal note').evaluate(element => element === document.activeElement));
    await page.getByLabel('Add an internal note').fill('Fictional private QA note');
    await page.getByRole('button', { name: 'Add sample note' }).click();
    await notes.getByText('Fictional private QA note', { exact: true }).waitFor();
    await page.getByLabel('Application stage').selectOption('Shortlisted');
    await page.getByRole('button', { name: 'Update sample progress' }).click();
    await page.getByRole('link', { name: /Candidate pipeline/ }).click();
    assert.ok(page.url().includes('job=sample-02'));
    await clickLink('/account');
    await clickLink('/account/applications');
    assert.match(await page.locator('.application-record').innerText(), /Shortlisted/);
    assert.ok(!(await page.locator('main').innerText()).includes('Fictional private QA note'));
    await clickLink('/account/notifications');
    await text(page.locator('.desk-message'), 'Shortlisted');
    await page.getByRole('button', { name: 'Mark all as read' }).click();
    assert.equal(await page.getByRole('button', { name: 'Mark as read', exact: true }).count(), 0);
  });

  await check('A07 company membership change and revocation update the workspace', async () => {
    await open('/admin/users');
    let row = page.getByRole('row').filter({ hasText: 'Sample Company Admin' });
    await row.getByRole('button', { name: 'Edit role' }).click();
    await page.getByLabel('Company', { exact: true }).selectOption({ label: 'Wadajir Development Network' });
    await page.getByRole('button', { name: 'Save sample member' }).click();
    await clickLink('/workspace/company/jobs');
    await text(page.locator('main'), 'Wadajir Development Network');
    await page.getByRole('link', { name: /View candidates/ }).first().click();
    await text(page.getByRole('row'), 'Sample Candidate F');
    assert.equal(await page.getByRole('row').filter({ hasText: 'Sample Candidate B' }).count(), 0);
    await clickLink('/');
    await clickLink('/admin');
    await clickLink('/admin/users');
    row = page.getByRole('row').filter({ hasText: 'Sample Company Admin' });
    await row.getByRole('button', { name: 'Edit role' }).click();
    await page.getByRole('checkbox', { name: 'Active in the sample directory' }).uncheck();
    await page.getByRole('button', { name: 'Save sample member' }).click();
    await clickLink('/workspace/company/jobs');
    await page.getByRole('heading', { name: 'This sample workspace is unavailable.' }).waitFor();
  });

  await check('A09 invoice lock partial payment overpayment and A10 print', async () => {
    await open('/admin/invoices');
    await page.getByRole('link', { name: /DJ-2026-0001/ }).click();
    await page.getByRole('button', { name: 'Record sample payment', exact: true }).click();
    await page.getByLabel('Amount (USD)').fill('10.00');
    await page.getByRole('dialog').getByRole('button', { name: 'Record sample payment', exact: true }).click();
    await text(page.locator('#print-invoice'), 'USD 140.00');
    assert.equal(await page.getByRole('link', { name: 'Edit draft', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Record sample payment', exact: true }).click();
    await page.getByLabel('Amount (USD)').fill('999999.00');
    await page.getByRole('dialog').getByRole('button', { name: 'Record sample payment', exact: true }).click();
    await text(page.getByRole('alert'), 'cannot exceed');
    await page.keyboard.press('Escape');
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.desk-sidebar').isVisible(), false);
    assert.equal(await page.locator('.desk-header').isVisible(), false);
    assert.equal(await page.getByRole('heading', { name: 'Invoice actions', exact: true }).isVisible(), false);
    assert.ok(await page.locator('#print-invoice').isVisible());
    await page.pdf({ path: path.join(output, 'sample-invoice.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.screenshot({ path: path.join(output, 'invoice-print.png'), fullPage: true });
    await page.emulateMedia({ media: 'screen' });
  });
}

(async () => {
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    report.browser = browser.version();
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin || url.pathname.startsWith('/api/')) {
        report.blockedRequests.push({ method: route.request().method(), origin: url.origin, path: url.pathname });
        return route.abort();
      }
      await route.continue();
    });
    page = await context.newPage();
    page.setDefaultTimeout(12000);
    page.on('pageerror', error => report.runtimeErrors.push({ url: page.url(), message: error.message }));
    await open('/');
    assert.match(await page.locator('.preview-notice').innerText(), /fictional samples/, 'Refuse to mutate a non-sample website');
    if (mode !== 'journeys') await layout();
    if (mode !== 'layout') await journeys();
    assert.deepEqual(report.runtimeErrors, [], 'No uncaught browser errors');
    assert.deepEqual(report.blockedRequests, [], 'Sample frontend must not request APIs or external services');
    assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), [], 'No persisted sample state');
  } catch (error) {
    report.failures.push({ name: 'runner', message: error.message });
    console.error(error);
  } finally {
    report.finished = new Date().toISOString();
    fs.writeFileSync(path.join(output, mode + '-report.json'), JSON.stringify(report, null, 2));
    if (browser) await browser.close();
    console.log(JSON.stringify({ passed: report.checks.length, failed: report.failures.length, runtimeErrors: report.runtimeErrors.length, externalOrApiRequests: report.blockedRequests.length, output }));
    if (report.failures.length) process.exitCode = 1;
  }
})();
