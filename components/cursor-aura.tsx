"use client";

import { useEffect, useRef, useState } from "react";

export function CursorAura() {
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const [active, setActive] = useState(false);
  const targetRef = useRef({ x: -200, y: -200 });
  const frameRef = useRef<number | null>(null);
  const [ringPosition, setRingPosition] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) {
      return;
    }

    function animate() {
      setRingPosition((current) => ({
        x: current.x + (targetRef.current.x - current.x) * 0.12,
        y: current.y + (targetRef.current.y - current.y) * 0.12,
      }));

      frameRef.current = window.requestAnimationFrame(animate);
    }

    function handleMove(event: MouseEvent) {
      const next = { x: event.clientX, y: event.clientY };
      targetRef.current = next;
      setPosition(next);
      setActive(true);
    }

    function handleLeave() {
      setActive(false);
    }

    frameRef.current = window.requestAnimationFrame(animate);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseout", handleLeave);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseout", handleLeave);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className={`cursor-ring ${active ? "opacity-100" : "opacity-0"}`}
        style={{
          transform: `translate(${ringPosition.x - 24}px, ${ringPosition.y - 24}px)`,
        }}
      />
      <div
        aria-hidden="true"
        className={`cursor-core ${active ? "opacity-100" : "opacity-0"}`}
        style={{
          transform: `translate(${position.x - 4}px, ${position.y - 4}px)`,
        }}
      />
    </>
  );
}
