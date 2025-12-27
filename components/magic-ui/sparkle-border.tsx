"use client";

import { useEffect, useRef } from "react";

interface SparkleBorderProps {
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
}

const sparkleColors = [
  'hsl(var(--primary))',
  '#FF69B4',  // Hot pink
  '#9C27B0',  // Purple
  '#E91E63',  // Pink
  '#BA68C8',  // Light purple
] as const;

export function SparkleBorder({
  children,
  className = "",
  isSelected = false
}: SparkleBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!isSelected) return;

    const container = containerRef.current;
    if (!container) return;

    const createSparkle = () => {
      const sparkle = document.createElement('div');
      const colorIndex = Math.floor(Math.random() * sparkleColors.length);
      const color = sparkleColors[colorIndex] as string;
      
      sparkle.className = 'absolute w-6 h-6 opacity-0 pointer-events-none z-10';
      sparkle.style.backgroundColor = 'transparent';
      
      sparkle.style.setProperty('--sparkle-color', color);
      sparkle.style.setProperty('--sparkle-size', '30px');
      sparkle.style.setProperty('--sparkle-glow', `0 0 12px ${color}`);
      
      sparkle.style.position = 'absolute';
      sparkle.style.transform = 'rotate(0deg)';
      
      const uniqueId = `sparkle-${Math.random().toString(36).substr(2, 9)}`;
      sparkle.id = uniqueId;
      
      const style = document.createElement('style');
      style.textContent = `
        #${uniqueId}::before,
        #${uniqueId}::after {
          content: '';
          position: absolute;
          background-color: var(--sparkle-color);
          box-shadow: var(--sparkle-glow);
        }
        
        #${uniqueId}::before {
          width: var(--sparkle-size);
          height: 4px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          clip-path: polygon(15% 50%, 50% 0%, 85% 50%, 50% 100%);
        }
        
        #${uniqueId}::after {
          width: 4px;
          height: var(--sparkle-size);
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          clip-path: polygon(50% 15%, 100% 50%, 50% 85%, 0% 50%);
        }
      `;
      
      document.head.appendChild(style);
      container.appendChild(sparkle);
      sparklesRef.current.push(sparkle);

      // Random position along the border
      const side = Math.floor(Math.random() * 4);
      const progress = Math.random();
      const rect = container.getBoundingClientRect();

      let x = 0;
      let y = 0;

      switch (side) {
        case 0: // top
          x = progress * rect.width;
          y = 0;
          break;
        case 1: // right
          x = rect.width;
          y = progress * rect.height;
          break;
        case 2: // bottom
          x = progress * rect.width;
          y = rect.height;
          break;
        case 3: // left
          x = 0;
          y = progress * rect.height;
          break;
      }

      // Adjust position to account for larger size
      x -= 15;
      y -= 15;

      sparkle.style.left = `${x}px`;
      sparkle.style.top = `${y}px`;

      const keyframes = [
        { opacity: 0, transform: 'scale(0) rotate(0deg)' },
        { opacity: 1, transform: 'scale(1) rotate(180deg)' },
        { opacity: 0, transform: 'scale(0) rotate(360deg)' }
      ];

      const animation = sparkle.animate(keyframes, {
        duration: 2000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      });

      animation.onfinish = () => {
        sparkle.remove();
        style.remove();
        sparklesRef.current = sparklesRef.current.filter(s => s !== sparkle);
      };
    };

    const interval = setInterval(createSparkle, 200);

    return () => {
      clearInterval(interval);
      sparklesRef.current.forEach(sparkle => sparkle.remove());
      sparklesRef.current = [];
    };
  }, [isSelected]);

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`}
    >
      {children}
      <div
        style={{
          borderColor: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground/30))',
          transition: 'border-color 0.3s ease'
        }}
        className="absolute inset-0 rounded-md border-2 pointer-events-none"
      />
    </div>
  );
} 