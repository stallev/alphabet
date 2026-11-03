'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const rootStyles = getComputedStyle(document.documentElement);
    const palette = [
      '--color-danger',
      '--color-accent',
      '--color-success',
      '--color-team-2',
      '--color-team-5',
    ].map((token) => rootStyles.getPropertyValue(token).trim());
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      vx: Math.random() * 4 - 2,
      vy: Math.random() * 3 + 2,
      color: palette[Math.floor(Math.random() * palette.length)] ?? palette[0],
      size: Math.random() * 8 + 4,
    }));

    let animationId = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05;
        if (particle.y > height) {
          particle.y = -20;
          particle.x = Math.random() * width;
        }
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      });
      animationId = window.requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden
    />
  );
}
