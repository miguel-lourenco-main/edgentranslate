import { Loader } from "lucide-react";

/**
 * GeneralLoading Component
 * A reusable loading spinner component that centers itself in its container
 * 
 * Features:
 * - Centered loading spinner
 * - Primary color styling
 * - Spinning animation
 * - Full size container
 * 
 * @returns A centered loading spinner with animation
 */
export default function GeneralLoading() {
  return (
    // Container with full size and centering
    <div className='size-full flex items-center justify-center'>
      {/* Loading spinner with primary color and animation */}
      <Loader className='stroke-primary w-8 h-8 animate-spin' />
    </div>
  )
}