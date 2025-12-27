"use client";

import React, { forwardRef, useRef } from "react";

import { cn } from '~/lib/utils';
import { AnimatedBeam } from "./animated-beam";
import { IconPDF, IconDOCX, IconPPTX, IconCSV, PolydocFirstLetterIcon } from '~/lib/icons';

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; style?: React.CSSProperties }
>(({ className, children, style }, ref) => {
  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 border-border bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamTranslatedFiles({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Left inputs
  const leftInput1Ref = useRef<HTMLDivElement>(null);
  const leftInput2Ref = useRef<HTMLDivElement>(null);
  const leftInput3Ref = useRef<HTMLDivElement>(null);
  const leftInput4Ref = useRef<HTMLDivElement>(null);
  const leftInput5Ref = useRef<HTMLDivElement>(null);
  // Right inputs
  const rightInput1Ref = useRef<HTMLDivElement>(null);
  const rightInput2Ref = useRef<HTMLDivElement>(null);
  const rightInput3Ref = useRef<HTMLDivElement>(null);
  const rightInput4Ref = useRef<HTMLDivElement>(null);
  const rightInput5Ref = useRef<HTMLDivElement>(null);
  // Center and outputs
  const centerRef = useRef<HTMLDivElement>(null);
  const output1Ref = useRef<HTMLDivElement>(null);
  const output2Ref = useRef<HTMLDivElement>(null);
  const output3Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "relative flex min-h-[28rem] min-w-[32rem] items-center justify-center overflow-hidden",
        className,
      )}
      ref={containerRef}
    >
      <div className="flex size-fit flex-col items-center justify-center">
        <div className="relative">
          {/* Left inputs - curved outward using quadratic positioning */}
          <div className="absolute -left-48 -top-16">
            <div className="relative">
              <Circle ref={leftInput1Ref} className="absolute" style={{ transform: 'translate(-15px, 0px)' }}><IconPDF className="size-8" /></Circle>
              <Circle ref={leftInput2Ref} className="absolute" style={{ transform: 'translate(0px, -40px)' }}><IconDOCX className="size-8" /></Circle>
              <Circle ref={leftInput3Ref} className="absolute" style={{ transform: 'translate(15px, -75px)' }}><IconPPTX className="size-8" /></Circle>
              <Circle ref={leftInput4Ref} className="absolute" style={{ transform: 'translate(45px, -95px)' }}><IconCSV className="size-8" /></Circle>
              <Circle ref={leftInput5Ref} className="absolute" style={{ transform: 'translate(85px, -100px)' }}>
                <div className="flex items-center justify-center">
                  <span className="text-foreground dark:text-background text-sm font-semibold">+3</span>
                </div>
              </Circle>
            </div>
          </div>

          {/* Right inputs - curved outward using quadratic positioning */}
          <div className="absolute -right-40 -top-16">
            <div className="relative">
              <Circle ref={rightInput1Ref} className="absolute" style={{ transform: 'translate(15px, 0px)' }}>
                <span className="text-xl">🇬🇧</span>
              </Circle>
              <Circle ref={rightInput2Ref} className="absolute" style={{ transform: 'translate(0px, -40px)' }}>
                <span className="text-xl">🇨🇳</span>
              </Circle>
              <Circle ref={rightInput3Ref} className="absolute" style={{ transform: 'translate(-15px, -75px)' }}>
                <span className="text-xl">🇪🇸</span>
              </Circle>
              <Circle ref={rightInput4Ref} className="absolute" style={{ transform: 'translate(-45px, -95px)' }}>
                <span className="text-xl">🇫🇷</span>
              </Circle>
              <Circle ref={rightInput5Ref} className="absolute" style={{ transform: 'translate(-85px, -100px)' }}>
                <div className="flex items-center justify-center">
                  <span className="text-foreground dark:text-background text-sm font-semibold">+50</span>
                </div>
              </Circle>
            </div>
          </div>

          {/* Center circle */}
          <div className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Circle ref={centerRef} className="size-16">
              <PolydocFirstLetterIcon className="size-8" />
            </Circle>
          </div>

          {/* Output circles - concave curve */}
          <div className="absolute z-20 -bottom-36 left-1/2 -translate-x-1/2">
            <div className="relative flex gap-8">
              <Circle ref={output1Ref} style={{ transform: 'translateY(-8px)' }}>
                <div className="relative">
                  <IconPDF className="size-8" />
                  <div className="absolute -top-5 -right-5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                    <span className="text-sm">🇨🇳</span>
                  </div>
                </div>
              </Circle>
              <Circle ref={output2Ref} style={{ transform: 'translateY(0px)' }}>
                <div className="relative">
                  <IconDOCX className="size-8" />
                  <div className="absolute -top-5 -right-5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                    <span className="text-sm">🇪🇸</span>
                  </div>
                </div>
              </Circle>
              <Circle ref={output3Ref} style={{ transform: 'translateY(-8px)' }}>
                <div className="relative">
                  <IconPPTX className="size-8" />
                  <div className="absolute -top-5 -right-5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                    <span className="text-sm">🇫🇷</span>
                  </div>
                </div>
              </Circle>
            </div>
          </div>
        </div>
      </div>

      {/* AnimatedBeam components with adjusted connection points */}
      {/* Top left input beams - TO center */}
      <AnimatedBeam containerRef={containerRef} fromRef={leftInput1Ref} toRef={centerRef} startYOffset={6} endYOffset={-6} curvature={-30} flowToCenter={true} />
      <AnimatedBeam containerRef={containerRef} fromRef={leftInput2Ref} toRef={centerRef} startYOffset={6} endYOffset={-6} curvature={-30} flowToCenter={true} />
      <AnimatedBeam containerRef={containerRef} fromRef={leftInput3Ref} toRef={centerRef} startYOffset={6} endYOffset={-6} curvature={-30} flowToCenter={true} />
      <AnimatedBeam containerRef={containerRef} fromRef={leftInput4Ref} toRef={centerRef} startYOffset={6} endYOffset={-6} curvature={-30} flowToCenter={true} />
      <AnimatedBeam containerRef={containerRef} fromRef={leftInput5Ref} toRef={centerRef} startYOffset={6} endYOffset={-6} curvature={-30} flowToCenter={true} />

      {/* Top right input beams - TO center */}
      <AnimatedBeam containerRef={containerRef} fromRef={rightInput1Ref} toRef={centerRef} startYOffset={6} endYOffset={-6} curvature={30} flowToCenter={true} />
      <AnimatedBeam containerRef={containerRef} fromRef={rightInput2Ref} toRef={centerRef} startYOffset={6} endYOffset={-6} curvature={30} flowToCenter={true} />
      <AnimatedBeam containerRef={containerRef} fromRef={rightInput3Ref} toRef={centerRef} startYOffset={6} endYOffset={-6} curvature={30} flowToCenter={true} />
      <AnimatedBeam containerRef={containerRef} fromRef={rightInput4Ref} toRef={centerRef} startYOffset={6} endYOffset={-6} curvature={30} flowToCenter={true} />
      <AnimatedBeam containerRef={containerRef} fromRef={rightInput5Ref} toRef={centerRef} startYOffset={6} endYOffset={-6} curvature={30} flowToCenter={true} />

      {/* Bottom output beams - FROM center */}
      <AnimatedBeam containerRef={containerRef} fromRef={centerRef} toRef={output1Ref} startYOffset={6} endYOffset={-6} curvature={-20} flowToCenter={false} />
      <AnimatedBeam containerRef={containerRef} fromRef={centerRef} toRef={output2Ref} startYOffset={6} endYOffset={-6} curvature={-20} flowToCenter={false} />
      <AnimatedBeam containerRef={containerRef} fromRef={centerRef} toRef={output3Ref} startYOffset={6} endYOffset={-6} curvature={-20} flowToCenter={false} />
    </div>
  );
}