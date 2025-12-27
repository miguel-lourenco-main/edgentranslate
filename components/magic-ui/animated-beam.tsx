"use client";

import { RefObject, useEffect, useId, useState } from "react";

import { cn } from '~/lib/utils';

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>; // Container ref
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  flowToCenter?: boolean; // true for input beams (flow TO center), false for output beams (flow FROM center)
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  flowToCenter = true,
  // Duration prop kept for API compatibility but uses random duration internally
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  duration = 4,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  // Generate random duration between 2.5 and 4 seconds on mount
  const [randomDuration] = useState(() => Math.random() * 1.5 + 2.5);

  // Increase speed by dividing duration by 1.6
  const adjustedDuration = randomDuration / 1.6;

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        const controlY = startY - curvature;
        const d = `M ${startX},${startY} Q ${
          (startX + endX) / 2
        },${controlY} ${endX},${endY}`;
        setPathD(d);
      }
    };

    // Initialize ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      // Recalculate the path on resize
      updatePath();
    });

    // Observe the container element
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Call the updatePath initially to set the initial path
    updatePath();

    // Clean up the observer on component unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  return (
    <svg
      width={svgDimensions.width}
      height={svgDimensions.height}
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
        className,
      )}
    >
      <defs>
        <linearGradient
          id={`gradient-${id}`}
          gradientUnits="userSpaceOnUse"
          x1={flowToCenter ? "100%" : "0%"}
          y1="0%"
          x2={flowToCenter ? "0%" : "100%"}
          y2="0%"
        >
          <stop offset="0%" stopColor={flowToCenter ? "transparent" : gradientStartColor} />
          <stop offset="30%" stopColor={flowToCenter ? gradientStartColor : gradientStopColor} />
          <stop offset="70%" stopColor={flowToCenter ? gradientStopColor : gradientStartColor} />
          <stop offset="100%" stopColor={flowToCenter ? gradientStartColor : "transparent"} />
        </linearGradient>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
      />
      <path
        d={pathD}
        fill="none"
        stroke={`url(#gradient-${id})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
        strokeDasharray="30 200"
        strokeDashoffset="0"
        style={{
          animation: `dash ${adjustedDuration}s linear infinite${flowToCenter ? "" : ""}`,
        }}
      />
    </svg>
  );
};
