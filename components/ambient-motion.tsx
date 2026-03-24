"use client";

import { useEffect } from "react";

export function AmbientMotion() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return;
    }

    let frameId = 0;
    const start = performance.now();
    const root = document.documentElement;

    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;
      const x = 16 + Math.sin(elapsed * 0.22) * 4;
      const y = 18 + Math.cos(elapsed * 0.18) * 3;
      const mx = 78 + Math.cos(elapsed * 0.16) * 5;
      const my = 72 + Math.sin(elapsed * 0.14) * 4;
      const pulse = 1 + Math.sin(elapsed * 0.2) * 0.025;
      const opacity = 0.18 + ((Math.sin(elapsed * 0.24) + 1) / 2) * 0.06;

      root.style.setProperty("--ambient-x", `${x}%`);
      root.style.setProperty("--ambient-y", `${y}%`);
      root.style.setProperty("--ambient-mx", `${mx}%`);
      root.style.setProperty("--ambient-my", `${my}%`);
      root.style.setProperty("--ambient-scale", pulse.toFixed(3));
      root.style.setProperty("--ambient-opacity", opacity.toFixed(3));

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      root.style.removeProperty("--ambient-x");
      root.style.removeProperty("--ambient-y");
      root.style.removeProperty("--ambient-mx");
      root.style.removeProperty("--ambient-my");
      root.style.removeProperty("--ambient-scale");
      root.style.removeProperty("--ambient-opacity");
    };
  }, []);

  return null;
}
