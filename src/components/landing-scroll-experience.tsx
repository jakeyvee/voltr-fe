"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const COUNT_UP_DURATION = 1600;

function animateCountUp(element: HTMLElement) {
  if (element.dataset.countAnimated === "true") return;

  const finalValue = element.dataset.countUp ?? element.textContent?.trim() ?? "";
  const match = finalValue.match(/^([^\d]*)([\d,.]+)(.*)$/);

  if (!match) return;

  const [, prefix, numericValue, suffix] = match;
  const target = Number(numericValue.replace(/,/g, ""));

  if (!Number.isFinite(target)) return;

  const decimalPlaces = numericValue.includes(".")
    ? numericValue.split(".")[1].length
    : 0;
  const delay = Number(element.dataset.scrollDelay ?? 0);
  const duration = Number(element.dataset.countDuration ?? COUNT_UP_DURATION);
  let animationFrame = 0;
  let startTime: number | null = null;

  element.dataset.countAnimated = "true";
  element.textContent = `${prefix}${(0).toFixed(decimalPlaces)}${suffix}`;

  const update = (timestamp: number) => {
    if (startTime === null) startTime = timestamp + delay;

    const elapsed = Math.max(timestamp - startTime, 0);
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = target * easedProgress;
    const formattedValue = currentValue.toLocaleString("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });

    element.textContent = `${prefix}${formattedValue}${suffix}`;

    if (progress < 1) {
      animationFrame = window.requestAnimationFrame(update);
      return;
    }

    element.textContent = finalValue;
  };

  animationFrame = window.requestAnimationFrame(update);

  return () => window.cancelAnimationFrame(animationFrame);
}

export default function LandingScrollExperience({
  children,
}: {
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const prefersReducedMotion = window.matchMedia(
      REDUCED_MOTION_QUERY
    ).matches;
    const revealElements = Array.from(
      root.querySelectorAll<HTMLElement>("[data-scroll-reveal]")
    );
    const heroElements = Array.from(
      root.querySelectorAll<HTMLElement>("[data-scroll-hero]")
    );
    const cancelCountAnimations: Array<() => void> = [];
    const pendingHeroReveals = new Set<Element>();
    let heroAnimationComplete = heroElements.length === 0;

    [...revealElements, ...heroElements].forEach((element) => {
      const delay = Number(element.dataset.scrollDelay ?? 0);
      element.style.setProperty("--scroll-delay", `${delay}ms`);
    });

    root.classList.add("landing-scroll-ready");

    if (prefersReducedMotion) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const revealTarget = (target: Element) => {
      target.classList.add("is-visible");
      target
        .querySelectorAll<HTMLElement>("[data-count-up]")
        .forEach((element) => {
          const cancelAnimation = animateCountUp(element);
          if (cancelAnimation) cancelCountAnimations.push(cancelAnimation);
        });
    };

    const completeHeroAnimation = () => {
      heroAnimationComplete = true;
      pendingHeroReveals.forEach(revealTarget);
      pendingHeroReveals.clear();
    };

    const finalHeroElement = heroElements.at(-1);
    const handleFinalHeroAnimationEnd = (event: AnimationEvent) => {
      if (
        event.target !== finalHeroElement ||
        event.animationName !== "landingHeroEnter"
      ) {
        return;
      }

      completeHeroAnimation();
    };
    finalHeroElement?.addEventListener(
      "animationend",
      handleFinalHeroAnimationEnd
    );
    const heroAnimationFallback = window.setTimeout(completeHeroAnimation, 1400);

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const waitsForHero =
            entry.target instanceof HTMLElement &&
            entry.target.dataset.scrollAfterHero === "true";

          if (waitsForHero && !heroAnimationComplete) {
            pendingHeroReveals.add(entry.target);
          } else {
            revealTarget(entry.target);
          }

          revealObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      }
    );

    let revealFrame = window.requestAnimationFrame(() => {
      revealFrame = window.requestAnimationFrame(() => {
        revealElements.forEach((element) => revealObserver.observe(element));
      });
    });

    const parallaxElements = Array.from(
      root.querySelectorAll<HTMLElement>("[data-scroll-parallax]")
    );
    let animationFrame = 0;

    const updateScrollState = () => {
      animationFrame = 0;

      parallaxElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const viewportPosition =
          (rect.top + rect.height / 2 - window.innerHeight / 2) /
          window.innerHeight;
        const mobileScale = window.innerWidth < 768 ? 0.35 : 1;
        const speed = Number(element.dataset.scrollSpeed ?? 24) * mobileScale;
        const offset = Math.min(
          Math.max(viewportPosition * speed, -Math.abs(speed)),
          Math.abs(speed)
        );

        element.style.setProperty("--scroll-parallax", `${offset.toFixed(2)}px`);
      });
    };

    const requestScrollUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);
    updateScrollState();

    return () => {
      revealObserver.disconnect();
      finalHeroElement?.removeEventListener(
        "animationend",
        handleFinalHeroAnimationEnd
      );
      window.clearTimeout(heroAnimationFallback);
      window.cancelAnimationFrame(revealFrame);
      cancelCountAnimations.forEach((cancelAnimation) => cancelAnimation());
      window.removeEventListener("scroll", requestScrollUpdate);
      window.removeEventListener("resize", requestScrollUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div ref={rootRef} className="landing-scroll">
      <noscript>
        <style>{`
          .landing-scroll [data-scroll-after-hero="true"] {
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
          }
        `}</style>
      </noscript>
      {children}
    </div>
  );
}
