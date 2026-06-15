import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'food' | 'recipe';
  customFallback?: string;
}

// Global cache to remember broken URLs so we don't retry them when navigating
const brokenImagesCache = new Set<string>();

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  fallbackType = 'food',
  customFallback,
  alt,
  ...props 
}) => {
  // Determine which fallback image to use
  const defaultFallback = customFallback || (fallbackType === 'recipe' ? '/default-dish.png' : '/default-food.png');
  
  // If the src is already known to be broken, start with the fallback immediately
  const initialSrc = (src && !brokenImagesCache.has(src)) ? src : defaultFallback;
  
  const [imgSrc, setImgSrc] = useState<string | undefined>(initialSrc);
  const [hasError, setHasError] = useState(false);

  // If the parent changes the src prop, reset our state
  useEffect(() => {
    const newInitial = (src && !brokenImagesCache.has(src)) ? src : defaultFallback;
    setImgSrc(newInitial);
    setHasError(false);
  }, [src, defaultFallback]);

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt || 'Image'}
      onError={(e) => {
        // Prevent infinite loop if the fallback image itself is broken
        if (!hasError) {
          if (src) brokenImagesCache.add(src); // Remember this URL is broken
          setImgSrc(defaultFallback);
          setHasError(true);
        }
        // If parent provided an onError, call it
        if (props.onError) {
          props.onError(e);
        }
      }}
    />
  );
};

export default ImageWithFallback;
