'use client';

import * as React from 'react';

import { cn } from '@time-tracker/utils';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from './ui/command';

export interface CommandPaletteItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Key to listen for with mod (Cmd/Ctrl). When pressed, triggers onSelect. Also shown in the list (e.g. "1" → "⌘1"). */
  shortcutKey?: string;
  disabled?: boolean;
  onSelect: () => void;
}

export interface CommandPaletteGroup {
  heading?: string;
  items: CommandPaletteItem[];
}

interface CommandPaletteProps
  extends Pick<
    React.ComponentProps<typeof CommandDialog>,
    | 'open'
    | 'onOpenChange'
    | 'title'
    | 'description'
    | 'className'
    | 'showCloseButton'
  > {
  /** Commands to display, grouped by heading. */
  commands: CommandPaletteGroup[];

  /** Keyboard shortcut to toggle. Default: "mod+f". Set to false to disable. */
  shortcut?: string | false;

  /** Search input placeholder */
  placeholder?: string;

  /** Optional trigger button. If provided, renders a button that opens the palette. */
  trigger?: React.ReactNode;

  /** Optional className for the trigger wrapper */
  triggerClassName?: string;

  /** Empty state message when search has no results */
  emptyMessage?: string;
}

function parseShortcut(shortcut: string): { mod: boolean; key: string } | null {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const mod =
    parts.includes('mod') || parts.includes('ctrl') || parts.includes('meta');
  return key ? { mod, key } : null;
}

function CommandPalette({
  open,
  onOpenChange,
  commands,
  shortcut = 'mod+f',
  placeholder = 'Type a command or search...',
  trigger,
  triggerClassName,
  emptyMessage = 'No results found.',
  title,
  description,
  className,
  showCloseButton,
  ...rest
}: CommandPaletteProps) {
  const shortcutConfig = shortcut !== false ? parseShortcut(shortcut) : null;

  const shortcutKeyMap = React.useMemo(() => {
    const map = new Map<string, () => void>();
    for (const group of commands) {
      for (const item of group.items) {
        if (item.shortcutKey && !item.disabled) {
          map.set(item.shortcutKey.toLowerCase(), item.onSelect);
        }
      }
    }
    return map;
  }, [commands]);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const modPressed = e.metaKey || e.ctrlKey;
      if (!modPressed) return;

      const key = e.key.toLowerCase();

      if (shortcutConfig && key === shortcutConfig.key) {
        e.preventDefault();
        onOpenChange?.(true);
        return;
      }

      const onSelect = shortcutKeyMap.get(key);
      if (onSelect) {
        e.preventDefault();
        onSelect();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutConfig, shortcutKeyMap, onOpenChange]);

  return (
    <>
      {trigger && (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange?.(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenChange?.(true);
            }
          }}
          className={cn('cursor-pointer', triggerClassName)}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {trigger}
        </div>
      )}
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        className={className}
        showCloseButton={showCloseButton}
        {...rest}
      >
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          {commands.map((group, groupIndex) => (
            <CommandGroup key={groupIndex} heading={group.heading}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    disabled={item.disabled}
                    onSelect={() => {
                      item.onSelect();
                      onOpenChange?.(false);
                    }}
                  >
                    {Icon && <Icon />}
                    <span>{item.label}</span>
                    {item.shortcutKey && (
                      <CommandShortcut>⌘{item.shortcutKey}</CommandShortcut>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export { CommandPalette };
