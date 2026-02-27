'use client';
import { cn } from '@time-tracker/utils';
import { motion, Transition } from 'motion/react';

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
  transition?: Transition;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
  variant?: keyof typeof BORDER_TRAIL_VARIANTS;
};

export function BorderTrail({
  className,
  size = 60,
  transition,
  onAnimationComplete,
  style,
  variant = 'default',
}: BorderTrailProps) {
  const defaultTransition: Transition = {
    repeat: Infinity,
    duration: 5,
    ease: 'linear',
  };

  const variantConfig = BORDER_TRAIL_VARIANTS[variant];

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn('absolute aspect-square', variantConfig.className, className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          boxShadow: variantConfig.boxShadow,
          ...style,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={transition || defaultTransition}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
