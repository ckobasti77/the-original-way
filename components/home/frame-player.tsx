"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const FIRST_FRAME = 1;
const LAST_FRAME = 323;
const KEY_FRAMES = [FIRST_FRAME, 80, 161, 242, LAST_FRAME];
const DEFAULT_FRAME_FPS = 25;
const DEFAULT_FRAME_INTERVAL_MS = 1000 / DEFAULT_FRAME_FPS;
const PRELOAD_RADIUS = 8;
const MAX_CANVAS_DPR = 1;
const CANVAS_RENDER_SCALE = 1;
const BITMAP_WIDTH = 960;
const BITMAP_HEIGHT = 536;
const MAX_CACHED_SOURCES = 128;
const PRELOAD_BATCH_SIZE = 8;
const VIDEO_FPS = 60;
const VIDEO_READY_TIMEOUT_MS = 6_000;

type FrameSource = {
  height: number;
  source: CanvasImageSource;
  width: number;
};

function closeFrameSource(frameSource?: FrameSource) {
  if (
    frameSource &&
    typeof ImageBitmap !== "undefined" &&
    frameSource.source instanceof ImageBitmap
  ) {
    frameSource.source.close();
  }
}

function clampFrame(frame: number) {
  return Math.max(FIRST_FRAME, Math.min(LAST_FRAME, frame));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getFrameSrc(frame: number) {
  return `/assets/hero-frames/${String(frame).padStart(3, "0")}_compressed.webp`;
}

export type FramePlayerHandle = {
  getCurrentFrame: () => number;
  primeRange: (fromFrame: number, toFrame: number) => Promise<void>;
  playToFrame: (
    targetFrame: number,
    options?: {
      durationMs?: number;
      reducedMotion?: boolean;
    },
  ) => Promise<void>;
  setFrame: (frame: number) => void;
};

type FramePlayerProps = {
  alt?: string;
  className?: string;
  initialFrame?: number;
};

export const FramePlayer = forwardRef<FramePlayerHandle, FramePlayerProps>(
  function FramePlayer(
    { alt = "", className, initialFrame = FIRST_FRAME },
    forwardedRef,
  ) {
    const animationFrameRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const forwardVideoRef = useRef<HTMLVideoElement | null>(null);
    const reverseVideoRef = useRef<HTMLVideoElement | null>(null);
    const currentFrameRef = useRef(clampFrame(initialFrame));
    
    const sourcesRef = useRef<Map<number, FrameSource>>(new Map());
    const preloadPromisesRef = useRef<Map<number, Promise<FrameSource>>>(new Map());
    const failedFramesRef = useRef<Set<number>>(new Set());

    const rememberSource = useCallback((frame: number, source: FrameSource) => {
      const sources = sourcesRef.current;
      const existingSource = sources.get(frame);

      if (existingSource?.source !== source.source) {
        closeFrameSource(existingSource);
      }

      sources.delete(frame);
      sources.set(frame, source);

      while (sources.size > MAX_CACHED_SOURCES) {
        const oldestFrame = sources.keys().next().value as number | undefined;
        if (oldestFrame === undefined) {
          break;
        }

        closeFrameSource(sources.get(oldestFrame));
        sources.delete(oldestFrame);
      }
    }, []);

    const preloadFrame = useCallback((frame: number): Promise<FrameSource> => {
      const nextFrame = clampFrame(frame);

      if (failedFramesRef.current.has(nextFrame)) {
        const failedImage = new window.Image();
        return Promise.resolve({
          source: failedImage,
          width: 0,
          height: 0,
        });
      }

      const cachedSource = sourcesRef.current.get(nextFrame);
      if (cachedSource) {
        sourcesRef.current.delete(nextFrame);
        sourcesRef.current.set(nextFrame, cachedSource);
        return Promise.resolve(cachedSource);
      }

      const cachedPromise = preloadPromisesRef.current.get(nextFrame);
      if (cachedPromise) {
        return cachedPromise;
      }

      const promise = new Promise<FrameSource>((resolve) => {
        const frameImage = new window.Image();
        frameImage.decoding = "async";
        let settled = false;

        const settle = (source: FrameSource) => {
          if (settled) {
            return;
          }

          settled = true;
          rememberSource(nextFrame, source);
          preloadPromisesRef.current.delete(nextFrame);
          resolve(source);
        };

        const createSource = async () => {
          if (
            typeof window.createImageBitmap === "function" &&
            frameImage.naturalWidth > 0 &&
            !KEY_FRAMES.includes(nextFrame)
          ) {
            try {
              const bitmap = await window.createImageBitmap(frameImage, {
                resizeHeight: BITMAP_HEIGHT,
                resizeQuality: "medium",
                resizeWidth: BITMAP_WIDTH,
              });
              settle({
                source: bitmap,
                width: bitmap.width,
                height: bitmap.height,
              });
              return;
            } catch {
              // Keep the decoded image fallback for older Safari/WebKit builds.
            }
          }

          settle({
            source: frameImage,
            width: frameImage.naturalWidth,
            height: frameImage.naturalHeight,
          });
        };

        const complete = () => {
          if (typeof frameImage.decode === "function") {
            void frameImage
              .decode()
              .catch(() => undefined)
              .then(createSource);
            return;
          }

          void createSource();
        };

        frameImage.onload = complete;
        frameImage.onerror = () => {
          failedFramesRef.current.add(nextFrame);
          settle({
            source: frameImage,
            width: 0,
            height: 0,
          });
        };
        frameImage.src = getFrameSrc(nextFrame);

        if (frameImage.complete && frameImage.naturalWidth > 0) {
          complete();
        }
      });

      preloadPromisesRef.current.set(nextFrame, promise);
      return promise;
    }, [rememberSource]);

    const preloadRange = useCallback(
      async (fromFrame: number, toFrame: number) => {
        const start = clampFrame(Math.min(fromFrame, toFrame));
        const end = clampFrame(Math.max(fromFrame, toFrame));

        const frames = Array.from(
          { length: end - start + 1 },
          (_, index) => start + index,
        );

        for (
          let batchStart = 0;
          batchStart < frames.length;
          batchStart += PRELOAD_BATCH_SIZE
        ) {
          await Promise.all(
            frames
              .slice(batchStart, batchStart + PRELOAD_BATCH_SIZE)
              .map(preloadFrame),
          );
        }
      },
      [preloadFrame],
    );

    const waitForVideo = useCallback((video: HTMLVideoElement) => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        return Promise.resolve(true);
      }

      video.load();

      return new Promise<boolean>((resolve) => {
        let settled = false;
        const settle = (ready: boolean) => {
          if (settled) {
            return;
          }

          settled = true;
          window.clearTimeout(timeoutId);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("error", handleError);
          resolve(ready);
        };
        const handleCanPlay = () => settle(true);
        const handleError = () => settle(false);
        const timeoutId = window.setTimeout(
          () => settle(false),
          VIDEO_READY_TIMEOUT_MS,
        );

        video.addEventListener("canplay", handleCanPlay, { once: true });
        video.addEventListener("error", handleError, { once: true });
      });
    }, []);

    const primeVideoSources = useCallback(async () => {
      const videos = [forwardVideoRef.current, reverseVideoRef.current].filter(
        (video): video is HTMLVideoElement => video !== null,
      );

      if (videos.length !== 2) {
        return false;
      }

      const readyStates = await Promise.all(videos.map(waitForVideo));
      return readyStates.every(Boolean);
    }, [waitForVideo]);

    const scheduleNearbyPreload = useCallback(
      (frame: number) => {
        const centerFrame = clampFrame(frame);

        window.setTimeout(() => {
          for (let offset = 0; offset <= PRELOAD_RADIUS; offset += 1) {
            if (offset === 0) {
              void preloadFrame(centerFrame);
              continue;
            }

            void preloadFrame(centerFrame - offset);
            void preloadFrame(centerFrame + offset);
          }
        }, 0);
      },
      [preloadFrame],
    );

    const paintFrame = useCallback((frame: number) => {
      const nextFrame = clampFrame(frame);
      currentFrameRef.current = nextFrame;

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setAttribute("data-frame", String(nextFrame));

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (failedFramesRef.current.has(nextFrame)) {
        return;
      }

      const frameSource = sourcesRef.current.get(nextFrame);
      if (frameSource && frameSource.width > 0 && frameSource.height > 0) {
        sourcesRef.current.delete(nextFrame);
        sourcesRef.current.set(nextFrame, frameSource);

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgWidth = frameSource.width;
        const imgHeight = frameSource.height;

        const imgRatio = imgWidth / imgHeight;
        const canvasRatio = canvasWidth / canvasHeight;

        let drawWidth = canvasWidth;
        let drawHeight = canvasHeight;
        let offsetX = 0;
        let offsetY = 0;

        // "object-cover" styling equivalent calculation
        if (canvasRatio > imgRatio) {
          drawHeight = canvasWidth / imgRatio;
          offsetY = (canvasHeight - drawHeight) / 2;
        } else {
          drawWidth = canvasHeight * imgRatio;
          offsetX = (canvasWidth - drawWidth) / 2;
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(
          frameSource.source,
          offsetX,
          offsetY,
          drawWidth,
          drawHeight,
        );
      } else {
        // Fallback: request preload and paint when done
        void preloadFrame(nextFrame).then(() => {
          if (currentFrameRef.current === nextFrame) {
            paintFrame(nextFrame);
          }
        });
      }
    }, [preloadFrame]);

    const cancelAnimation = useCallback(() => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      [forwardVideoRef.current, reverseVideoRef.current].forEach((video) => {
        if (!video) {
          return;
        }
        video.pause();
        video.dataset.active = "false";
        video.style.opacity = "0";
      });
    }, []);

    const playVideoToFrame = useCallback(
      async (
        fromFrame: number,
        toFrame: number,
        durationMs: number,
      ) => {
        const isForward = toFrame > fromFrame;
        const video = isForward
          ? forwardVideoRef.current
          : reverseVideoRef.current;

        if (!video || !(await waitForVideo(video))) {
          return false;
        }

        const frameToTime = (frame: number) =>
          isForward
            ? (frame - FIRST_FRAME) / VIDEO_FPS
            : (LAST_FRAME - frame) / VIDEO_FPS;
        const startTime = frameToTime(fromFrame);
        const targetTime = frameToTime(toFrame);
        const mediaDuration = Math.max(
          1 / VIDEO_FPS,
          targetTime - startTime,
        );

        video.pause();
        video.playbackRate = clamp(
          mediaDuration / Math.max(0.1, durationMs / 1_000),
          0.25,
          4,
        );

        await new Promise<void>((resolve) => {
          if (Math.abs(video.currentTime - startTime) < 1 / VIDEO_FPS) {
            resolve();
            return;
          }

          const handleSeeked = () => resolve();
          video.addEventListener("seeked", handleSeeked, { once: true });
          video.currentTime = startTime;
        });

        video.dataset.active = "true";
        video.style.opacity = "1";

        try {
          await video.play();
        } catch {
          video.dataset.active = "false";
          video.style.opacity = "0";
          return false;
        }

        return new Promise<boolean>((resolve) => {
          const extendedVideo = video as HTMLVideoElement & {
            webkitDecodedFrameCount?: number;
            webkitDroppedFrameCount?: number;
          };
          const readPlaybackQuality = () => {
            if (typeof video.getVideoPlaybackQuality === "function") {
              const quality = video.getVideoPlaybackQuality();
              return {
                dropped: quality.droppedVideoFrames,
                presented: quality.totalVideoFrames,
              };
            }

            return {
              dropped: extendedVideo.webkitDroppedFrameCount ?? 0,
              presented: extendedVideo.webkitDecodedFrameCount ?? 0,
            };
          };
          const qualityBefore = readPlaybackQuality();
          let finished = false;
          let timeoutId = 0;
          let videoFrameCallbackId: number | null = null;
          let videoFrameCallbackCount = 0;

          const countPresentedFrame: VideoFrameRequestCallback = () => {
            videoFrameCallbackCount += 1;
            videoFrameCallbackId =
              video.requestVideoFrameCallback(countPresentedFrame);
          };

          if (typeof video.requestVideoFrameCallback === "function") {
            videoFrameCallbackId =
              video.requestVideoFrameCallback(countPresentedFrame);
          }

          const finish = () => {
            if (finished) {
              return;
            }

            finished = true;
            window.clearTimeout(timeoutId);
            if (animationFrameRef.current !== null) {
              window.cancelAnimationFrame(animationFrameRef.current);
            }
            if (
              videoFrameCallbackId !== null &&
              typeof video.cancelVideoFrameCallback === "function"
            ) {
              video.cancelVideoFrameCallback(videoFrameCallbackId);
            }

            video.pause();
            video.currentTime = targetTime;
            video.dataset.active = "false";
            video.style.opacity = "0";

            const qualityAfter = readPlaybackQuality();
            const canvas = canvasRef.current;
            if (canvas) {
              canvas.dataset.frame = String(toFrame);
              canvas.dataset.transitionRenderer = "video";
              canvas.dataset.videoPresentedFrames = String(
                Math.max(0, qualityAfter.presented - qualityBefore.presented),
              );
              canvas.dataset.videoDroppedFrames = String(
                Math.max(0, qualityAfter.dropped - qualityBefore.dropped),
              );
              canvas.dataset.videoCallbackFrames = String(
                videoFrameCallbackCount,
              );
            }

            currentFrameRef.current = toFrame;
            animationFrameRef.current = null;
            resolve(true);
          };

          const tick = () => {
            const rawFrame = Math.round(
              isForward
                ? FIRST_FRAME + video.currentTime * VIDEO_FPS
                : LAST_FRAME - video.currentTime * VIDEO_FPS,
            );
            const nextFrame = clamp(
              rawFrame,
              Math.min(fromFrame, toFrame),
              Math.max(fromFrame, toFrame),
            );
            currentFrameRef.current = nextFrame;
            canvasRef.current?.setAttribute("data-frame", String(nextFrame));

            if (video.ended) {
              finish();
              return;
            }

            animationFrameRef.current = window.requestAnimationFrame(tick);
          };

          timeoutId = window.setTimeout(finish, durationMs);
          animationFrameRef.current = window.requestAnimationFrame(tick);
        });
      },
      [waitForVideo],
    );

    // Setup Resizing logic with window resize listener to ensure crisp quality & correct cover style
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = Math.min(
          MAX_CANVAS_DPR,
          window.devicePixelRatio || 1,
        );
        const targetWidth = Math.round(width * dpr * CANVAS_RENDER_SCALE);
        const targetHeight = Math.round(height * dpr * CANVAS_RENDER_SCALE);

        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          paintFrame(currentFrameRef.current);
        }
      };

      window.addEventListener("resize", handleResize);
      handleResize(); // Initial sizing

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [paintFrame]);

    useEffect(() => {
      const sources = sourcesRef.current;

      KEY_FRAMES.forEach((frame) => {
        void preloadFrame(frame);
      });
      paintFrame(initialFrame);
      scheduleNearbyPreload(initialFrame);

      return () => {
        cancelAnimation();
        sources.forEach(closeFrameSource);
        sources.clear();
      };
    }, [
      cancelAnimation,
      initialFrame,
      paintFrame,
      preloadFrame,
      scheduleNearbyPreload,
    ]);

    useImperativeHandle(
      forwardedRef,
      () => ({
        getCurrentFrame: () => currentFrameRef.current,
        primeRange: async (fromFrame, toFrame) => {
          const videosReady = await primeVideoSources();
          await Promise.all([
            preloadFrame(fromFrame),
            preloadFrame(toFrame),
          ]);
          if (!videosReady) {
            await preloadRange(fromFrame, toFrame);
          }
          scheduleNearbyPreload(toFrame);
        },
        playToFrame: async (targetFrame, options) => {
          cancelAnimation();

          const fromFrame = currentFrameRef.current;
          const toFrame = clampFrame(targetFrame);

          if (fromFrame === toFrame) {
            scheduleNearbyPreload(toFrame);
            return;
          }

          if (options?.reducedMotion) {
            await preloadFrame(toFrame);
            paintFrame(toFrame);
            return;
          }

          const distance = Math.max(1, Math.abs(toFrame - fromFrame));
          const durationMs =
            options?.durationMs ?? distance * DEFAULT_FRAME_INTERVAL_MS;
          const playedVideo = await playVideoToFrame(
            fromFrame,
            toFrame,
            durationMs,
          );

          if (playedVideo) {
            await preloadFrame(toFrame);
            paintFrame(toFrame);
            scheduleNearbyPreload(toFrame);
            return;
          }

          await preloadRange(fromFrame, toFrame);
          scheduleNearbyPreload(toFrame);

          await new Promise<void>((resolve) => {
            const step = fromFrame < toFrame ? 1 : -1;
            let lastPaintedFrame = fromFrame;
            const startTime = window.performance.now();

            const tick = (now: number) => {
              const progress = clamp((now - startTime) / durationMs, 0, 1);
              const frameOffset = Math.min(
                distance,
                Math.floor(progress * distance),
              );
              const nextFrame = fromFrame + frameOffset * step;

              if (nextFrame !== lastPaintedFrame) {
                paintFrame(nextFrame);
                lastPaintedFrame = nextFrame;
              }

              if (progress >= 1) {
                paintFrame(toFrame);
                animationFrameRef.current = null;
                resolve();
                return;
              }

              animationFrameRef.current = window.requestAnimationFrame(tick);
            };

            animationFrameRef.current = window.requestAnimationFrame(tick);
          });
        },
        setFrame: (frame) => {
          cancelAnimation();
          paintFrame(frame);
          scheduleNearbyPreload(frame);
        },
      }),
      [
        cancelAnimation,
        paintFrame,
        playVideoToFrame,
        preloadFrame,
        preloadRange,
        primeVideoSources,
        scheduleNearbyPreload,
      ],
    );

    return (
      <>
        <canvas
          ref={canvasRef}
          id="hero-frame-canvas"
          role="img"
          aria-label={alt}
          className={`${className ?? ""} block`}
          style={{
            backgroundImage: `url("${getFrameSrc(initialFrame)}")`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            height: "100vh",
            width: "100vw",
          }}
        />
        <video
          ref={forwardVideoRef}
          aria-hidden="true"
          className={`${className ?? ""} pointer-events-none block opacity-0`}
          data-active="false"
          data-hero-frame-video="true"
          muted
          playsInline
          preload="auto"
          src="/assets/hero-video/story-forward.mp4"
        />
        <video
          ref={reverseVideoRef}
          aria-hidden="true"
          className={`${className ?? ""} pointer-events-none block opacity-0`}
          data-active="false"
          data-hero-frame-video="true"
          muted
          playsInline
          preload="auto"
          src="/assets/hero-video/story-reverse.mp4"
        />
      </>
    );
  },
);
