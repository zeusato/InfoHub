import React, { useState, useRef } from 'react';

export interface NeonAnimatedButtonProps {
  label?: string;
  onClick?: () => void;
}

interface Ripple {
  id: number;
  size: number;
  x: number;
  y: number;
}

const NeonAnimatedButton: React.FC<NeonAnimatedButtonProps> = ({ label = 'Test', onClick }) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const newRipple: Ripple = { id: Date.now(), size, x, y };
    setRipples((prev) => [...prev, newRipple]);
    if (onClick) onClick();
  };

  const handleRippleEnd = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      <style>{`
        .neon-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 220px;
          height: 60px;
          padding: 0;
          border: none;
          border-radius: 1rem;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          color: #ABFED4;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1rem;
          font-weight: bold;
          cursor: pointer;
          overflow: hidden;
          /* Disable default glow; neon ring is handled via SVG stroke */
          box-shadow: none;
          transition: box-shadow 0.3s, background 0.3s;
        }
        .neon-btn:hover {
          /* Increase glow on hover (even subtler) */
          box-shadow: 0 0 8px rgba(0,255,255,0.25), 0 0 16px rgba(0,255,255,0.35);
          background: rgba(0,255,255,0.07);
        }
        .neon-btn:active {
          /* Stronger glow when actively pressed */
          box-shadow: 0 0 14px rgba(0,255,255,0.35), 0 0 28px rgba(0,255,255,0.5);
          background: rgba(0,255,255,0.12);
        }
        .neon-btn svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        .neon-btn .ripple {
          position: absolute;
          border-radius: 50%;
          /* Use radial gradient to simulate light spreading from the click point */
          background: radial-gradient(circle, rgba(0,255,255,0.6) 10%, rgba(0,255,255,0.3) 40%, rgba(0,255,255,0) 70%);
          transform: scale(0);
          animation: rippleAnim 0.8s ease-out;
          z-index: 1;
        }
        .neon-btn .label {
          position: relative;
          z-index: 2;
        }
        @keyframes rippleAnim {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
      <button ref={btnRef} className="neon-btn" onClick={handleClick}>
        {/* Animated border using SVG stroke */}
        <svg viewBox="0 0 220 60" xmlns="http://www.w3.org/2000/svg">
          {/* Base subtle border */}
          <rect
            x="3"
            y="3"
            width="214"
            height="54"
            rx="12"
            ry="12"
            fill="none"
            stroke="#08d119ff"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
          {/* Animated highlight segment running around the border */}
          <rect
            x="3"
            y="3"
            width="214"
            height="54"
            rx="12"
            ry="12"
            fill="none"
            stroke="#08d119ff"
            /* Narrower highlight for a more delicate look */
            strokeWidth="1.5"
            strokeLinecap="round"
            /* Shorter dash to make the highlight appear more like a small moving segment */
            strokeDasharray="60 476"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-536"
              dur="4s"
              repeatCount="indefinite"
            />
          </rect>
        </svg>
        <span className="label">{label}</span>
        {/* Ripple effects */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="ripple"
            style={{
              left: `${r.x}px`,
              top: `${r.y}px`,
              width: `${r.size}px`,
              height: `${r.size}px`,
            }}
            onAnimationEnd={() => handleRippleEnd(r.id)}
          />
        ))}
      </button>
    </>
  );
};

export default NeonAnimatedButton;
