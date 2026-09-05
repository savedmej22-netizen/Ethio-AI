import React from 'react';

interface BreathingLoaderProps {
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BreathingLoader: React.FC<BreathingLoaderProps> = ({
  text,
  className = '',
  size = 'md',
}) => {
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  const dotSize = dotSizes[size];

  return (
    <div className={`inline-flex items-center gap-2.5 py-1 px-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className={`${dotSize} rounded-full bg-[#8B7E66] opacity-40 animate-breathing-dot-1`} />
        <span className={`${dotSize} rounded-full bg-[#8B7E66] opacity-70 animate-breathing-dot-2`} />
        <span className={`${dotSize} rounded-full bg-[#8B7E66] opacity-100 animate-breathing-dot-3`} />
      </div>
      {text && (
        <span className="text-xs sm:text-sm font-fidel text-[#8B7E66] font-medium tracking-wide">
          {text}
        </span>
      )}
    </div>
  );
};
