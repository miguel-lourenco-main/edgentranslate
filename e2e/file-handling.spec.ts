import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';
import { mkdtempSync, openSync, closeSync, writeSync, ftruncateSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const FIXTURES = path.join(__dirname, 'fixtures');

/** Console errors and warnings, minus noise unrelated to file handling. */
function collectConsoleProblems(page: Page) {
  const problems: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error' && msg.type() !== 'warning') return;
    const text = msg.text();
    // The browser's "Failed to load resource" line has no URL; failed responses are
    // checked below instead, with their URL.
    if (text.startsWith('Failed to load resource')) return;
    problems.push(text);
  });
  page.on('response', response => {
    // /avatar.jpeg 404s under a base path: pre-existing and unrelated (noted in !5).
    if (response.status() >= 400 && !response.url().endsWith('/avatar.jpeg')) {
      problems.push(`HTTP ${response.status()} ${response.url()}`);
    }
  });
  page.on('pageerror', error => problems.push(error.message));
  return problems;
}

async function openHeroForm(page: Page) {
  await page.goto('./');
  const dropzone = page.getByTestId('files-dropzone');
  await dropzone.scrollIntoViewIfNeeded();
  return dropzone;
}

test.describe('dropzone rejection reasons (#2)', () => {
  test('a small file in an unsupported format shows the format message', async ({ page }) => {
    const dropzone = await openHeroForm(page);

    await dropzone.locator('input[type=file]').setInputFiles({
      name: 'installer.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.alloc(1024, 1),
    });

    const toast = page.locator('[data-sonner-toast]').filter({ hasText: 'Unsupported file format' });
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('.docx, .pdf, .pptx');
    await expect(page.getByTestId('file-rejection-error')).toHaveText(/Unsupported file format\. Supported formats: \.docx, \.pdf, \.pptx/);
    await expect(page.getByText(/too (big|large)/i)).toHaveCount(0);
    await expect(dropzone).toHaveAttribute('data-rejected', 'true');
  });

  test('an oversized PDF shows the size message with the limit', async ({ page }) => {
    // Sparse 300 MB file with a PDF header; Playwright needs a path for files this big.
    const dir = mkdtempSync(path.join(tmpdir(), 'edgentranslate-e2e-'));
    const bigPdf = path.join(dir, 'huge-report.pdf');
    const fd = openSync(bigPdf, 'w');
    writeSync(fd, '%PDF-1.4\n');
    ftruncateSync(fd, 300 * 1024 * 1024);
    closeSync(fd);

    try {
      const dropzone = await openHeroForm(page);
      await dropzone.locator('input[type=file]').setInputFiles(bigPdf);

      const toast = page.locator('[data-sonner-toast]').filter({ hasText: 'File is too large' });
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('Max size is 256MB');
      await expect(page.getByTestId('file-rejection-error')).toHaveText('File is too large. Max size is 256MB');
      await expect(page.getByText('Unsupported file format')).toHaveCount(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('a supported file clears the previous rejection', async ({ page }) => {
    const dropzone = await openHeroForm(page);
    const input = dropzone.locator('input[type=file]');

    await input.setInputFiles({ name: 'notes.exe', mimeType: 'application/x-msdownload', buffer: Buffer.alloc(16) });
    await expect(page.getByTestId('file-rejection-error')).toBeVisible();

    await input.setInputFiles(path.join(FIXTURES, 'sample.docx'));
    await expect(page.getByTestId('file-rejection-error')).toHaveCount(0);
    await expect(dropzone).not.toHaveAttribute('data-rejected', 'true');
  });
});

/** Uploads files in the hero form, submits, and opens the compare dialog for `fileName` on /app. */
async function openCompareFromHero(page: Page, files: Parameters<ReturnType<Page['locator']>['setInputFiles']>[0], fileName: string) {
  const dropzone = await openHeroForm(page);
  await dropzone.locator('input[type=file]').setInputFiles(files);

  // The demo "upload" takes 3 s before the submit button enables.
  const submit = page.locator('form button[type=submit]').filter({ hasText: 'Translate files' });
  await expect(submit).toBeEnabled({ timeout: 15_000 });
  await submit.click();

  await page.waitForURL(/\/app\/?$/);
  const row = page.getByRole('row').filter({ hasText: fileName });
  await expect(row).toBeVisible();
  const view = row.locator('button:has(svg.lucide-eye)');
  await expect(view).toBeEnabled({ timeout: 15_000 });
  await view.click();
  return page.getByRole('dialog');
}

test.describe('compare view by document type (#5)', () => {
  test('a .docx renders on both sides with no console error', async ({ page }) => {
    const problems = collectConsoleProblems(page);
    const dialog = await openCompareFromHero(page, path.join(FIXTURES, 'sample.docx'), 'sample.docx');

    const viewers = dialog.getByTestId('docx-viewer');
    await expect(viewers).toHaveCount(2);
    for (const viewer of await viewers.all()) {
      await expect(viewer.getByText('Quarterly Operations Summary')).toBeVisible();
      await expect(viewer.locator('table')).toHaveCount(1);
    }
    expect(problems.filter(p => /InvalidPDF|Invalid PDF/i.test(p))).toEqual([]);
    expect(problems).toEqual([]);
  });

  test('a .pptx shows the unsupported-preview state', async ({ page }) => {
    const problems = collectConsoleProblems(page);
    const dialog = await openCompareFromHero(page, path.join(FIXTURES, 'sample.pptx'), 'sample.pptx');

    const states = dialog.getByTestId('document-preview-unavailable');
    await expect(states).toHaveCount(2);
    await expect(states.first()).toContainText('Preview is not available for PPTX files yet');

    const download = page.waitForEvent('download');
    await states.first().getByRole('button', { name: 'Download file' }).click();
    expect((await download).suggestedFilename()).toBe('sample.pptx');
    expect(problems).toEqual([]);
  });

  test('a mislabelled file shows "could not render" instead of throwing', async ({ page }) => {
    const problems = collectConsoleProblems(page);
    const dialog = await openCompareFromHero(
      page,
      { name: 'not-really.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: Buffer.from('plain text, not a zip') },
      'not-really.docx',
    );

    await expect(dialog.getByTestId('document-could-not-render')).toHaveCount(2);
    expect(problems).toEqual([]);
  });

  test('the PDF samples still render in the hero compare view', async ({ page }) => {
    const problems = collectConsoleProblems(page);
    await page.goto('./');
    // Both sides of the first sample render at least one page canvas.
    const documents = page.locator('.react-pdf__Document');
    await expect(documents).toHaveCount(2, { timeout: 30_000 });
    await expect(documents.nth(0).locator('canvas').first()).toBeVisible({ timeout: 30_000 });
    await expect(documents.nth(1).locator('canvas').first()).toBeVisible({ timeout: 30_000 });
    expect(problems.filter(p => /InvalidPDF|Invalid PDF/i.test(p))).toEqual([]);
  });
});
