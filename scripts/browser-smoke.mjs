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
            ?.getAttribute("data-frame") === "80",
        undefined,
        { timeout: 30_000 },
      );

      const navbarCheckpointStates = [];
      const readNavbarCheckpoint = () =>
        page.evaluate(() => {
          const header = document.querySelector("header");
          const story = document.querySelector(
            "[data-tow-scrollytelling='true']",
          );

          return {
            hidden: header?.getAttribute("data-navbar-hidden"),
            insideStory: header?.getAttribute("data-story-navbar"),
            stop: story?.getAttribute("data-stop-index"),
            tone: header?.getAttribute("data-story-tone"),
          };
        });

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
        navbarCheckpointStates.push(await readNavbarCheckpoint());
        await page.waitForTimeout(500);
        await page.evaluate(() => {
          const frameCanvas = document.querySelector(".story-stage canvas");
          const observedFrames = [];
          const recordFrame = () => {
            const frame = Number(frameCanvas?.getAttribute("data-frame"));
            if (
              Number.isFinite(frame) &&
              observedFrames.at(-1) !== frame
            ) {
              observedFrames.push(frame);
            }
          };
          const observer = new MutationObserver(recordFrame);
          if (frameCanvas) {
            observer.observe(frameCanvas, {
              attributeFilter: ["data-frame"],
              attributes: true,
            });
            recordFrame();
          }

          const storyMotion = {
            observedFrames,
            startedAt: null,
            endedAt: null,
            observer,
          };
          window.__towStoryMotion = storyMotion;
          window.addEventListener(
            "tow-transition-start",
            () => {
              storyMotion.startedAt = performance.now();
            },
            { once: true },
          );
          window.addEventListener(
            "tow-transition-end",
            () => {
              storyMotion.endedAt = performance.now();
            },
            { once: true },
          );
        });
        await page.mouse.move(
          Math.floor(viewport.width / 2),
          Math.floor(viewport.height / 2),
        );

        for (const targetFrame of ["161", "242", "323"]) {
          await page.mouse.wheel(0, 1_000);
          await page.waitForFunction(
            (frame) =>
              document
                .querySelector("#hero-frame-canvas")
                ?.getAttribute("data-frame") === frame,
            targetFrame,
            { timeout: 10_000 },
          );
          navbarCheckpointStates.push(await readNavbarCheckpoint());
          await page.waitForTimeout(350);
        }

        await page.waitForSelector(".story-float [data-glass-active]", {
          state: "attached",
          timeout: 10_000,
        });
      }

      const metrics = await page.evaluate(() => {
        const glassCards = [
          ...document.querySelectorAll(".story-float [data-glass-active]"),
        ];
        const glassCanvases = glassCards
          .map((element) => element.querySelector("canvas"))
          .filter(Boolean);
        const ambientOrbs = [
          ...document.querySelectorAll(".ambient-scroll-orb"),
        ];
        const frameCanvas = document.querySelector("#hero-frame-canvas");
        const storyMotion = window.__towStoryMotion;
        storyMotion?.observer?.disconnect();

        return {
          horizontalOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1,
          navbarHidden: document
            .querySelector("header")
            ?.getAttribute("data-navbar-hidden"),
          glassCanvasCount: glassCanvases.length,
          glassCanvases: glassCanvases.map((canvas) => ({
            width: canvas.width,
            height: canvas.height,
          })),
          glassCards: glassCards.map((element) => {
            const style = getComputedStyle(element);
            return {
              renderer: element.getAttribute("data-glass-renderer"),
              backdropFilter: style.backdropFilter,
              webkitBackdropFilter: style.webkitBackdropFilter,
            };
          }),
          ambientOrbCount: ambientOrbs.length,
          videoTransition: frameCanvas
            ? {
                renderer: frameCanvas.getAttribute(
                  "data-transition-renderer",
                ),
                presentedFrames: Number(
                  frameCanvas.getAttribute("data-video-presented-frames"),
                ),
                droppedFrames: Number(
                  frameCanvas.getAttribute("data-video-dropped-frames"),
                ),
                callbackFrames: Number(
                  frameCanvas.getAttribute("data-video-callback-frames"),
                ),
              }
            : null,
          storyMotion: storyMotion
            ? {
                observedFrames: storyMotion.observedFrames,
                durationMs:
                  typeof storyMotion.startedAt === "number" &&
                  typeof storyMotion.endedAt === "number"
                    ? storyMotion.endedAt - storyMotion.startedAt
                    : null,
              }
            : null,
        };
      });

      if (screenshotDir) {
        await page.screenshot({
          path: path.join(screenshotDir, `${engineName}-${viewportName}.png`),
          fullPage: false,
        });
      }

      let navbarHiddenAfterStory = null;
      let navbarShownAfterUp = null;
      if (viewportName === "desktop") {
        await page.mouse.wheel(0, 1_200);
        await page.waitForFunction(
          () =>
            document.querySelector(
              "[data-tow-scrollytelling='true']",
            )?.getBoundingClientRect().bottom <= 0 &&
            document
              .querySelector("header")
              ?.getAttribute("data-navbar-hidden") === "true",
          undefined,
          { timeout: 10_000 },
        );
        navbarHiddenAfterStory = true;

        await page.mouse.wheel(0, -500);
        await page.waitForFunction(
          () =>
            document
              .querySelector("header")
              ?.getAttribute("data-navbar-hidden") === "false",
          undefined,
          { timeout: 10_000 },
        );
        navbarShownAfterUp = true;
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
        navbarCheckpointStates,
        navbarHiddenAfterStory,
        navbarShownAfterUp,
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
    result.ambientOrbCount !== 3 ||
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
      (result.navbarHidden !== "false" ||
        result.navbarCheckpointStates.length !== 4 ||
        result.navbarCheckpointStates.some(
          (checkpoint, index) =>
            checkpoint.hidden !== "false" ||
            checkpoint.insideStory !== "true" ||
            checkpoint.stop !== String(index) ||
            checkpoint.tone !==
              (index === 0 || index === 2 ? "light" : "dark"),
        ) ||
        result.navbarHiddenAfterStory !== true ||
        result.navbarShownAfterUp !== true ||
        result.glassCards.length === 0 ||
        !(
          (result.glassCanvasCount >= 2 &&
            result.glassCards.filter((card) => card.renderer === "webgl")
              .length >= 2 &&
            result.glassCanvases.every(
              (canvas) => canvas.width > 0 && canvas.height > 0,
            )) ||
          result.glassCards.some(
            (card) =>
              card.backdropFilter.includes("blur") ||
              card.webkitBackdropFilter.includes("blur"),
          )
        ) ||
        !result.storyMotion ||
        result.storyMotion.durationMs === null ||
        result.storyMotion.durationMs > 2_200 ||
        !result.videoTransition ||
        result.videoTransition.renderer !== "video" ||
        (result.engine === "chromium" &&
          Math.max(
            result.videoTransition.callbackFrames,
            result.videoTransition.presentedFrames -
              result.videoTransition.droppedFrames,
          ) < 20))),
);

console.log(JSON.stringify({ baseUrl, failures, results }, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
