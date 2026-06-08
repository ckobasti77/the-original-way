"use client";
/* eslint-disable @next/next/no-img-element */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const FIRST_FRAME = 1;
const LAST_FRAME = 245;
const KEY_FRAMES = [FIRST_FRAME, 61, 122, 183, LAST_FRAME];
const DEFAULT_FRAME_FPS = 25;
const DEFAULT_FRAME_INTERVAL_MS = 1000 / DEFAULT_FRAME_FPS;
const PRELOAD_RADIUS = 8;

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
    const imageRef = useRef<HTMLImageElement | null>(null);
    const currentFrameRef = useRef(clampFrame(initialFrame));
    const loadedFramesRef = useRef(new Set<number>());
    const preloadPromisesRef = useRef(new Map<number, Promise<void>>());

    const preloadFrame = useCallback((frame: number) => {
      const nextFrame = clampFrame(frame);

      if (loadedFramesRef.current.has(nextFrame)) {
        return Promise.resolve();
      }

      const cachedPromise = preloadPromisesRef.current.get(nextFrame);

      if (cachedPromise) {
        return cachedPromise;
      }

      const promise = new Promise<void>((resolve) => {
        const frameImage = new window.Image();
        frameImage.decoding = "async";
        let settled = false;

        const settle = () => {
          if (settled) {
            return;
          }

          settled = true;
          loadedFramesRef.current.add(nextFrame);
          preloadPromisesRef.current.delete(nextFrame);
          resolve();
        };

        const complete = () => {
          if (typeof frameImage.decode === "function") {
            void frameImage.decode().then(settle).catch(settle);
            return;
          }

          settle();
        };

        frameImage.onload = complete;
        frameImage.onerror = settle;
        frameImage.src = getFrameSrc(nextFrame);

        if (frameImage.complete && frameImage.naturalWidth > 0) {
          complete();
        }
      });

      preloadPromisesRef.current.set(nextFrame, promise);
      return promise;
    }, []);

    const preloadRange = useCallback(
      async (fromFrame: number, toFrame: number) => {
        const start = clampFrame(Math.min(fromFrame, toFrame));
        const end = clampFrame(Math.max(fromFrame, toFrame));

        await Promise.all(
          Array.from({ length: end - start + 1 }, (_, index) =>
            preloadFrame(start + index),
          ),
        );
      },
      [preloadFrame],
    );

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

      if (imageRef.current) {
        imageRef.current.src = getFrameSrc(nextFrame);
      }
    }, []);

    const cancelAnimation = useCallback(() => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }, []);

    useEffect(() => {
      KEY_FRAMES.forEach((frame) => {
        void preloadFrame(frame);
      });
      paintFrame(initialFrame);
      scheduleNearbyPreload(initialFrame);

      return () => {
        cancelAnimation();
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
          await preloadRange(fromFrame, toFrame);
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

          await preloadRange(fromFrame, toFrame);
          scheduleNearbyPreload(toFrame);

          if (options?.reducedMotion) {
            paintFrame(toFrame);
            return;
          }

          await new Promise<void>((resolve) => {
            const distance = Math.max(1, Math.abs(toFrame - fromFrame));
            const durationMs =
              options?.durationMs ?? distance * DEFAULT_FRAME_INTERVAL_MS;
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
      [cancelAnimation, paintFrame, preloadRange, scheduleNearbyPreload],
    );

    return (
      <img
        ref={imageRef}
        alt={alt}
        draggable={false}
        fetchPriority="high"
        loading="eager"
        decoding="async"
        className={`${className ?? ""} block`}
        style={{ height: "100dvh", width: "100vw" }}
        src={getFrameSrc(currentFrameRef.current)}
      />
    );
  },
);
