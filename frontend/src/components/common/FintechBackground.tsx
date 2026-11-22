import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  char: string;
  color: string;
}

export const FintechBackground: React.FC = () => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Financial symbols pool
    const symbols = ['$', '€', '£', '₹', '✦', '↗', '📈', '⚡', '●', '◈'];
    const isDark = theme === 'dark';

    const colorPalette = isDark
      ? ['#6366f1', '#818cf8', '#10b981', '#34d399', '#a855f7', '#38bdf8']
      : ['#4f46e5', '#6366f1', '#059669', '#10b981', '#7c3aed', '#0284c7'];

    let particles: Particle[] = [];

    const initParticles = () => {
      const count = Math.min(Math.floor((width * height) / 32000), 45);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          size: Math.random() * 8 + 10,
          alpha: Math.random() * 0.25 + 0.1,
          char: symbols[Math.floor(Math.random() * symbols.length)],
          color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        });
      }
    };

    initParticles();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw interactive mouse spotlight glow
      const { x: mx, y: my } = mousePosRef.current;
      if (mx > -100 && my > -100) {
        const spotlightGradient = ctx.createRadialGradient(
          mx,
          my,
          10,
          mx,
          my,
          280
        );
        if (isDark) {
          spotlightGradient.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
          spotlightGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.03)');
          spotlightGradient.addColorStop(1, 'transparent');
        } else {
          spotlightGradient.addColorStop(0, 'rgba(99, 102, 241, 0.06)');
          spotlightGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.02)');
          spotlightGradient.addColorStop(1, 'transparent');
        }
        ctx.fillStyle = spotlightGradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw network links between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * (isDark ? 0.09 : 0.05);
            ctx.strokeStyle = isDark
              ? `rgba(129, 140, 248, ${lineAlpha})`
              : `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw each particle
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries smoothly
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.font = `600 ${p.size}px "Plus Jakarta Sans", system-ui, sans-serif`;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillText(p.char, p.x, p.y);
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700">
      {/* Dynamic Ambient Gradient Orbs */}
      <div className="absolute top-[-10%] left-[15%] w-[45rem] h-[45rem] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent dark:from-indigo-600/18 dark:via-purple-600/12 rounded-full blur-[130px] animate-blob -z-10" />
      <div className="absolute bottom-[-10%] right-[10%] w-[40rem] h-[40rem] bg-gradient-to-br from-emerald-400/15 via-teal-500/10 to-transparent dark:from-emerald-500/14 dark:via-teal-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000 -z-10" />
      <div className="absolute top-[40%] right-[-5%] w-[32rem] h-[32rem] bg-gradient-to-tl from-cyan-400/10 via-indigo-500/8 to-transparent dark:from-cyan-500/10 dark:via-indigo-500/10 rounded-full blur-[110px] animate-pulse-subtle -z-10" />

      {/* Grid and Dots overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-40" />
      <div className="absolute inset-0 bg-dots-pattern opacity-40 dark:opacity-25" />

      {/* Interactive Canvas for Floating Finance Glyphs & Ledger Lines */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};
