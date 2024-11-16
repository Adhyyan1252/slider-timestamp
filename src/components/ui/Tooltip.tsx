import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import NoSsr from "./NoSsr";

interface ITooltipProps {
  children: React.ReactNode;
  content?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
  delayDuration?: number;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  style?: React.CSSProperties;
  inline?: boolean;
}

// Singleton portal root element
let portalRoot: HTMLElement | null = null;

const getPortalRoot = () => {
  if (!portalRoot) {
    portalRoot = document.getElementById("tooltip-root");
    if (!portalRoot) {
      portalRoot = document.createElement("div");
      portalRoot.id = "tooltip-root";
      document.body.appendChild(portalRoot);
    }
  }
  return portalRoot;
};

export const Tooltip = ({
  children,
  content,
  side = "top",
  sideOffset = 5,
  className,
  delayDuration = 700,
  disabled = false,
  align = "center",
  style,
  inline = false,
}: ITooltipProps) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    finalSide: side,
  });
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Ensure portal root exists
    getPortalRoot();
  }, []);

  if (!content || disabled) return <>{children}</>;

  const handleMouseEnter = () => {
    const child = childRef.current;
    if (!child || !tooltipRef.current) return;

    const rect = child.getBoundingClientRect();
    const newPosition = calculatePosition(
      rect,
      side,
      align,
      sideOffset,
      tooltipRef.current
    );
    setPosition(newPosition);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const id = setTimeout(() => setVisible(true), delayDuration);
    timeoutRef.current = id;
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  };

  const calculatePosition = (
    rect: DOMRect,
    tooltipSide: typeof side,
    tooltipAlign: typeof align,
    offset: number,
    tooltipElement: HTMLDivElement | null
  ) => {
    let top = 0;
    let left = 0;
    let finalSide = tooltipSide;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = tooltipElement?.offsetWidth || 0;
    const tooltipHeight = tooltipElement?.offsetHeight || 0;

    switch (tooltipSide) {
      case "top":
        top = rect.top - tooltipHeight - offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        if (top < 0) {
          top = rect.bottom + offset;
          finalSide = "bottom";
        }
        break;
      case "bottom":
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        if (top + tooltipHeight > viewportHeight) {
          top = rect.top - tooltipHeight - offset;
          finalSide = "top";
        }
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - offset;
        if (left < 0) {
          left = rect.right + offset;
          finalSide = "right";
        }
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + offset;
        if (left + tooltipWidth > viewportWidth) {
          left = rect.left - tooltipWidth - offset;
          finalSide = "left";
        }
        break;
    }

    if (finalSide === "left" || finalSide === "right") {
      if (tooltipAlign === "start") top = rect.top;
      if (tooltipAlign === "end") top = rect.bottom - tooltipHeight;
      top = Math.min(Math.max(0, top), viewportHeight - tooltipHeight);
    } else {
      if (tooltipAlign === "start") left = rect.left;
      if (tooltipAlign === "end") left = rect.right - tooltipWidth;
      left = Math.min(Math.max(0, left), viewportWidth - tooltipWidth);
    }

    return { top, left, finalSide };
  };

  return (
    <>
      <div
        className={cn("relative", inline ? "inline-block" : "grid")}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={childRef}
      >
        {children}
      </div>

      <NoSsr>
        {typeof window !== "undefined" &&
          createPortal(
            <div
              ref={tooltipRef}
              className={cn(
                "fixed z-[9999] whitespace-nowrap rounded text-white shadow-lg [&>span]:block",
                "text-wrap bg-[#3399FF]",
                "transition-opacity duration-200",
                className
              )}
              style={{
                ...style,
                position: "fixed",
                top: `${position.top}px`,
                left: `${position.left}px`,
                opacity: visible ? 1 : 0,
                pointerEvents: "none",
              }}
            >
              {content}
            </div>,
            getPortalRoot()
          )}
      </NoSsr>
    </>
  );
};
