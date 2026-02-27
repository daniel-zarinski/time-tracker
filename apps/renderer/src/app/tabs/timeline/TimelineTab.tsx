import { useJiraMyIssues, useTimeEntries } from '@time-tracker/hooks';
import type { ComboboxSelectItem } from '@time-tracker/ui';
import * as React from 'react';
import { TimelineGrid } from './TimelineGrid';
import { TimelineHeader } from './TimelineHeader';
import { TimelineListView } from './TimelineListView';
import { TimelineView } from './timeline-types';
import { isSameDay } from './timeline-utils';
import { TimelineProvider } from './timeline-context';

export function TimelineTab() {
  const [date, setDate] = React.useState(() => new Date());
  const [scrollKey, setScrollKey] = React.useState(0);
  const [view, setView] = React.useState(TimelineView.Timeline);

  const { data: entries = [] } = useTimeEntries();
  const { data: jiraIssues = [] } = useJiraMyIssues();

  const issueItems: ComboboxSelectItem[] = React.useMemo(
    () =>
      jiraIssues
        .filter((i) => i.key != null)
        .map((i) => ({
          value: i.key!,
          label: i.key!,
          description: i.summary ?? undefined,
        })),
    [jiraIssues]
  );

  const filteredEntries = React.useMemo(
    () => entries.filter((e) => isSameDay(new Date(e.startedAt), date)),
    [entries, date]
  );

  const handleSelectDay = React.useCallback((day: Date) => {
    setDate(day);
    setScrollKey((k) => k + 1);
  }, []);

  const previousWeek = React.useCallback(() => {
    const next = new Date(date);
    next.setDate(next.getDate() - 7);
    setDate(next);
  }, [date]);

  const nextWeek = React.useCallback(() => {
    const next = new Date(date);
    next.setDate(next.getDate() + 7);
    setDate(next);
  }, [date]);

  return (
    <div className="flex flex-col">
      <TimelineHeader
        date={date}
        view={view}
        onViewChange={setView}
        onPreviousWeek={previousWeek}
        onNextWeek={nextWeek}
        onSelectDay={handleSelectDay}
      />
      {view === TimelineView.Timeline ? (
        <TimelineProvider date={date} scrollKey={scrollKey} entries={entries} issues={issueItems}>
          <TimelineGrid />
        </TimelineProvider>
      ) : (
        <TimelineListView
          entries={filteredEntries}
          issues={issueItems}
          dateKey={date.toDateString()}
        />
      )}
    </div>
  );
}
