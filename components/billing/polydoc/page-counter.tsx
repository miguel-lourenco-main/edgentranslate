'use client';

import { useEffect, useRef, useState } from 'react';
import Slider from '~/components/shadcn/slider';
import { UnderscoreInput } from '~/components/magic-ui/underscore-input';
import { MAX_PAGES_SUBSCRIPTION } from '~/lib/constants';
import { CurrentBillingInfo } from '~/lib/interfaces';
import { TierEffect } from '~/components/magic-ui/tier-effect';
import { cn } from '~/lib/utils';

interface PageAmountInputProps {
  onPageCountChange: (pageCount: number) => void;
  billingInfo: CurrentBillingInfo;
  value: number;
  className?: string;
}

const MAX_DIGITS = 7;

export function PageAmountInput({ value, onPageCountChange, billingInfo, className }: PageAmountInputProps) {
  const [pageCount, setPageCount] = useState(value ?? 50);
  const [lastValidValue, setLastValidValue] = useState(value ?? 50);
  const [isFocused, setIsFocused] = useState(false);
  const prevValueRef = useRef(value);
  const lastValidValueRef = useRef(value ?? 50);

  const updatePageCount = (value: number) => {
    let newValue;
    
    // Check for digit limit
    if (value.toString().length > MAX_DIGITS) {
      newValue = lastValidValue;
    }
    // If we're in the forbidden range (>5 and <50)
    else if (value > 5 && value < 50) {
      // Stick to the last valid value
      newValue = lastValidValue;
    } else {
      // Outside forbidden range - clamp to valid ranges
      newValue = Math.min(Math.max(5, value), MAX_PAGES_SUBSCRIPTION);
      setLastValidValue(newValue); // Update last valid value
      lastValidValueRef.current = newValue; // Update ref as well
    }    
    
    setPageCount(newValue);
    onPageCountChange(newValue);
  };

  const valueToSliderPosition = (value: number) => {
    // Special handling for the dead zone (5-50)
    if (value <= 5) {
      return 0;
    } else if (value > 50) {
      // Normalize the range above 50 to use most of the slider
      const normalizedValue = (value - 50);
      const normalizedMax = MAX_PAGES_SUBSCRIPTION - 50;
      // Use 95% of the slider for the actual valid range
      // Using Math.pow with 0.5 creates a square root curve
      return 0.05 + (0.95 * Math.pow(normalizedValue / normalizedMax, 0.5));
    }
    // Return the minimum valid position for any value in dead zone
    return 0.025;
  };

  const sliderPositionToValue = (position: number) => {
    // Handle the compressed dead zone (0-5% of the slider)
    if (position <= 0.025) {
      return 5;
    } else if (position <= 0.05) {
      return 50;
    }
    // Handle the rest of the range (5-100% of the slider)
    const normalizedPosition = (position - 0.05) / 0.95;
    const normalizedMax = MAX_PAGES_SUBSCRIPTION - 50;
    // Using Math.pow with 2 creates a quadratic curve (inverse of square root)
    return Math.round(50 + normalizedMax * Math.pow(normalizedPosition, 2));
  };

  // Sync pageCount with value prop when it changes
  // This is a valid use case for syncing props to state
  useEffect(() => {
    if (value !== undefined && value !== prevValueRef.current) {
      prevValueRef.current = value;
      const newValue = value.toString().length > MAX_DIGITS ? lastValidValueRef.current : value;
      
      // Sync prop to state - this is intentional
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPageCount(newValue);
      setLastValidValue(newValue);
      lastValidValueRef.current = newValue;
    }
  }, [value]); // Only depend on value prop, use refs to track previous values

  const maxDigits = MAX_PAGES_SUBSCRIPTION.toString().length;

  const tierTag = () => {
    
    const effectConfigs = {
      0: { // Free tier
        type: 'beam' as const,
        colors: { from: "#ffaa40", to: "#9c40ff" }
      },
      1: { // Pro tier
        type: 'shine' as const,
        colors: { from: "#A07CFE", to: "#FE8FB5" }
      },
      2: { // Business tier
        type: 'neon' as const,
        colors: { from: "#ff00aa", to: "#00FFF1" }
      }
    };

    const config = effectConfigs[billingInfo.tierIndex as keyof typeof effectConfigs];
    
    if (!config) return null;

    return (
      <TierEffect
        effectType={billingInfo.productName == 'Free' ? 'none' : config.type}
        colors={config.colors}
      >
        {billingInfo.tierText}
      </TierEffect>
    );
  };

  const handleMarkerClick = (value: number) => {
    updatePageCount(value);
  };

  return (
    <div className={cn('text-center py-2', className)}>
      <div className='flex flex-col items-center gap-y-4'>
        <h2 className="text-4xl font-bold">Pages</h2>
        
        <div className='w-[60%] relative'>
          <div className='mb-6'>
            <div className='flex justify-center'>
              <div className='relative'>
                <UnderscoreInput
                  maxDigits={maxDigits}
                  pageCount={pageCount}
                  setPageCount={updatePageCount}
                  isFocused={isFocused}
                  setIsFocused={setIsFocused}
                />
                <div className='absolute left-full ml-4 top-1/2 -translate-y-1/2'>
                  {tierTag()}
                </div>
              </div>
            </div>
          </div>

          <Slider
            min={0}
            max={1}
            step={0.001}
            value={[valueToSliderPosition(pageCount)]}
            onValueChange={(value) => updatePageCount(sliderPositionToValue(value[0] ?? 0))}
            className="w-full"
          />
          
          <div className="relative w-full mt-3">
            <button
              onClick={() => handleMarkerClick(5)}
              className="absolute text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              style={{ left: `calc(${valueToSliderPosition(5) * 100}% + 10px)`, transform: 'translateX(-50%)' }}
            >
              5
            </button>
            <button 
              onClick={() => handleMarkerClick(50)}
              className="absolute text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              style={{ left: `calc(${valueToSliderPosition(50) * 100}% + 10px)`, transform: 'translateX(-50%)' }}
            >
              50
            </button>
            <button 
              onClick={() => handleMarkerClick(100)}
              className="absolute text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              style={{ left: `calc(${valueToSliderPosition(100) * 100}% + 8px)`, transform: 'translateX(-50%)' }}
            >
              100
            </button>
            <button 
              onClick={() => handleMarkerClick(2000)}
              className="absolute text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              style={{ left: `calc(${valueToSliderPosition(2000) * 100}%)`, transform: 'translateX(-50%)' }}
            >
              2000
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}