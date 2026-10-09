import { useEffect, useRef } from 'react';

/**
 * Rich Animated Background — NIS AI School
 * Multi-layer: canvas particles + CSS geometric blobs + soft glow orbs
 * Performance: GPU-friendly transforms, respects prefers-reduced-motion, mobile-aware
 */
export default function SubtleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 22 : 48;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Particles: tiny blue dots + faint connection lines
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.5,
      dx: (Math.random() - 0.5) * 0.18,
      dy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.22 + 0.06,
    }));

    // Slow large glowing circles (drawn on canvas — very transparent)
    const orbs = [
      { x: w * 0.15, y: h * 0.2, r: Math.min(w, h) * 0.28, speed: 0.0004, angle: 0 },
      { x: w * 0.82, y: h * 0.7, r: Math.min(w, h) * 0.22, speed: 0.0006, angle: Math.PI },
      { x: w * 0.5,  y: h * 0.5, r: Math.min(w, h) * 0.18, speed: 0.0003, angle: Math.PI / 2 },
    ];

    const draw = (ts) => {
      ctx.clearRect(0, 0, w, h);

      // Draw slow atmospheric orbs
      orbs.forEach((orb) => {
        orb.angle += orb.speed;
        const ox = orb.x + Math.cos(orb.angle) * 60;
        const oy = orb.y + Math.sin(orb.angle * 0.7) * 40;
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
        grad.addColorStop(0, 'rgba(0, 102, 204, 0.05)');
        grad.addColorStop(0.5, 'rgba(56, 165, 246, 0.03)');
        grad.addColorStop(1, 'rgba(0, 102, 204, 0)');
        ctx.beginPath();
        ctx.arc(ox, oy, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 102, 204, ${0.028 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 102, 204, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };

    draw(0);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      orbs[0].x = w * 0.15; orbs[0].y = h * 0.2;
      orbs[1].x = w * 0.82; orbs[1].y = h * 0.7;
      orbs[2].x = w * 0.5;  orbs[2].y = h * 0.5;
    };

    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Layer 1: Canvas — particles + orbs */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />

      {/* Layer 2: Large CSS blobs — very slow geometric movement */}
      <div
        className="shape-blob bg-blue-400"
        style={{
          width: '520px', height: '520px',
          top: '-120px', left: '-160px',
          animationDuration: '28s',
          animationDelay: '0s',
        }}
      />
      <div
        className="shape-blob bg-blue-600"
        style={{
          width: '420px', height: '420px',
          bottom: '-100px', right: '-100px',
          animationDuration: '34s',
          animationDelay: '-8s',
        }}
      />
      <div
        className="shape-blob bg-sky-400"
        style={{
          width: '360px', height: '360px',
          top: '40%', left: '60%',
          animationDuration: '42s',
          animationDelay: '-15s',
          opacity: '0.07',
        }}
      />
      <div
        className="shape-blob-slow bg-blue-300"
        style={{
          width: '280px', height: '280px',
          top: '20%', right: '15%',
          animationDuration: '55s',
          animationDelay: '-22s',
          opacity: '0.06',
        }}
      />
      <div
        className="shape-blob-slow bg-indigo-400"
        style={{
          width: '240px', height: '240px',
          bottom: '30%', left: '10%',
          animationDuration: '48s',
          animationDelay: '-10s',
          opacity: '0.05',
        }}
      />

      {/* Layer 3: Static radial soft glow spots */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-8%', left: '-8%',
          width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(0,102,204,0.06) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-10%', right: '-10%',
          width: '55vw', height: '55vw',
          background: 'radial-gradient(circle, rgba(56,165,246,0.05) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '45%', left: '35%',
          width: '35vw', height: '35vw',
          background: 'radial-gradient(circle, rgba(0,102,204,0.04) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
