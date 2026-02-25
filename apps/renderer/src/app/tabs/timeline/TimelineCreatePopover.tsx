import * as React from 'react';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  InputGroupAddon,
  InputGroupButton,
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  type ComboboxSelectItem,
} from '@time-tracker/ui';

interface TimelineCreatePopoverProps {
  issues: ComboboxSelectItem[];
  onSubmit: (issueKey: string) => void | Promise<void>;
  onCancel: () => void;
}

export function TimelineCreatePopover({
  issues,
  onSubmit,
  onCancel,
}: TimelineCreatePopoverProps) {
  const [selected, setSelected] = React.useState<ComboboxSelectItem | null>(
    null
  );
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <Popover open>
      <PopoverAnchor className="absolute inset-0" />
      <PopoverContent
        ref={contentRef}
        side="top"
        align="center"
        sideOffset={8}
        className="w-72 p-2"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const input = (e.currentTarget as HTMLElement).querySelector('input');
          input?.focus();
        }}
      >
        <Combobox
          items={issues}
          value={selected}
          onValueChange={(value) => setSelected(value)}
          autoHighlight
        >
          <ComboboxInput
            placeholder="Search issues..."
            showClear
            showTrigger={false}
          >
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={onCancel}>Cancel</InputGroupButton>
              <InputGroupButton
                variant="secondary"
                disabled={!selected}
                onClick={() => {
                  if (selected) onSubmit(selected.value);
                }}
              >
                Save
              </InputGroupButton>
            </InputGroupAddon>
          </ComboboxInput>
          <ComboboxContent anchor={contentRef}>
            <ComboboxList>
              {(item: ComboboxSelectItem) => (
                <ComboboxItem
                  key={item.value}
                  value={item}
                  disabled={item.disabled}
                >
                  <Item className="gap-1 p-0">
                    <ItemContent>
                      <ItemTitle className="whitespace-nowrap">
                        {item.label}
                      </ItemTitle>
                      {item.description && (
                        <ItemDescription>{item.description}</ItemDescription>
                      )}
                    </ItemContent>
                  </Item>
                </ComboboxItem>
              )}
            </ComboboxList>
            <ComboboxEmpty>No results found.</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      </PopoverContent>
    </Popover>
  );
}
