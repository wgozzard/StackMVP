import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from '@/lib/utils';
import { createCropperConfig } from '@/lib/utils';

interface ImageCropperProps {
  imageUrl: string;
  aspect?: number;
  onCropComplete?: (croppedArea: Area) => void;
  className?: string;
}

export function ImageCropper({
  imageUrl,
  aspect = 1,
  onCropComplete,
  className,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const config = createCropperConfig(aspect);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      onCropComplete?.(croppedAreaPixels);
    },
    [onCropComplete]
  );

  return (
    <div className={`relative h-[400px] w-full ${className}`}>
      <Cropper
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        aspect={config.aspect}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
        cropShape={config.cropShape}
        showGrid={config.showGrid}
        classes={{
          containerClassName: 'h-full w-full',
          mediaClassName: 'object-contain',
        }}
      />
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-white/90 p-2 shadow-lg dark:bg-gray-800/90">
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-label="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="h-1 w-32 appearance-none rounded-lg bg-gray-200 accent-blue-500 dark:bg-gray-700"
        />
      </div>
    </div>
  );
} 