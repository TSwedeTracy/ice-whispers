"use client";

import { useMemo } from "react";

export default function IceField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 14,
        duration: 10 + Math.random() * 10,
        size: 1 + Math.random() * 2,
      })),
    []
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="ice-particle animate-drift"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}
