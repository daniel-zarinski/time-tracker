'use client';
import { cn } from '@time-tracker/utils';

let keyframesInjected = false;
function injectKeyframes() {
  if (keyframesInjected) return;
  keyframesInjected = true;
  const style = document.createElement('style');
  style.textContent = '@keyframes border-trail{from{offset-distance:0%}to{offset-distance:100%}}';
  document.head.appendChild(style);
}

const BORDER_TRAIL_VARIANTS = {
  default: {
    className: 'bg-zinc-500',
    boxShadow:
      '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
  },
  red: {
    className: 'bg-red-500',
    boxShadow:
      '0px 0px 60px 30px rgb(239 68 68 / 50%), 0 0 100px 60px rgb(185 28 28 / 50%), 0 0 140px 90px rgb(127 29 29 / 50%)',
  },
} as const;

export type BorderTrailProps = {
  className?: string;
  size?: number;
  duration?: number;
  style?: React.CSSProperties;
  variant?: keyof typeof BORDER_TRAIL_VARIANTS;
};

export function BorderTrail({
  className,
  size = 60,
  duration = 5,
  style,
  variant = 'default',
}: BorderTrailProps) {
  const variantConfig = BORDER_TRAIL_VARIANTS[variant];
  injectKeyframes();

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <div
        className={cn('absolute aspect-square', variantConfig.className, className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          boxShadow: variantConfig.boxShadow,
          animation: `border-trail ${duration}s linear infinite`,
          ...style,
        }}
      />
    </div>
  );
}
