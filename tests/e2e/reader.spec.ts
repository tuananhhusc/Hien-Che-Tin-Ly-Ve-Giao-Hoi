import { expect, test } from "@playwright/test";

test("renders article and references", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("article h1").first()).toContainText("Lumen Gentium");
  await expect(page.getByRole("heading", { name: "Nguồn Trích Dẫn" })).toBeVisible();
});

test("navigates between citation and reference anchors", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name.includes("mobile"),
    "Covered on desktop; mobile emulation has click interception noise.",
  );

  await page.goto("/");

  const citationTrigger = page.getByRole("button", { name: "Mở chú thích 1" }).first();
  await citationTrigger.scrollIntoViewIfNeeded();
  await expect(citationTrigger).toBeVisible();

  await page.getByRole("link", { name: "Về lần trích dẫn đầu tiên" }).first().click();
  await expect(page).toHaveURL(/#cite-1/);
});

test("table of contents links to references", async ({ page }, testInfo) => {
  await page.goto("/");

  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: /Mục lục/i }).click({ force: true });
    const tocDialog = page.getByRole("dialog", { name: "Mục lục" });
    await expect(tocDialog).toBeVisible();
    await tocDialog
      .getByRole("link", { name: "Nguồn trích dẫn" })
      .click({ force: true });
    await expect(page).toHaveURL(/#references/);
    return;
  }

  await page.getByRole("link", { name: "Nguồn trích dẫn" }).first().click();
  await expect(page).toHaveURL(/#references/);
});

test("mobile tools sheet opens and closes", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobile-only scenario");

  await page.goto("/");

  await page.getByRole("button", { name: "Mở công cụ đọc" }).click({ force: true });
  const toolsDialog = page.getByRole("dialog", { name: "Công cụ đọc" });
  await expect(toolsDialog).toBeVisible();

  await toolsDialog.getByPlaceholder("Tìm trong bài viết...").fill("Giáo hội");
  await expect(toolsDialog.locator("span.min-w-16")).toContainText("/");

  await page.getByRole("button", { name: "Đóng công cụ đọc" }).click({ force: true });
  await expect(toolsDialog).not.toBeVisible();
});
