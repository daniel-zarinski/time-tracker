'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from './ui/combobox';
import { Item, ItemContent, ItemDescription, ItemTitle } from './ui/item';

export interface ComboboxSelectItem {
  /** Unique value used for selection and form submission. */
  value: string;
  /** Display label shown in the input and as the item title. */
  label: string;
  /** Secondary text shown below the label. */
  description?: string;
  /** Whether this item is disabled. */
  disabled?: boolean;
}

export interface ComboboxSelectProps<T extends ComboboxSelectItem> {
  /** The items to display and filter. */
  items: readonly T[];

  /** The selected value (controlled). */
  value?: T | null;
  /** Default selected value (uncontrolled). */
  defaultValue?: T | null;
  /** Called when the selected value changes. */
  onValueChange?: (
    value: T | null,
    eventDetails: ComboboxPrimitive.Root.ChangeEventDetails
  ) => void;

  /** Input placeholder text. @default 'Search...' */
  placeholder?: string;
  /** Text shown when no items match. @default 'No results found.' */
  emptyMessage?: string;
  /** Show clear button. @default false */
  showClear?: boolean;
  /** Show dropdown chevron trigger. @default true */
  showTrigger?: boolean;
  /** Disabled state. @default false */
  disabled?: boolean;
  /** Auto-highlight first match while typing. @default true */
  autoHighlight?: boolean;
  /** Additional className for the input group. */
  className?: string;

  /** Name for hidden form input. */
  name?: string;
  /** Required for form submission. @default false */
  required?: boolean;

  /** Container element for the combobox portal. Use to render inside a Dialog. */
  container?: HTMLElement | null;
}

export function ComboboxSelect<T extends ComboboxSelectItem>({
  items,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Search...',
  emptyMessage = 'No results found.',
  showClear = false,
  showTrigger = true,
  disabled = false,
  autoHighlight = true,
  className,
  name,
  required = false,
  container,
}: ComboboxSelectProps<T>) {
  return (
    <Combobox
      items={items}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      autoHighlight={autoHighlight}
      disabled={disabled}
      name={name}
      required={required}
    >
      <ComboboxInput
        placeholder={placeholder}
        showClear={showClear}
        showTrigger={showTrigger}
        disabled={disabled}
        className={className}
      />
      <ComboboxContent container={container}>
        <ComboboxList>
          {(item: T) => (
            <ComboboxItem key={item.value} value={item} disabled={item.disabled}>
              <Item className="p-0 gap-1">
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
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
