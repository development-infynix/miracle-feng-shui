import React from 'react';

interface SwatchProps {
  color: string;
  tall?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Swatch({ color, tall = false, className = '', style }: SwatchProps) {
  return (
    <div
      aria-hidden="true"
      className={`w-full ${tall ? 'aspect-[4/5]' : 'aspect-square'} rounded-[10px] transition-transform duration-300 ${className}`}
      style={{
        backgroundColor: color,
        ...style,
      }}
    />
  );
}
