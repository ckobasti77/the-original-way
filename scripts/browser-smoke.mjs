import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium, webkit } from "playwright";

const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);
const screenshotDir = process.env.QA_SCREENSHOT_DIR;
const engines = [
  ["chromium", chromium],
  ["webkit", webkit],
];
const viewports = [
  ["desktop", { width: 1440, height: 900, isMobile: false, hasTouch: false }],
  ["mobile", { width: 390, height: 844, isMobile: true, hasTouch: true }],
];
const storefrontRoutes = [
  "/sr/proizvodi",
  "/sr/kolekcije",
  "/sr/o-nama",
  "/sr/kontakt",
  "/sr/prijava",
  "/sr/registracija",
  "/sr/checkout",
  "/sr/profil",
];
const results = [];

if (screenshotDir) {
  await mkdir(screenshotDir, { recursive: true });
}

for (const [engineName, engine] of engines) {
  const browser = await engine.launch({ headless: true });

  try {
    for (const [viewportName, viewport] of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.isMobile,
        hasTouch: viewport.hasTouch,
      });
      const page = await context.newPage();
      const errors = [];

      page.on("pageerror", (error) => {
        errors.push(`pageerror: ${error.message}`);
      });
      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(`console: ${message.text()}`);
        }
      });

      const response = await page.goto(`${baseUrl}/sr`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(1_500);

      const introMetrics = await page.evaluate(() => {
        const characters = [
          ...document.querySelectorAll(".char-inner"),
        ];
        const frameCanvas = document.querySelector(
          ".story-stage canvas",
        );
        const frameContext = frameCanvas?.getContext("2d");
        const centerPixel =
          frameCanvas && frameContext
            ? frameContext.getImageData(
                Math.floor(frameCanvas.width / 2),
                Math.floor(frameCanvas.height / 2),
                1,
                1,
              ).data
            : null;

        return {
          characterCount: characters.length,
          visibleCharacterCount: characters.filter(
            (element) => Number.parseFloat(getComputedStyle(element).opacity) > 0.5,
          ).length,
          firstCharacter: characters[0]
            ? {
                opacity: getComputedStyle(characters[0]).opacity,
                transform: getComputedStyle(characters[0]).transform,
              }
            : null,
          frameCanvas: frameCanvas
            ? {
                width: frameCanvas.width,
                height: frameCanvas.height,
                frame: frameCanvas.getAttribute("data-frame"),
                centerAlpha: centerPixel?.[3] ?? null,
                backgroundImage: getComputedStyle(frameCanvas).backgroundImage,
              }
            : null,
        };
      });

      await page.waitForFunction(
        () =>
          document
            .querySelector(".story-stage canvas")
            ?.getAttribute("data-frame") === "61",
        undefined,
        { timeout: 15_000 },
      );

      if (screenshotDir) {
        await page.screenshot({
          path: path.join(
            screenshotDir,
            `${engineName}-${viewportName}-intro.png`,
          ),
          fullPage: false,
        });
      }

      if (viewportName === "desktop") {
        await page.waitForTimeout(500);
        await page.mouse.move(
          Math.floor(viewport.width / 2),
          Math.floor(viewport.height / 2),
        );
        await page.mouse.wheel(0, 1_000);
        await page.waitForSelector(".story-float [data-glass-active]", {
          state: "attached",
          timeout: 10_000,
        });
        await page.waitForTimeout(1_800);
      }

      const metrics = await page.evaluate(() => {
        const glassCards = [
          ...document.querySelectorAll(".story-float [data-glass-active]"),
        ];

        return {
          horizontalOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1,
          storyCanvasCount:
            document.querySelectorAll(".story-float canvas").length,
          glassCards: glassCards.map((element) => {
            const style = getComputedStyle(element);
            return {
              backdropFilter: style.backdropFilter,
              webkitBackdropFilter: style.webkitBackdropFilter,
            };
          }),
        };
      });

      if (screenshotDir) {
        await page.screenshot({
          path: path.join(screenshotDir, `${engineName}-${viewportName}.png`),
          fullPage: false,
        });
      }

      const adminPage = await context.newPage();
      await adminPage.goto(`${baseUrl}/admin`, {
        waitUntil: "domcontentloaded",
      });
      const routeResults = [];

      for (const route of storefrontRoutes) {
        const routePage = await context.newPage();
        const routeErrors = [];
        const onPageError = (error) => {
          routeErrors.push(`pageerror: ${error.message}`);
        };
        const onConsole = (message) => {
          if (message.type() === "error") {
            routeErrors.push(`console: ${message.text()}`);
          }
        };
        routePage.on("pageerror", onPageError);
        routePage.on("console", onConsole);

        const routeResponse = await routePage.goto(`${baseUrl}${route}`, {
          waitUntil: "domcontentloaded",
        });
        await routePage.waitForTimeout(350);
        const horizontalOverflow = await routePage.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1,
        );

        routeResults.push({
          route,
          status: routeResponse?.status() ?? null,
          finalUrl: routePage.url(),
          horizontalOverflow,
          errors: routeErrors,
        });
        await routePage.close();
      }

      results.push({
        engine: engineName,
        viewport: viewportName,
        status: response?.status() ?? null,
        finalAdminUrl: adminPage.url(),
        errors,
        introMetrics,
        routeResults,
        ...metrics,
      });

      await context.close();
    }
  } finally {
    await browser.close();
  }
}

const failures = results.filter(
  (result) =>
    result.status !== 200 ||
    result.errors.length > 0 ||
    result.horizontalOverflow ||
    result.storyCanvasCount !== 0 ||
    result.introMetrics.characterCount === 0 ||
    result.introMetrics.visibleCharacterCount === 0 ||
    !result.introMetrics.frameCanvas ||
    (result.introMetrics.frameCanvas.centerAlpha === 0 &&
      result.introMetrics.frameCanvas.backgroundImage === "none") ||
    !result.finalAdminUrl.includes("/sr/prijava?next=/admin") ||
    result.routeResults.some(
      (route) =>
        route.status === null ||
        route.status >= 400 ||
        route.horizontalOverflow ||
        route.errors.length > 0,
    ) ||
    (result.viewport === "desktop" &&
      (result.glassCards.length === 0 ||
        !result.glassCards.some(
          (card) =>
            card.backdropFilter.includes("blur") ||
            card.webkitBackdropFilter.includes("blur"),
        ))),
);

console.log(JSON.stringify({ baseUrl, failures, results }, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
