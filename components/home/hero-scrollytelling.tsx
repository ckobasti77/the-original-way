"use client";

import Lenis from "lenis";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

import { useSettings } from "@/components/settings-provider";

import { AnimatedText } from "./animated-text";
import { BRAND_NAME, CHAPTERS } from "./content";
import { FramePlayer, type FramePlayerHandle } from "./frame-player";

const INTRO_START_FRAME = 1;
const STOP_FRAMES = [61, 122, 183, 245] as const;
const INTRO_END_FRAME = STOP_FRAMES[0];
const FRAME_SEGMENTS = [
  [1, 61],
  [62, 122],
  [123, 183],
  [184, 245],
] as const;
const STEP_TRIGGER_DELTA = 56;
const TOUCH_TRIGGER_DELTA = 52;
const INTRO_DURATION_MS = 2000;
const STEP_TRANSITION_MS = 2000;
const SCROLL_EPSILON = 2;

const INTRO_COPY = {
  sr: {
    forming: "Logo se formira.",
    ready: "Skroluj za prvo poglavlje.",
    pacing: "Frejm po frejm. Bez rezova.",
    sequence: "Jedan skrol pusta sledecu sekvencu.",
    statusPlaying: "u toku",
    statusReady: "spremno",
  },
  en: {
    forming: "The mark takes shape.",
    ready: "Scroll for the first chapter.",
    pacing: "Frame by frame. No cuts.",
    sequence: "One scroll releases the next sequence.",
    statusPlaying: "playing",
    statusReady: "ready",
  },
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function easeInOutSine(progress: number) {
  return -(Math.cos(Math.PI * progress) - 1) / 2;
}

function useReducedMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncPreference);
    };
  }, []);

  return prefersReducedMotion;
}

export function HeroScrollytelling() {
  const { language } = useSettings();
  const introCopy = INTRO_COPY[language];
  const prefersReducedMotion = useReducedMotionPreference();
  const framePlayerRef = useRef<FramePlayerHandle | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const wheelAccumRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const stopIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const inputLockUntilRef = useRef(0);

  const [stopIndex, setStopIndex] = useState(0);
  const [introCompleteState, setIntroCompleteState] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const introComplete = prefersReducedMotion || introCompleteState;
  const maxStopIndex = STOP_FRAMES.length - 1;
  const storyStarted = stopIndex > 0;
  const activeChapterIndex = Math.max(0, stopIndex - 1);
  const activeChapter = CHAPTERS[activeChapterIndex];

  const isInputLocked = useCallback(() => {
    return window.performance.now() < inputLockUntilRef.current;
  }, []);

  const lockInput = useCallback((durationMs: number) => {
    inputLockUntilRef.current = Math.max(
      inputLockUntilRef.current,
      window.performance.now() + durationMs,
    );
  }, []);

  const getSectionStart = useCallback(() => {
    const sectionElement = sectionRef.current;

    if (!sectionElement) {
      return 0;
    }

    return sectionElement.getBoundingClientRect().top + window.scrollY;
  }, []);

  const getStopPosition = useCallback(
    (index: number) => {
      return getSectionStart() + clamp(index, 0, maxStopIndex) * window.innerHeight;
    },
    [getSectionStart, maxStopIndex],
  );

  const getFrameForStop = useCallback((index: number) => {
    return STOP_FRAMES[clamp(index, 0, maxStopIndex)];
  }, [maxStopIndex]);

  const setStopInstantly = useCallback(
    (index: number, snapScroll: boolean) => {
      const nextStopIndex = clamp(index, 0, maxStopIndex);
      const targetScroll = getStopPosition(nextStopIndex);
      const targetFrame = getFrameForStop(nextStopIndex);

      stopIndexRef.current = nextStopIndex;
      setStopIndex(nextStopIndex);
      framePlayerRef.current?.setFrame(targetFrame);

      if (!snapScroll || Math.abs(window.scrollY - targetScroll) <= SCROLL_EPSILON) {
        return;
      }

      const lenis = lenisRef.current;

      if (lenis) {
        lenis.scrollTo(targetScroll, {
          immediate: true,
          force: true,
          lock: true,
        });
        return;
      }

      window.scrollTo(0, targetScroll);
    },
    [getFrameForStop, getStopPosition, maxStopIndex],
  );

  const animateToStop = useCallback(
    async (index: number) => {
      const nextStopIndex = clamp(index, 0, maxStopIndex);
      const framePlayer = framePlayerRef.current;

      if (!framePlayer || isAnimatingRef.current) {
        return;
      }

      if (nextStopIndex === stopIndexRef.current) {
        setStopInstantly(nextStopIndex, true);
        return;
      }

      const targetScroll = getStopPosition(nextStopIndex);
      const targetFrame = getFrameForStop(nextStopIndex);

      lockInput(STEP_TRANSITION_MS + 300);
      isAnimatingRef.current = true;
      setIsTransitioning(true);

      const frameTransition = framePlayer.playToFrame(targetFrame, {
        durationMs: STEP_TRANSITION_MS,
        reducedMotion: prefersReducedMotion,
      });

      const scrollTransition = new Promise<void>((resolve) => {
        if (prefersReducedMotion) {
          window.scrollTo(0, targetScroll);
          resolve();
          return;
        }

        const lenis = lenisRef.current;

        if (!lenis) {
          window.scrollTo(0, targetScroll);
          resolve();
          return;
        }

        lenis.scrollTo(targetScroll, {
          duration: STEP_TRANSITION_MS / 1000,
          easing: easeInOutSine,
          force: true,
          lock: true,
          onComplete: () => resolve(),
        });
      });

      await Promise.all([frameTransition, scrollTransition]);

      stopIndexRef.current = nextStopIndex;
      setStopIndex(nextStopIndex);
      setIsTransitioning(false);
      isAnimatingRef.current = false;
    },
    [
      getFrameForStop,
      getStopPosition,
      lockInput,
      maxStopIndex,
      prefersReducedMotion,
      setStopInstantly,
    ],
  );

  const requestStageChange = useEffectEvent((direction: -1 | 1) => {
    if (!introComplete || isAnimatingRef.current || isInputLocked()) {
      return;
    }

    const nextStopIndex = clamp(stopIndexRef.current + direction, 0, maxStopIndex);
    void animateToStop(nextStopIndex);
  });

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousScrollRestoration = window.history.scrollRestoration;

    window.history.scrollRestoration = "manual";
    html.classList.add("story-lock");
    body.classList.add("story-lock");
    window.scrollTo(0, 0);

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
      html.classList.remove("story-lock");
      body.classList.remove("story-lock");
    };
  }, []);

  useEffect(() => {
    const framePlayer = framePlayerRef.current;

    if (!framePlayer) {
      return;
    }

    const currentSegment = FRAME_SEGMENTS[stopIndex] ?? FRAME_SEGMENTS[0];
    const previousSegment =
      FRAME_SEGMENTS[Math.max(0, stopIndex - 1)] ?? currentSegment;
    const nextSegment =
      FRAME_SEGMENTS[Math.min(FRAME_SEGMENTS.length - 1, stopIndex + 1)] ??
      currentSegment;

    void framePlayer.primeRange(currentSegment[0], currentSegment[1]);
    void framePlayer.primeRange(previousSegment[0], previousSegment[1]);
    void framePlayer.primeRange(nextSegment[0], nextSegment[1]);
  }, [stopIndex]);

  useEffect(() => {
    if (prefersReducedMotion) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.08,
      overscroll: false,
      smoothWheel: false,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    lenis.resize();

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const framePlayer = framePlayerRef.current;

    if (!framePlayer) {
      return;
    }

    let cancelled = false;
    const introScroll = getStopPosition(0);

    stopIndexRef.current = 0;
    setStopIndex(0);
    setIsTransitioning(false);

    const lenis = lenisRef.current;

    if (lenis) {
      lenis.scrollTo(introScroll, {
        immediate: true,
        force: true,
        lock: true,
      });
    } else {
      window.scrollTo(0, introScroll);
    }

    if (prefersReducedMotion) {
      framePlayer.setFrame(INTRO_END_FRAME);
      return;
    }

    isAnimatingRef.current = true;
    framePlayer.setFrame(INTRO_START_FRAME);

    const resetIntroStateId = window.requestAnimationFrame(() => {
      setIntroCompleteState(false);
    });

    void framePlayer
      .playToFrame(INTRO_END_FRAME, {
        durationMs: INTRO_DURATION_MS,
      })
      .then(() => {
        if (cancelled) {
          return;
        }

        framePlayer.setFrame(INTRO_END_FRAME);
        setIntroCompleteState(true);
        isAnimatingRef.current = false;
      });

    return () => {
      window.cancelAnimationFrame(resetIntroStateId);
      cancelled = true;
      isAnimatingRef.current = false;
    };
  }, [getStopPosition, prefersReducedMotion]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (!introComplete || isAnimatingRef.current || isInputLocked()) {
        wheelAccumRef.current = 0;
        return;
      }

      wheelAccumRef.current += event.deltaY;

      if (Math.abs(wheelAccumRef.current) < STEP_TRIGGER_DELTA) {
        return;
      }

      const direction = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      requestStageChange(direction);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.changedTouches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();

      if (!introComplete || isAnimatingRef.current || isInputLocked()) {
        return;
      }

      const startY = touchStartYRef.current;
      const endY = event.changedTouches[0]?.clientY ?? null;

      if (startY === null || endY === null) {
        return;
      }

      const deltaY = startY - endY;

      if (Math.abs(deltaY) < TOUCH_TRIGGER_DELTA) {
        return;
      }

      requestStageChange(deltaY > 0 ? 1 : -1);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (isTypingTarget || event.repeat || isInputLocked()) {
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === " "
      ) {
        event.preventDefault();
        requestStageChange(1);
      }

      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        requestStageChange(-1);
      }
    };

    const handleResize = () => {
      lenisRef.current?.resize();

      window.requestAnimationFrame(() => {
        if (!introComplete && !prefersReducedMotion) {
          const introScroll = getStopPosition(0);
          const lenis = lenisRef.current;

          if (lenis) {
            lenis.scrollTo(introScroll, {
              immediate: true,
              force: true,
              lock: true,
            });
          } else {
            window.scrollTo(0, introScroll);
          }

          return;
        }

        setStopInstantly(stopIndexRef.current, true);
      });
    };

    window.addEventListener("wheel", handleWheel, {
      capture: true,
      passive: false,
    });
    window.addEventListener("touchstart", handleTouchStart, {
      capture: true,
      passive: true,
    });
    window.addEventListener("touchmove", handleTouchMove, {
      capture: true,
      passive: false,
    });
    window.addEventListener("touchend", handleTouchEnd, {
      capture: true,
      passive: false,
    });
    window.addEventListener("keydown", handleKeyDown, {
      capture: true,
    });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("touchstart", handleTouchStart, true);
      window.removeEventListener("touchmove", handleTouchMove, true);
      window.removeEventListener("touchend", handleTouchEnd, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    getStopPosition,
    introComplete,
    isInputLocked,
    prefersReducedMotion,
    setStopInstantly,
  ]);

  return (
    <section
      ref={sectionRef}
      className="relative touch-none"
      style={{ height: `calc(${STOP_FRAMES.length} * 100dvh)` }}
    >
      <div className="fixed inset-0 isolate h-dvh w-screen overflow-hidden bg-[var(--page-bg)]">
        <div className="absolute inset-0">
          <FramePlayer
            ref={framePlayerRef}
            alt=""
            initialFrame={INTRO_START_FRAME}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(255,255,255,0.06),transparent_28%),linear-gradient(180deg,rgba(2,8,18,0.04)_0%,rgba(2,8,18,0.12)_46%,rgba(2,8,18,0.5)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-[linear-gradient(180deg,rgba(4,9,17,0)_0%,rgba(4,9,17,0.52)_100%)]" />
        </div>

        <div className="relative z-10 flex min-h-dvh flex-col px-4 pb-6 pt-28 md:px-8 md:pb-8 md:pt-32">
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
            {storyStarted ? (
              <div className="relative flex min-h-0 flex-1 items-stretch">
                <AnimatedText
                  key={`${language}-${activeChapter.id}`}
                  chapter={activeChapter}
                  chapterCount={CHAPTERS.length}
                  chapterIndex={activeChapterIndex}
                  isTransitioning={isTransitioning}
                  language={language}
                />
              </div>
            ) : (
              <div className="flex flex-1">
                <div className="flex w-full flex-col justify-between">
                  <div className="max-w-[18rem]">
                    <p className="reveal-up text-[0.62rem] uppercase tracking-[0.34em] text-[var(--text-muted)]">
                      {BRAND_NAME}
                    </p>
                    <p
                      className="reveal-up hero-whisper mt-4 font-display text-[1.55rem] leading-[0.98] tracking-[0.06em] text-[var(--text-primary)] sm:text-[1.85rem] md:text-[2.1rem]"
                      style={{ animationDelay: "100ms" }}
                    >
                      {introComplete ? introCopy.ready : introCopy.forming}
                    </p>
                  </div>

                  <div className="self-end text-right">
                    <p
                      className="reveal-up text-[0.62rem] uppercase tracking-[0.32em] text-[var(--text-muted)]"
                      style={{ animationDelay: "160ms" }}
                    >
                      00 / 03
                    </p>
                    <p
                      className="reveal-up mt-4 max-w-[14rem] text-sm leading-7 text-[var(--text-secondary)] sm:text-[0.95rem]"
                      style={{ animationDelay: "220ms" }}
                    >
                      {introComplete ? introCopy.sequence : introCopy.pacing}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pointer-events-none mt-6 flex items-center justify-between gap-4 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--text-muted)]">
              <div>{storyStarted ? activeChapter.eyebrow[language] : BRAND_NAME}</div>
              <div className="flex items-center gap-2" aria-hidden="true">
                {STOP_FRAMES.map((_, index) => (
                  <span
                    key={index}
                    className={`block h-px w-8 transition ${
                      index <= stopIndex
                        ? "bg-[var(--text-primary)] opacity-100"
                        : "bg-[var(--text-muted)] opacity-35"
                    }`}
                  />
                ))}
              </div>
              <div>
                {storyStarted
                  ? `${String(stopIndex).padStart(2, "0")} / 03`
                  : introComplete
                    ? introCopy.statusReady
                    : introCopy.statusPlaying}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
