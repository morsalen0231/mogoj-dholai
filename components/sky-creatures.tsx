"use client";

import { useEffect, useMemo, useRef } from "react";

type CreatureConfig = {
  amplitude: number;
  drift: number;
  flap: number;
  scale: number;
  size: number;
  startX: number;
  startY: number;
  tint: string;
  type: "butterfly";
};

function ButterflyShape({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <path
        d="M32 29c-5-12-13-18-21-18-5 0-8 3-8 8 0 8 6 16 18 21-12 5-18 13-18 21 0 5 3 8 8 8 8 0 16-6 21-18 5 12 13 18 21 18 5 0 8-3 8-8 0-8-6-16-18-21 12-5 18-13 18-21 0-5-3-8-8-8-8 0-16 6-21 18z"
        fill={tint}
      />
      <rect x="29.5" y="15" width="5" height="34" rx="2.5" fill="rgba(248,250,252,0.8)" />
    </svg>
  );
}

export function SkyCreatures() {
  const creatureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const configs = useMemo<CreatureConfig[]>(
    () => [
      {
        type: "butterfly",
        startX: 8,
        startY: 22,
        amplitude: 3.6,
        drift: 2.5,
        flap: 3.5,
        scale: 0.88,
        size: 58,
        tint: "rgba(196, 250, 210, 0.28)",
      },
      {
        type: "butterfly",
        startX: 52,
        startY: 34,
        amplitude: 3.2,
        drift: 3.0,
        flap: 4.1,
        scale: 0.9,
        size: 60,
        tint: "rgba(148, 210, 255, 0.24)",
      },
    ],
    [],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      const width = window.innerWidth;
      const height = window.innerHeight;

      configs.forEach((config, index) => {
        const node = creatureRefs.current[index];
        if (!node) {
          return;
        }

        const cycle = ((elapsed * config.drift + config.startX) % 124) - 12;
        const x = (cycle / 100) * width;
        const yBase = (config.startY / 100) * height;
        const y = yBase + Math.sin(elapsed * config.drift + index) * (height * 0.01 * config.amplitude);
        const flap = 1 + Math.sin(elapsed * config.flap) * 0.12;
        const rotate = Math.sin(elapsed * (config.flap * 0.7) + index) * 8;

        node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${config.scale}, ${config.scale * flap})`;
      });

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [configs]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {configs.map((config, index) => (
        <div
          key={`${config.type}-${index}`}
          ref={(node) => {
            creatureRefs.current[index] = node;
          }}
          className="absolute left-0 top-0 opacity-90 will-change-transform"
          style={{ width: config.size, height: config.size }}
        >
          <ButterflyShape tint={config.tint} />
        </div>
      ))}
    </div>
  );
}
