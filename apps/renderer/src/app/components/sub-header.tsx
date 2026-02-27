import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { type ReactNode } from 'react';
import { cn } from '@time-tracker/utils';
import { useSubHeaderSlot } from '../contexts/sub-header-slot-context';

interface SubHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SubHeader({ children, className }: SubHeaderProps) {
  const slot = useSubHeaderSlot();

  const content = (
    <motion.div
      layoutId="tab-sub-header"
      className={cn('z-30 bg-background', className)}
    >
      <motion.div layoutId="tab-sub-header-content" layout>{children}</motion.div>
    </motion.div>
  );

  return slot ? createPortal(content, slot) : content;
}
