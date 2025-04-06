import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export interface Point {
  x: number;
  y: number;
}

export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createCropperConfig(aspect: number) {
  // Use a default width of 1920 (common HD width)
  const width = 1920;
  const height = Math.round(width / aspect);
  
  return {
    cropShape: 'rect' as const,
    cropSize: { width, height },
    objectFit: 'horizontal-cover' as const,
    showGrid: true,
    aspect,
  };
} 