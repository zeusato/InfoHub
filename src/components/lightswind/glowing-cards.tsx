"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

export interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverEffect?: boolean;
}

export interface GlowingCardsProps {
  children: React.ReactNode;
  /** ⬅️ className bây giờ áp vào INNER container để điều khiển layout (grid/flex) */
  className?: string;
  enableGlow?: boolean;
  glowRadius?: number;
  glowOpacity?: number;
  animationDuration?: number;
  enableHover?: boolean;
  gap?: string;
  /** Giữ cho tương thích, nhưng mặc định = none để không bó ngang */
  maxWidth?: string;
  /** Padding container; để "0" nếu muốn bám sát */
  padding?: string;
  backgroundColor?: string;
  borderRadius?: string;
  /** Chỉ dùng khi KHÔNG truyền className (mặc định flex layout) */
  responsive?: boolean;
  customTheme?: {
    cardBg?: string;
    cardBorder?: string;
    textColor?: string;
    hoverBg?: string;
  };
}

export const GlowingCard: React.FC<GlowingCardProps> = ({
  children,
  className,
  glowColor = "#3b82f6",
  hoverEffect = true,
  ...props
}) => {
  return (
      <div
        className={cn(
          "relative isolate flex-1 min-w-[14rem] p-6 rounded-2xl text-black dark:text-white",
          "bg-background border",
          "transition-all duration-400 ease-out",
          className
        )}
        style={{ "--glow-color": glowColor } as React.CSSProperties}
      >
        {children}
      </div>
  );
};

export const GlowingCards: React.FC<GlowingCardsProps> = ({
  children,
  className,              // ⬅️ sẽ áp vào INNER thay vì outer
  enableGlow = true,
  glowRadius = 25,
  glowOpacity = 1,
  animationDuration = 400,
  enableHover = true,
  gap = "2.5rem",
  maxWidth = "none",      // ⬅️ bỏ giới hạn bề ngang mặc định
  padding = "0",          // ⬅️ mặc định không thêm padding
  backgroundColor,
  borderRadius = "1rem",
  responsive = true,
  customTheme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay || !enableGlow) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setShowOverlay(true);
      overlay.style.setProperty("--x", x + "px");
      overlay.style.setProperty("--y", y + "px");
      overlay.style.setProperty("--opacity", String(glowOpacity));
    };

    const handleMouseLeave = () => {
      setShowOverlay(false);
      overlay.style.setProperty("--opacity", "0");
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enableGlow, glowOpacity]);

  const containerStyle = {
    "--gap": gap,
    "--max-width": maxWidth,
    "--padding": padding,
    "--border-radius": borderRadius,
    "--animation-duration": animationDuration + "ms",
    "--glow-radius": glowRadius + "rem",
    "--glow-opacity": glowOpacity,
    backgroundColor: backgroundColor || undefined,
    ...customTheme,
  } as React.CSSProperties;

  // Layout mặc định khi KHÔNG truyền className: flex responsive
  const defaultInnerLayout = cn(
    "flex items-stretch justify-stretch flex-wrap gap-[var(--gap)]",
    responsive && "flex-col sm:flex-row"
  );

  return (
    // Outer: chỉ giữ relative + w-full, KHÔNG áp className grid ở đây
    <div className="relative w-full h-full" style={containerStyle}>
      <div
        ref={containerRef}
        className="relative w-full h-full"
        style={{ padding: "var(--padding)" }}
      >
        {/* INNER: nơi nhận className để layout (grid/flex…) */}
        <div className={cn(className || defaultInnerLayout)} style={{ maxWidth, margin: "0 auto" }}>
          {children}
        </div>

        {enableGlow && (
          <div
            ref={overlayRef}
            className={cn(
              "absolute inset-0 pointer-events-none select-none",
              "opacity-0 transition-all duration-[var(--animation-duration)] ease-out"
            )}
            style={{
              WebkitMask:
                "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              mask:
                "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              opacity: showOverlay ? "var(--opacity)" : "0",
              isolation: "isolate", // tách blend của overlay
            }}
          >
            <div
              className={cn(className || defaultInnerLayout)}
              style={{ maxWidth, margin: "0 auto", padding: "var(--padding)" }}
            >
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === GlowingCard) {
                  const props = child.props as any;
                  const cardGlowColor = props.glowColor || "#3b82f6";

                  // Nếu card tắt hoverEffect -> overlay không phủ
                  if (props.hoverEffect === false) {
                    return (
                      <div
                        className={cn(props.className)}
                        style={{ ...(props.style || {}), visibility: "hidden" }}
                      />
                    );
                  }

                  // RING-ONLY: KHÔNG đổi nền, chỉ viền + glow
                  return React.cloneElement(child as React.ReactElement<any>, {
                    className: cn(props.className),
                    style: {
                      ...(props.style || {}),
                      borderColor: cardGlowColor,
                      boxShadow: `
                        0 0 0 1px inset ${cardGlowColor},
                        0 0 28px 6px ${cardGlowColor}40
                      `,
                    },
                  });
                }
                return child;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { GlowingCards as default };
