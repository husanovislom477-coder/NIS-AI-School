import { useEffect, useRef } from 'react';

/**
 * SectionAnimatedBackground — High-performance HTML5 canvas animation for alternating sections
 * Supports: 'network' (connecting nodes), 'shimmer' (radiant particles), 'waves' (ambient sine waves)
 * Pointer-events-none, strictly z-0 behind content.
 */
export default function SectionAnimatedBackground({
  variant = 'network',
  className = '',
  theme = 'light',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // ─── Variant 1: Network / Constellation (for Programs & Stats) ───
    const nodeCount = Math.min(width > 768 ? 32 : 16, 36);
    const nodes = Array.from({ length: nodeCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1.2,
      alpha: Math.random() * 0.35 + 0.15,
    }));

    // ─── Variant 2: Shimmer / Embers (for Achievements) ──────────────
    const emberCount = Math.min(width > 768 ? 40 : 20, 45);
    const embers = Array.from({ length: emberCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vy: -(Math.random() * 0.5 + 0.25),
      vx: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.6 + 0.2,
      isGold: Math.random() > 0.5,
    }));

    let step = 0;

    const render = () => {
      step += 0.01;
      ctx.clearRect(0, 0, width, height);

      if (variant === 'network') {
        // Draw connecting links
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = width > 768 ? 130 : 90;
            if (dist < maxDist) {
              const linkAlpha = (1 - dist / maxDist) * 0.14;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = `rgba(37, 99, 235, ${linkAlpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        // Draw nodes
        nodes.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0) n.x = width;
          if (n.x > width) n.x = 0;
          if (n.y < 0) n.y = height;
          if (n.y > height) n.y = 0;

          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59, 130, 246, ${n.alpha})`;
          ctx.fill();
        });
      } else if (variant === 'shimmer') {
        // Achievements radiant embers
        embers.forEach((e) => {
          e.y += e.vy;
          e.x += e.vx;
          if (e.y < -10) {
            e.y = height + 10;
            e.x = Math.random() * width;
          }
          if (e.x < 0) e.x = width;
          if (e.x > width) e.x = 0;

          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
          ctx.fillStyle = e.isGold
            ? `rgba(253, 224, 71, ${e.alpha * 0.85})`
            : `rgba(191, 219, 254, ${e.alpha * 0.75})`;
          ctx.fill();
        });
      } else if (variant === 'waves') {
        // News subtle sinusoidal wave ribbon
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height * 0.4);
        for (let x = 0; x <= width; x += 15) {
          const y =
            height * 0.4 +
            Math.sin(x * 0.003 + step) * 25 +
            Math.cos(x * 0.006 - step * 0.7) * 15;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(59, 130, 246, 0.03)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [variant]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Soft gradient accent */}
      {theme === 'blue' ? (
        <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/70 pointer-events-none" />
      )}
    </div>
  );
}
