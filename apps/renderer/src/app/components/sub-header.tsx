import { createPortal } from 'react-dom';
import { motion, usePresence } from 'motion/react';
import { type ReactNode } from 'react';
import { cn } from '@time-tracker/utils';
import { DEFAULT_TRANSITION } from '@time-tracker/ui';
import { useSubHeaderSlot } from '../contexts/sub-header-slot-context';

interface SubHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SubHeader({ children, className }: SubHeaderProps) {
  const slot = useSubHeaderSlot();
  const [isPresent] = usePresence();

  // When the parent tab is exiting (isPresent=false), position the portaled
  // SubHeader absolutely so it doesn't hold the container's height open.
  // This lets the container shrink immediately to the entering SubHeader's height.
  const content = (
    <motion.div
      layoutId="tab-sub-header"
      className={cn('z-30 bg-background mt-2', className)}
      transition={DEFAULT_TRANSITION}
      style={!isPresent ? { position: 'absolute', width: '100%' } : undefined}
    >
      <motion.div layout transition={DEFAULT_TRANSITION}>
        {children}
      </motion.div>
    </motion.div>
  );

  return slot ? createPortal(content, slot) : content;
}
