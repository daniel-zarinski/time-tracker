import * as React from 'react';
import {
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
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-md border bg-popover p-2 text-popover-foreground shadow-md"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Combobox
        items={issues}
        value={selected}
        onValueChange={(value) => setSelected(value)}
        autoHighlight
      >
        <ComboboxInput
          placeholder="Search issues..."
          showTrigger={false}
          autoFocus
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
        <ComboboxContent anchor={containerRef}>
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
    </div>
  );
}
