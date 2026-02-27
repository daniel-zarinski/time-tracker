'use client';
import { cn } from '@time-tracker/utils';
import { motion, SpringOptions, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: React.ElementType;
  /** Custom formatter for display. Default: toLocaleString of rounded value. */
  formatter?: (value: number) => string;
};

export function AnimatedNumber({
  value,
  className,
  springOptions,
  as = 'span',
  formatter = (v) => Math.round(v).toLocaleString(),
}: AnimatedNumberProps) {
  const MotionComponent = motion.create<React.ElementType>(as);

  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, formatter);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <MotionComponent className={cn('tabular-nums', className)}>
      {display}
    </MotionComponent>
  );
}
