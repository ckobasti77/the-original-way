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
import { HeroAnimatedText } from "./hero-animated-text";
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
const STEP_TRANSITION_MS = 750;
const SCROLL_EPSILON = 2;
const TITLE_BURST_DURATION = 1.8;
const TITLE_CYCLE_DURATION = 7.2;

const INTRO_COPY = {
  sr: {
    forming: "Estetika se definiše.",
    ready: "Zakoračite u original.",
    pacing: "Originalni krojevi. Bez kompromisa.",
    sequence: "Skrolujte za otkrivanje autentične kolekcije.",
    statusPlaying: "učitavanje",
    statusReady: "spremno",
  },
  en: {
    forming: "Aesthetics defined.",
    ready: "Step into the original.",
    pacing: "Original cuts. No compromises.",
    sequence: "Scroll to unveil the authentic collection.",
    statusPlaying: "loading",
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
  const { language, setTheme } = useSettings();
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

      window.dispatchEvent(
        new CustomEvent("tow-transition-end", {
          detail: { activeStopIndex: nextStopIndex },
        })
      );

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

      window.dispatchEvent(
        new CustomEvent("tow-transition-start", {
          detail: { from: stopIndexRef.current, to: nextStopIndex },
        })
      );

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

      window.dispatchEvent(
        new CustomEvent("tow-transition-end", {
          detail: { activeStopIndex: nextStopIndex },
        })
      );
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

  const handleNextCheckpoint = useCallback(() => {
    if (!introComplete || isAnimatingRef.current || isInputLocked()) {
      return;
    }
    const nextIndex = clamp(stopIndexRef.current + 1, 0, maxStopIndex);
    if (nextIndex !== stopIndexRef.current) {
      void animateToStop(nextIndex);
    }
  }, [introComplete, isInputLocked, maxStopIndex, animateToStop]);

  const handleLastCheckpoint = useCallback(() => {
    if (!introComplete || isAnimatingRef.current || isInputLocked()) {
      return;
    }
    if (maxStopIndex !== stopIndexRef.current) {
      void animateToStop(maxStopIndex);
    }
  }, [introComplete, isInputLocked, maxStopIndex, animateToStop]);

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
    const themes = ["light", "dark", "light", "dark"] as const;
    const targetTheme = themes[stopIndex] ?? "light";
    setTheme(targetTheme);

    const root = document.documentElement;
    root.setAttribute("data-stop-index", String(stopIndex));
    const chapterId = stopIndex === 0 ? "intro" : CHAPTERS[stopIndex - 1]?.id || "intro";
    root.setAttribute("data-chapter", chapterId);
  }, [stopIndex, setTheme]);



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

    window.dispatchEvent(
      new CustomEvent("tow-transition-end", {
        detail: { activeStopIndex: 0 },
      })
    );

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
      style={{ height: `calc(${STOP_FRAMES.length} * 100vh)` }}
    >
      <div className="fixed inset-0 isolate h-screen w-screen overflow-hidden bg-[var(--page-bg)]">
        <div className="absolute inset-0">
          <FramePlayer
            ref={framePlayerRef}
            alt=""
            initialFrame={INTRO_START_FRAME}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="cinematic-scrim absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-[linear-gradient(180deg,rgba(4,9,17,0)_0%,rgba(4,9,17,0.52)_100%)]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col px-4 pb-6 pt-28 md:px-8 md:pb-8 md:pt-32">
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
            {storyStarted ? (
              <div className="relative flex min-h-0 flex-1 items-stretch">
                <AnimatedText
                  key={`${language}-${activeChapter.id}`}
                  chapter={activeChapter}
                  isTransitioning={isTransitioning}
                  language={language}
                />
              </div>
            ) : (
              <div
                className={`flex flex-1 transition-all duration-400 ease-[cubic-bezier(0.3,0,0.2,1)] ${
                  isTransitioning
                    ? "scale-[0.93] translate-y-2 opacity-0 blur-[3px]"
                    : "scale-100 translate-y-0 opacity-100 blur-0"
                }`}
              >
                <div className="flex w-full flex-col">
                  <div className="story-copy-panel relative max-w-[20rem] sm:max-w-[22rem] md:max-w-[24rem]">
                    <p className="story-eyebrow reveal-up text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
                      {BRAND_NAME}
                    </p>
                    <div className="reveal-up mt-4" style={{ animationDelay: "100ms" }}>
                      <HeroAnimatedText
                        text={introComplete ? introCopy.ready : introCopy.forming}
                        fontSize="clamp(1.35rem, 3vw, 1.9rem)"
                        minWeight={360}
                        maxWeight={740}
                        animationDuration={TITLE_BURST_DURATION}
                        cycleDuration={TITLE_CYCLE_DURATION}
                        delayMultiplier={0.08}
                        align="left"
                        className="hero-whisper"
                        textClassName="story-title text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Checkpoint navigation buttons */}
            <div className="pointer-events-auto mt-6 flex justify-center gap-4">
              <button
                onClick={handleNextCheckpoint}
                disabled={stopIndex >= maxStopIndex || !introComplete || isTransitioning}
                className="checkpoint-button group flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-primary)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)] active:scale-95 disabled:pointer-events-none disabled:opacity-25"
                title={language === "sr" ? "Sledeći korak" : "Next step"}
                aria-label={language === "sr" ? "Sledeći korak" : "Next step"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <button
                onClick={handleLastCheckpoint}
                disabled={stopIndex >= maxStopIndex || !introComplete || isTransitioning}
                className="checkpoint-button group flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-primary)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)] active:scale-95 disabled:pointer-events-none disabled:opacity-25"
                title={language === "sr" ? "Kraj priče" : "End of story"}
                aria-label={language === "sr" ? "Kraj priče" : "End of story"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5"
                >
                  <path d="m6 6 6 6 6-6" />
                  <path d="m6 12 6 6 6-6" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
