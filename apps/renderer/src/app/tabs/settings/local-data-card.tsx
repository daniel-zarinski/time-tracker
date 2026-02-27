import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldDescription,
  Field,
  FieldLabel,
} from '@time-tracker/ui';
import { useDatabasePath, useDatabaseMutations } from '@time-tracker/hooks';
import { Database, FolderOpen, Trash2 } from 'lucide-react';

export function LocalDataCard() {
  const dbPathQuery = useDatabasePath();
  const { deleteDatabase } = useDatabaseMutations();

  const dbPath = dbPathQuery.data ?? null;

  function handleDeleteDatabase() {
    if (
      !window.confirm(
        'Delete all time entries and persisted data? This cannot be undone.'
      )
    ) {
      return;
    }
    deleteDatabase.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted">
            <Database className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold">
            Local data
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Manage data stored locally on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <FieldSet className="gap-3">
            <FieldLegend>Database</FieldLegend>
            <FieldDescription>
              Time entries and other persisted data. Deleting cannot be
              undone.
            </FieldDescription>
            {dbPath && (
              <Field>
                <FieldLabel>Location</FieldLabel>
                <pre className="text-xs font-mono text-muted-foreground bg-muted rounded-md p-2 w-full min-w-0 max-w-full overflow-hidden break-all whitespace-pre-wrap">
                  {dbPath}
                </pre>
                <Field orientation="horizontal">
                  <Button
                    variant="outline"
                    type="button"
                    size="sm"
                    onClick={() => window.electron.showItemInFolder(dbPath)}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Show in folder
                  </Button>
                </Field>
              </Field>
            )}
            <Field orientation="horizontal">
              <Button
                variant="destructive"
                type="button"
                size="sm"
                disabled={deleteDatabase.isPending}
                onClick={handleDeleteDatabase}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete database
              </Button>
            </Field>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
