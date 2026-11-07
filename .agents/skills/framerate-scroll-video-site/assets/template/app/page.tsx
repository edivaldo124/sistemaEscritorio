"use client";

import ScrollyVideo from "scrolly-video/dist/ScrollyVideo.esm.jsx";
import { useEffect, useRef, useState } from "react";

const HERO_VIDEO =
  "https://sites.framerate.space/template-assets/coworking-space/hero.mp4";

const HEADLINES = [
  {
    eyebrow: "Manhattan / New York",
    title: ["Work in the", "heart of NYC."],
    detail: "Flexible spaces for people building what’s next.",
  },
  {
    eyebrow: "For the people building what’s next",
    title: ["Make space", "for what’s next."],
    detail: "Room to focus, meet, move, and make the day your own.",
  },
  {
    eyebrow: "A city that keeps you moving",
    title: ["Stay close", "to the energy."],
    detail: "Work in the middle of everything worth stepping out for.",
  },
  {
    eyebrow: "The workday, in its best light",
    title: ["Your next move", "starts here."],
    detail: "Come find your place in the heart of New York.",
  },
];

export default function Home() {
  const [videoReady, setVideoReady] = useState(false);

  // onReady is the only signal that clears the loader, and ScrollyVideo's
  // HTML5 path never fires it, so fall back to a timer rather than leaving
  // the site stranded on "Preparing your place in the city".
  useEffect(() => {
    const watchdog = window.setTimeout(() => setVideoReady(true), 4000);
    return () => window.clearTimeout(watchdog);
  }, []);
  const [siteReady, setSiteReady] = useState(false);
  const [activeHeadline, setActiveHeadline] = useState(0);
  const headlineIndexRef = useRef(0);
  const meterFillRef = useRef<HTMLSpanElement>(null);
  const meterValueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    document.body.classList.add("site-loading");

    const waitForPage = new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
        return;
      }

      window.addEventListener("load", () => resolve(), { once: true });
    });

    Promise.all([waitForPage, document.fonts?.ready ?? Promise.resolve()]).then(
      () => setSiteReady(true),
    );

    return () => document.body.classList.remove("site-loading");
  }, []);

  const isLoaded = videoReady && siteReady;

  useEffect(() => {
    if (isLoaded) document.body.classList.remove("site-loading");
  }, [isLoaded]);

  return (
    <>
      <div
        className={`site-loader${isLoaded ? " is-complete" : ""}`}
        aria-hidden={isLoaded}
        aria-live="polite"
      >
        <div className="site-loader-topline">
          <span className="wordmark">LOCAL / OFFICE</span>
          <span>NYC / 2026</span>
        </div>
        <div className="site-loader-center">
          <p className="eyebrow">Preparing your place in the city</p>
          <span className="site-loader-bar" aria-hidden="true">
            <span />
          </span>
          <p className="site-loader-status">Loading</p>
        </div>
        <div className="site-loader-bottomline">
          <span>11 West 24th Street</span>
          <span>New York, NY</span>
        </div>
      </div>

      <main className="site-shell">
        <section className="hero-scroll-track" id="top" aria-label="Local Office introduction">
          <ScrollyVideo
            src={HERO_VIDEO}
            cover
            sticky
            full
            trackScroll
            lockScroll={false}
            transitionSpeed={8}
            frameThreshold={0.02}
            useWebCodecs
            onReady={() => setVideoReady(true)}
            onChange={(percentage: number) => {
              const progress = Math.max(0, Math.min(1, percentage));
              const value = String(Math.round(progress * 100)).padStart(2, "0");
              const headlineInterval = 1 / HEADLINES.length;
              const nextHeadline = Math.min(
                HEADLINES.length - 1,
                Math.floor(progress / headlineInterval),
              );

              if (meterFillRef.current) {
                meterFillRef.current.style.height = `${Math.max(4, progress * 100)}%`;
              }
              if (meterValueRef.current) {
                meterValueRef.current.textContent = value;
              }
              if (headlineIndexRef.current !== nextHeadline) {
                headlineIndexRef.current = nextHeadline;
                setActiveHeadline(nextHeadline);
              }
            }}
          />

          <div className="hero-tint" aria-hidden="true" />

          <div className="hero-overlay">
            <header className="site-nav">
              <a className="wordmark" href="#top" aria-label="Local Office home">
                LOCAL / OFFICE
              </a>
              <p className="nav-location">NYC / 2026</p>
            </header>

            <div className="hero-copy">
              <div className="headline-stack" aria-live="polite">
                {HEADLINES.map((headline, index) => (
                  <div
                    className={`headline-state ${
                      index === activeHeadline
                        ? "is-active"
                        : index < activeHeadline
                          ? "is-before"
                          : "is-after"
                    }`}
                    key={headline.title.join("-")}
                    aria-hidden={index !== activeHeadline}
                  >
                    <p className="eyebrow hero-eyebrow">
                      <span className={videoReady ? "status-dot is-ready" : "status-dot"} />
                      {headline.eyebrow}
                    </p>
                    <h1>
                      {headline.title.map((line) => (
                        <span className="headline-line" key={line}>
                          <span>{line}</span>
                        </span>
                      ))}
                    </h1>
                    <div className="hero-bottomline">
                      <p>{headline.detail}</p>
                      <a
                        className="circle-arrow-link"
                        href="mailto:hello@localoffice.nyc?subject=Explore%20Spaces"
                        aria-label="Explore spaces"
                      >
                        <span>Explore spaces</span>
                        <span className="circle-arrow" aria-hidden="true">
                          ↓
                        </span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="scroll-meter" aria-label="Scroll progress">
              <span className="scroll-meter-label">Scroll to move through the film</span>
              <span className="scroll-meter-line">
                <span ref={meterFillRef} style={{ height: "4%" }} />
              </span>
              <span ref={meterValueRef} className="scroll-meter-value">
                00
              </span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
