'use client';

import { MAX_PAGES_SUBSCRIPTION } from '~/lib/constants';
import { cn } from '~/lib/utils';
import { forwardRef, useEffect, useRef, useState } from "react";

interface Props {
  pageCount: number;
  maxDigits: number;
  isFocused: boolean;
  setIsFocused: (value: boolean) => void;
  setPageCount: (value: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const UnderscoreInput = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [tempValue, setTempValue] = useState<number>(props.pageCount);
  const [isDirty, setIsDirty] = useState(false);

  // Sync tempValue with pageCount when not dirty
  // Use a ref to track previous pageCount to avoid setState in effect
  const prevPageCountRef = useRef(props.pageCount);
  
  useEffect(() => {
    if (!isDirty && props.pageCount !== prevPageCountRef.current) {
      prevPageCountRef.current = props.pageCount;
      // Sync prop to state - this is intentional
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTempValue(props.pageCount);
    }
  }, [props.pageCount, isDirty]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const isTextSelected = selection && selection.toString().length > 0;

    let newValue: number;

    if (isTextSelected && e.key === 'Backspace') {
      const fullText = tempValue.toString();
      const selectionStart = selection?.anchorOffset || 0;
      const selectionEnd = selection?.focusOffset || 0;
      
      const start = fullText.slice(0, Math.min(selectionStart, selectionEnd));
      const end = fullText.slice(Math.max(selectionStart, selectionEnd));
      
      newValue = parseInt(start + end) || 0;
    } else if (e.key >= '0' && e.key <= '9' && tempValue.toString().length < props.maxDigits) {
      newValue = tempValue === 0 ? 
        parseInt(e.key, 10) : 
        parseInt(tempValue.toString() + e.key, 10);
    } else if (e.key === 'Backspace') {
      newValue = tempValue > 9 ? Math.floor(tempValue / 10) : 0;
    } else {
      return;
    }

    setTempValue(newValue);
    setIsDirty(true);
  };

  const handleBlur = () => {
    props.setIsFocused(false);
    
    if (isDirty) {
      let finalValue = tempValue;
      
      if (tempValue !== 5 && tempValue < 50) {
        finalValue = tempValue <= 5 ? 5 : 50;
      } else {
        finalValue = Math.min(tempValue, MAX_PAGES_SUBSCRIPTION);
      }
      
      props.setPageCount(finalValue);
      setIsDirty(false);
    }
  };

  const maxDigits = MAX_PAGES_SUBSCRIPTION.toString().length;
  const currentDigits = tempValue.toString().length;
  const showUnderscore = currentDigits < maxDigits;

  return (
    <div className={cn(
      'p-2 rounded-lg transition-colors duration-300 ease-in-out',
      (isDirty || props.isFocused) && 'bg-muted',
      'hover:bg-muted',
      props.isFocused && showUnderscore && tempValue !== 0 && 'pr-6'
    )}>
      <div className="relative inline-block">
        <div 
          ref={(node) => {
            divRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          tabIndex={0}
          onFocus={() => {
            props.setIsFocused(true);
            setIsDirty(false);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "inline-block w-fit text-center text-3xl rounded-lg bg-transparent outline-none",
            "ease-in-out duration-300",
            "border-0 ring-0 focus:ring-0 hover:ring-0",
            "shadow-none focus:shadow-none hover:shadow-none",
            props.className
          )}
          style={{
            ...props.style,
            minWidth: '1ch',
          }}
          data-test="polydoc-billing-quantity-input"
        >
          <span className='text-current'>{tempValue}</span>
        </div>
        {props.isFocused && showUnderscore && (
          <span 
            className={cn("absolute bottom-1 w-4 h-[1.5px] bg-current animate-blink", {
              '-right-4': props.isFocused,
              'right-0': tempValue === 0,
            })}
            style={{ animation: 'blink 1s step-end infinite' }}
          />
        )}
      </div>
    </div>
  );
});

UnderscoreInput.displayName = 'UnderscoreInput';