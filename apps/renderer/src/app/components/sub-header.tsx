import { motion } from 'motion/react';
import { type ReactNode } from 'react';
import { cn } from '@time-tracker/utils';
import { DEFAULT_TRANSITION } from '@time-tracker/ui';

interface SubHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SubHeader({ children, className }: SubHeaderProps) {
  return (
    <motion.div
      layoutId="tab-sub-header"
      className={cn('sticky top-0 z-30 bg-background', className)}
      transition={DEFAULT_TRANSITION}
    >
      <motion.div layout transition={DEFAULT_TRANSITION} className="mt-2">
        {children}
      </motion.div>
    </motion.div>
  );
}
