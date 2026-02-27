import { motion } from 'motion/react';
import { type ReactNode } from 'react';
import { cn } from '@time-tracker/utils';

interface SubHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SubHeader({ children, className }: SubHeaderProps) {
  return (
    <motion.header
      layoutId="tab-sub-header"
      className={cn('sticky top-0 z-30 bg-background', className)}
    >
      <motion.div layout>{children}</motion.div>
    </motion.header>
  );
}
