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
import Image from "next/image";
import { LiquidGlassCard } from "./liquid-glass-card";
import { gsap } from "gsap";

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
const STEP_TRANSITION_MS = 1000;
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
  const { language, theme, setTheme } = useSettings();

  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

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

      const themes = ["light", "dark", "light", "dark"] as const;
      const targetTheme = themes[nextStopIndex] ?? "light";
      if (themeRef.current !== targetTheme) {
        setTheme(targetTheme);
      }

      const root = document.documentElement;
      if (root.getAttribute("data-stop-index") !== String(nextStopIndex)) {
        root.setAttribute("data-stop-index", String(nextStopIndex));
      }
      const chapterId = nextStopIndex === 0 ? "intro" : CHAPTERS[nextStopIndex - 1]?.id || "intro";
      if (root.getAttribute("data-chapter") !== chapterId) {
        root.setAttribute("data-chapter", chapterId);
      }

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
      setTheme,
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
    if (isTransitioning) {
      return;
    }
    const themes = ["light", "dark", "light", "dark"] as const;
    const targetTheme = themes[stopIndex] ?? "light";
    if (themeRef.current !== targetTheme) {
      setTheme(targetTheme);
    }

    const root = document.documentElement;
    if (root.getAttribute("data-stop-index") !== String(stopIndex)) {
      root.setAttribute("data-stop-index", String(stopIndex));
    }
    const chapterId = stopIndex === 0 ? "intro" : CHAPTERS[stopIndex - 1]?.id || "intro";
    if (root.getAttribute("data-chapter") !== chapterId) {
      root.setAttribute("data-chapter", chapterId);
    }
  }, [stopIndex, setTheme, isTransitioning]);



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
      const target = event.target as HTMLElement;
      if (!sectionRef.current || !sectionRef.current.contains(target)) {
        return;
      }
      const lastStopPos = getStopPosition(maxStopIndex);
      const isScrolledDown = window.scrollY > lastStopPos + SCROLL_EPSILON;

      if (stopIndexRef.current === maxStopIndex) {
        if (event.deltaY > 0) {
          // Scrolling down: let it scroll naturally past the scrollytelling
          return;
        } else if (event.deltaY < 0 && isScrolledDown) {
          // Scrolling up but we are still below the scrollytelling section: let it scroll up naturally
          return;
        }
      }

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
      const target = event.target as HTMLElement;
      if (!sectionRef.current || !sectionRef.current.contains(target)) {
        return;
      }
      touchStartYRef.current = event.changedTouches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      if (!sectionRef.current || !sectionRef.current.contains(target)) {
        return;
      }
      const lastStopPos = getStopPosition(maxStopIndex);
      const isScrolledDown = window.scrollY > lastStopPos + SCROLL_EPSILON;

      const touchY = event.changedTouches[0]?.clientY ?? null;
      if (touchY !== null && touchStartYRef.current !== null) {
        const deltaY = touchStartYRef.current - touchY;
        if (stopIndexRef.current === maxStopIndex) {
          if (deltaY > 0) {
            // Scrolling down (swiping up): let it scroll naturally
            return;
          } else if (deltaY < 0 && isScrolledDown) {
            // Scrolling up (swiping down): let it scroll up naturally
            return;
          }
        }
      }

      event.preventDefault();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      if (!sectionRef.current || !sectionRef.current.contains(target)) {
        return;
      }
      const lastStopPos = getStopPosition(maxStopIndex);
      const isScrolledDown = window.scrollY > lastStopPos + SCROLL_EPSILON;

      const startY = touchStartYRef.current;
      const endY = event.changedTouches[0]?.clientY ?? null;

      if (startY === null || endY === null) {
        return;
      }

      const deltaY = startY - endY;

      if (stopIndexRef.current === maxStopIndex) {
        if (deltaY > 0) {
          // Scrolling down: let it scroll naturally
          return;
        } else if (deltaY < 0 && isScrolledDown) {
          // Scrolling up: let it scroll naturally
          return;
        }
      }

      event.preventDefault();

      if (!introComplete || isAnimatingRef.current || isInputLocked()) {
        return;
      }

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

      const lastStopPos = getStopPosition(maxStopIndex);
      const isScrolledDown = window.scrollY > lastStopPos + SCROLL_EPSILON;

      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === " "
      ) {
        if (stopIndexRef.current === maxStopIndex) {
          // Let it scroll naturally down
          return;
        }
        event.preventDefault();
        requestStageChange(1);
      }

      if (event.key === "ArrowUp" || event.key === "PageUp") {
        if (stopIndexRef.current === maxStopIndex && isScrolledDown) {
          // Let it scroll naturally up
          return;
        }
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
    maxStopIndex,
    prefersReducedMotion,
    setStopInstantly,
  ]);

  // GSAP: Initial Page Load Animation
  useEffect(() => {
    const sectionElement = sectionRef.current;
    if (!sectionElement) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        delay: 0.15,
      });

      // 1. Navbar fade/slide down
      tl.fromTo(
        "header",
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, ease: "power4.out" }
      );

      // Stagger nav links & toggles
      tl.fromTo(
        "header nav a, header button, header .nav-text",
        { y: -15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: "power3.out" },
        "-=0.7"
      );

      // 2. Intro grid layout columns
      const leftCol = sectionElement.querySelector(".lg\\:grid > div:first-child");
      const rightCol = sectionElement.querySelector(".lg\\:grid > div:last-child");

      if (leftCol && rightCol) {
        tl.fromTo(
          leftCol,
          { x: -80, opacity: 0, rotateY: 10 },
          { x: 0, opacity: 1, rotateY: 0, duration: 1.2, ease: "power4.out" },
          "-=0.55"
        );

        tl.fromTo(
          rightCol,
          { x: 80, opacity: 0, rotateY: -10 },
          { x: 0, opacity: 1, rotateY: 0, duration: 1.2, ease: "power4.out" },
          "-=1.1"
        );

        // Stagger inner canvas & CTA buttons
        const innerInteractive = sectionElement.querySelectorAll(".lg\\:grid img.hero-image, .lg\\:grid canvas, .lg\\:grid .cta-button");
        tl.fromTo(
          innerInteractive,
          { scale: 0.75, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.0, stagger: 0.08, ease: "back.out(1.4)" },
          "-=0.75"
        );
      }

      // Mobile layout cards
      const mobileCards = sectionElement.querySelectorAll(".lg\\:hidden > div");
      if (mobileCards.length > 0) {
        tl.fromTo(
          mobileCards,
          { y: 60, opacity: 0, scale: 0.9, rotateX: 8 },
          { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 1.1, stagger: 0.15, ease: "power4.out" },
          "-=0.9"
        );
      }

      // 3. Stagger checkpoint control buttons at the bottom
      tl.fromTo(
        ".checkpoint-button",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" },
        "-=0.75"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // GSAP: Transition Out for Intro Grid/Cards
  useEffect(() => {
    if (!isTransitioning || stopIndex !== 0) return;

    const sectionElement = sectionRef.current;
    if (!sectionElement) return;

    const ctx = gsap.context(() => {
      const leftCol = sectionElement.querySelector(".lg\\:grid > div:first-child");
      const rightCol = sectionElement.querySelector(".lg\\:grid > div:last-child");
      const mobileCards = sectionElement.querySelectorAll(".lg\\:hidden > div");

      if (leftCol && rightCol) {
        gsap.to(leftCol, {
          x: -120,
          opacity: 0,
          rotateY: 15,
          scale: 0.95,
          duration: 0.45,
          ease: "power2.inOut",
        });
        gsap.to(rightCol, {
          x: 120,
          opacity: 0,
          rotateY: -15,
          scale: 0.95,
          duration: 0.45,
          ease: "power2.inOut",
        });
      }

      if (mobileCards.length > 0) {
        gsap.to(mobileCards, {
          y: 40,
          opacity: 0,
          scale: 0.93,
          duration: 0.45,
          stagger: 0.05,
          ease: "power2.inOut",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isTransitioning, stopIndex]);

  return (
    <section
      ref={sectionRef}
      data-tow-scrollytelling="true"
      className={`relative ${stopIndex === maxStopIndex ? "" : "touch-none"}`}
      style={{ height: `calc(${STOP_FRAMES.length} * 100vh)` }}
    >
      <div className="sticky top-0 isolate h-screen w-screen overflow-hidden bg-[var(--page-bg)]">
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
                  key={language}
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
                {/* Desktop Layout (>= 1024px) - Original layout restored */}
                <div className="hidden lg:grid grid-cols-2 gap-x-12 gap-y-12 w-full flex-1 min-h-0 items-stretch py-6">
                  {/* Left Column: Title top, Sneaker Model + CTA bottom */}
                  <div className="flex flex-col justify-between items-start h-full md:pl-[35px]">
                    {/* Top-Left: Title */}
                    <div className="story-copy-panel relative max-w-[24rem] w-fit">
                      <p className="story-eyebrow reveal-up text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
                        {BRAND_NAME}
                      </p>
                      <div className="reveal-up mt-4" style={{ animationDelay: "100ms" }}>
                        <HeroAnimatedText
                          text={introCopy.ready}
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

                    {/* Bottom-Left: Sneaker Model + CTA */}
                    <div className="flex flex-col items-center w-full md:-translate-x-[185px]">
                      {/* <ModelViewer
                        url="/assets/3d-models/air-max-dn.glb"
                        scale={1.2}
                        className="w-full max-w-[340px] h-[260px]"
                        rotationSpeed={0.006}
                        cameraPosition={[0, 0, 2.3]}
                      /> */}
                      <Image
                        src="/assets/images/air-max.avif"
                        alt="Air Max"
                        width={340}
                        height={260}
                        className="hero-image w-full max-w-[340px] h-[260px] object-contain transition-transform duration-500 hover:scale-105"
                        priority
                      />
                      <div className="mt-3 flex justify-center w-full">
                        <a
                          href="#obuca"
                          className="cta-button group relative overflow-hidden rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)] active:scale-95 flex items-center gap-2"
                        >
                          {language === "sr" ? "Pogledaj obuću" : "View footwear"}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tech Fleece Model top + CTA, Short Title bottom */}
                  <div className="flex flex-col justify-between items-end h-full text-right md:pr-[35px]">
                    {/* Top-Right: Tech Fleece Model + CTA */}
                    <div className="flex flex-col items-center w-full md:-translate-y-8 md:translate-x-[170px]">
                      {/* <ModelViewer
                        url="/assets/3d-models/tech-fleece.glb"
                        scale={1.1}
                        className="w-full max-w-[340px] h-[260px]"
                        rotationSpeed={0.006}
                        cameraPosition={[0, -0.18, 2.3]}
                      /> */}
                      <Image
                        src="/assets/images/lacoste.avif"
                        alt="Lacoste Tech Fleece"
                        width={340}
                        height={260}
                        className="hero-image w-full max-w-[340px] h-[260px] object-contain transition-transform duration-500 hover:scale-105"
                        priority
                      />
                      <div className="mt-3 flex justify-center w-full">
                        <a
                          href="#garderoba"
                          className="cta-button group relative overflow-hidden rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)] active:scale-95 flex items-center gap-2"
                        >
                          {language === "sr" ? "Pogledaj garderobu" : "View apparel"}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>

                    {/* Bottom-Right: Short Title */}
                    <div className="story-copy-panel story-copy-panel-right relative max-w-[24rem] w-fit flex flex-col items-end">
                      <p className="story-eyebrow uppercase reveal-up text-[0.62rem] font-semibold tracking-[0.32em] text-[var(--text-secondary)]">
                        Premium
                      </p>
                      <div className="reveal-up mt-4" style={{ animationDelay: "200ms" }}>
                        <HeroAnimatedText
                          text={
                            language === "sr"
                              ? "Oseti udobnost kroja."
                              : "Feel the comfort of the cut."
                          }
                          fontSize="clamp(1.35rem, 3vw, 1.9rem)"
                          minWeight={360}
                          maxWeight={740}
                          animationDuration={TITLE_BURST_DURATION}
                          cycleDuration={TITLE_CYCLE_DURATION}
                          delayMultiplier={0.08}
                          align="right"
                          className="hero-whisper justify-end"
                          textClassName="story-title text-[var(--text-primary)] text-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile/Tablet Layout (< 1024px) - Centered Liquid Glass Cards */}
                <div className="grid lg:hidden grid-cols-1 gap-y-16 w-full flex-1 min-h-0 items-stretch py-2">
                  {/* Left Card Column */}
                  <div className="flex flex-col justify-center items-start h-full w-full">
                    <LiquidGlassCard active={stopIndex === 0 && !isTransitioning} className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col justify-center items-center h-fit p-4 sm:p-6">
                      {/* Top-Left: Title */}
                      <div className="story-copy-panel relative max-w-[20rem] sm:max-w-[22rem] w-fit mb-4 self-start">
                        <p className="story-eyebrow reveal-up text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
                          {BRAND_NAME}
                        </p>
                        <div className="reveal-up mt-4" style={{ animationDelay: "100ms" }}>
                          <HeroAnimatedText
                            text={introCopy.ready}
                            fontSize="clamp(1.2rem, 2.5vw, 1.9rem)"
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

                      {/* Bottom-Left: Sneaker Model + CTA */}
                      <div className="flex flex-col items-center w-full mt-2">
                        {/* <ModelViewer
                          url="/assets/3d-models/air-max-dn.glb"
                          scale={1.2}
                          className="w-full max-w-[160px] xs:max-w-[200px] sm:max-w-[240px] h-[110px] xs:h-[130px] sm:h-[160px]"
                          rotationSpeed={0.006}
                          cameraPosition={[0, 0, 2.3]}
                        /> */}
                        <Image
                          src="/assets/images/air-max.avif"
                          alt="Air Max"
                          width={240}
                          height={160}
                          className="hero-image w-full max-w-[160px] xs:max-w-[200px] sm:max-w-[240px] h-[110px] xs:h-[130px] sm:h-[160px] object-contain transition-transform duration-500 hover:scale-105"
                          priority
                        />
                        <div className="mt-3 flex justify-center w-full">
                          <a
                            href="#obuca"
                            className="cta-button group relative overflow-hidden rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-2.5 text-[0.7rem] md:text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)] active:scale-95 flex items-center gap-2"
                          >
                            {language === "sr" ? "Pogledaj obuću" : "View footwear"}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  </div>

                  {/* Right Card Column */}
                  <div className="flex flex-col justify-center items-end h-full w-full">
                    <LiquidGlassCard active={stopIndex === 0 && !isTransitioning} className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col justify-center items-center h-fit p-4 sm:p-6">
                      {/* Top-Right: Tech Fleece Model + CTA */}
                      <div className="flex flex-col items-center w-full mt-2 mb-4">
                        {/* <ModelViewer
                          url="/assets/3d-models/tech-fleece.glb"
                          scale={1.1}
                          className="w-full max-w-[160px] xs:max-w-[200px] sm:max-w-[240px] h-[110px] xs:h-[130px] sm:h-[160px]"
                          rotationSpeed={0.006}
                          cameraPosition={[0, -0.18, 2.3]}
                        /> */}
                        <Image
                          src="/assets/images/lacoste.avif"
                          alt="Lacoste Tech Fleece"
                          width={240}
                          height={160}
                          className="hero-image w-full max-w-[160px] xs:max-w-[200px] sm:max-w-[240px] h-[110px] xs:h-[130px] sm:h-[160px] object-contain transition-transform duration-500 hover:scale-105"
                          priority
                        />
                        <div className="mt-3 flex justify-center w-full">
                          <a
                            href="#garderoba"
                            className="cta-button group relative overflow-hidden rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-2.5 text-[0.7rem] md:text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)] active:scale-95 flex items-center gap-2"
                          >
                            {language === "sr" ? "Pogledaj garderobu" : "View apparel"}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </a>
                        </div>
                      </div>

                      {/* Bottom-Right: Short Title */}
                      <div className="story-copy-panel story-copy-panel-right relative max-w-[20rem] sm:max-w-[22rem] w-fit flex flex-col items-end self-end mt-2">
                        <p className="story-eyebrow uppercase reveal-up text-[0.62rem] font-semibold tracking-[0.32em] text-[var(--text-secondary)]">
                          Premium
                        </p>
                        <div className="reveal-up mt-4" style={{ animationDelay: "200ms" }}>
                          <HeroAnimatedText
                            text={
                              language === "sr"
                                ? "Oseti udobnost kroja."
                                : "Feel the comfort of the cut."
                            }
                            fontSize="clamp(1.2rem, 2.5vw, 1.9rem)"
                            minWeight={360}
                            maxWeight={740}
                            animationDuration={TITLE_BURST_DURATION}
                            cycleDuration={TITLE_CYCLE_DURATION}
                            delayMultiplier={0.08}
                            align="right"
                            className="hero-whisper justify-end"
                            textClassName="story-title text-[var(--text-primary)] text-right"
                          />
                        </div>
                      </div>
                    </LiquidGlassCard>
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
