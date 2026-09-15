import React, { useEffect, useRef } from 'react';

export type HeaderWelcomeAnimationProps = {
  isVisible: boolean;
  username?: string;
  onSkip: () => void;
};

export default function HeaderWelcomeAnimation({
  isVisible,
  username,
  onSkip,
}: HeaderWelcomeAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const particles = Array.from({ length: 16 }, (_, index) => ({
      x: canvas.width * (0.1 + index / 16),
      y: canvas.height * (0.46 + Math.random() * 0.26),
      radius: 2 + Math.random() * 3,
      speed: 0.8 + Math.random() * 1.5,
      alpha: 0.18 + Math.random() * 0.45,
      drift: 10 + Math.random() * 18,
      phase: index * 0.9,
    }));

    let animationFrame = 0;

    const render = () => {
      const time = performance.now() * 0.012;
      context.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        const travelX = ((time * particle.speed * 10) + particle.phase * 12) % (canvas.width + 50);
        const driftY = Math.sin(time * 2.4 + particle.phase) * particle.drift;

        context.beginPath();
        context.fillStyle = `rgba(148, 163, 184, ${particle.alpha})`;
        context.arc(
          particle.x - travelX,
          particle.y + driftY,
          particle.radius,
          0,
          Math.PI * 2,
        );
        context.fill();
      });

      animationFrame = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const displayName = username?.trim() || 'Khách hàng';

  return (
    <div className="header-welcome-banner" onClick={onSkip} role="presentation" aria-live="polite">
      <div className="header-welcome-track">
        <div className="header-welcome-scene-group">
          <div className="header-welcome-gust" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, index) => (
              <span key={index} className="header-welcome-gust-streak" style={{ animationDelay: `${index * 0.1}s` }} />
            ))}
          </div>

          <div className="header-welcome-moving-pair">
            <div className="header-welcome-car" aria-hidden="true">
              <div className="header-welcome-body">
                <div className="header-welcome-nose" />
                <div className="header-welcome-cockpit" />
                <div className="header-welcome-spoiler" />
                <div className="header-welcome-wing header-welcome-wing-front" />
                <div className="header-welcome-wing header-welcome-wing-rear" />
                <div className="header-welcome-tyre header-welcome-tyre-left" />
                <div className="header-welcome-tyre header-welcome-tyre-right" />
                <div className="header-welcome-rim header-welcome-rim-left" />
                <div className="header-welcome-rim header-welcome-rim-right" />
                <div className="header-welcome-light" />
              </div>
            </div>

            <div className="header-welcome-copy">
              <span className="header-welcome-kicker">WELCOME</span>
              <strong className="header-welcome-text">CHÀO MỪNG ! {displayName}</strong>
            </div>
          </div>

          <canvas ref={canvasRef} className="header-welcome-dust" width={520} height={120} aria-hidden="true" />
        </div>
      </div>

      <button
        type="button"
        className="header-welcome-skip"
        onClick={(event) => {
          event.stopPropagation();
          onSkip();
        }}
      >
        Skip
      </button>
    </div>
  );
}
