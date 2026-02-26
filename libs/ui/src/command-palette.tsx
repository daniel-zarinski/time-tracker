'use client';

import * as React from 'react';
import { defaultFilter, useCommandState } from 'cmdk';

import { cn } from '@time-tracker/utils';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from './shadcn/command';

export interface CommandPaletteItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Key to listen for with mod (Cmd/Ctrl). When pressed, triggers onSelect. Also shown in the list (e.g. "1" → "⌘1"). */
  shortcutKey?: string;
  /** Optional keywords to match against when filtering (e.g. Jira key "PROJ-123"). */
  keywords?: string[];
  disabled?: boolean;
  onSelect: () => void;
}

export interface CommandPaletteGroup {
  heading?: string;
  items: CommandPaletteItem[];
  /** When set, limits visible items when search is empty. When user types, all matching items are shown. */
  maxItems?: number;
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

function scoreItem(item: CommandPaletteItem, search: string): number {
  const trimmed = search.trim().toLowerCase();
  if (!trimmed) return 1;
  // Exact keyword match = highest priority
  if (item.keywords?.some((k) => k.toLowerCase() === trimmed)) return 1;
  // Keyword prefix match = high priority
  if (item.keywords?.some((k) => k.toLowerCase().startsWith(trimmed)))
    return 0.95;
  // Use defaultFilter for label/keyword fuzzy match (already uses keywords)
  return defaultFilter(item.label, trimmed, item.keywords);
}

function getVisibleItems(
  group: CommandPaletteGroup,
  search: string
): CommandPaletteItem[] {
  const trimmed = search.trim().toLowerCase();
  if (trimmed) {
    return group.items
      .map((item) => ({ item, score: scoreItem(item, trimmed) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }
  if (group.maxItems != null) {
    return group.items.slice(0, group.maxItems);
  }
  return group.items;
}

interface CommandGroupsRendererProps {
  commands: CommandPaletteGroup[];
  onClose: () => void;
}

function CommandGroupsRenderer({
  commands,
  onClose,
}: CommandGroupsRendererProps) {
  const search = useCommandState((state) => state.search);
  return (
    <>
      {commands.map((group, groupIndex) => {
        const items = getVisibleItems(group, search);
        if (items.length === 0) return null;
        return (
          <CommandGroup key={groupIndex} heading={group.heading}>
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <CommandItem
                  key={item.id}
                  value={item.label}
                  disabled={item.disabled}
                  onSelect={() => {
                    item.onSelect();
                    onClose();
                  }}
                >
                  {Icon && <Icon />}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.shortcutKey && (
                    <CommandShortcut>⌘{item.shortcutKey}</CommandShortcut>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        );
      })}
    </>
  );
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
        shouldFilter={false}
        {...rest}
      >
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroupsRenderer
            commands={commands}
            onClose={() => onOpenChange?.(false)}
          />
        </CommandList>
      </CommandDialog>
    </>
  );
}

export { CommandPalette };
