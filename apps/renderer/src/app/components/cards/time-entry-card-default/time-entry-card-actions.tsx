import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlayIcon,
  Trash2Icon,
} from 'lucide-react'
import {
  Button,
  CardFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@time-tracker/ui'

interface TimeEntryCardActionsDropdownProps {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function TimeEntryCardActionsDropdown({
  onView,
  onEdit,
  onDelete,
}: TimeEntryCardActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView() }}>
          <EyeIcon className="size-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
          <PencilIcon className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
        >
          <Trash2Icon className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface TimeEntryCardActionsFooterProps {
  onResume?: () => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function TimeEntryCardActionsFooter({
  onResume,
  onView,
  onEdit,
  onDelete,
}: TimeEntryCardActionsFooterProps) {
  return (
    <CardFooter className="px-3 pb-2.5 gap-2">
      {onResume && (
        <Button variant="outline" size="xs" onClick={onResume}>
          <PlayIcon className="size-3" />
          Resume
        </Button>
      )}
      <Button variant="outline" size="xs" onClick={onView}>
        <EyeIcon className="size-3" />
        View
      </Button>
      <Button variant="outline" size="xs" onClick={onEdit}>
        <PencilIcon className="size-3" />
        Edit
      </Button>
      <div className="flex-1" />
      <Button variant="destructive" size="xs" onClick={onDelete}>
        <Trash2Icon className="size-3" />
        Delete
      </Button>
    </CardFooter>
  )
}
