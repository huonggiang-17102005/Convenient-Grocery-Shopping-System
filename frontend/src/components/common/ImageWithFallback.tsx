import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'food' | 'recipe';
  customFallback?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  fallbackType = 'food',
  customFallback,
  alt,
  ...props 
}) => {
  // Determine which fallback image to use
  const defaultFallback = customFallback || (fallbackType === 'recipe' ? '/default-dish.png' : '/default-food.png');
  
  const [imgSrc, setImgSrc] = useState<string | undefined>(src || defaultFallback);
  const [hasError, setHasError] = useState(false);

  // If the parent changes the src prop, reset our state
  useEffect(() => {
    setImgSrc(src || defaultFallback);
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
