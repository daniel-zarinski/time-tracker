import {
  AnimatedBackground,
  DEFAULT_TRANSITION,
  TransitionPanel,
} from '@time-tracker/ui';
import { motion } from 'motion/react';
import { useState } from 'react';
import { SubHeader } from '../../components/sub-header';
import { AppConfigurationCard } from './app-configuration-card';
import { JiraIntegrationCard } from './jira-integration-card';
import { LocalDataCard } from './local-data-card';
import { ManualActionsCard } from './manual-actions-card';
import { TempoIntegrationCard } from './tempo-integration-card';

const subtabs = [
  { id: 'app', label: 'App' },
  { id: 'jira', label: 'Jira' },
  { id: 'tempo', label: 'Tempo' },
  { id: 'sync', label: 'Sync' },
  { id: 'data', label: 'Data' },
] as const;

type SubtabId = (typeof subtabs)[number]['id'];

export function SettingsTab() {
  const [activeSubtab, setActiveSubtab] = useState<SubtabId>('app');
  const [direction, setDirection] = useState(1);

  const activeIndex = subtabs.findIndex((t) => t.id === activeSubtab);

  return (
    <div className="flex flex-col">
      <SubHeader>
        <div className="w-full max-w-md mx-auto px-4 pb-2 flex justify-center">
          <motion.div
            layoutId="sub-header-pill"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-2 text-muted-foreground"
          >
            <AnimatedBackground
              defaultValue={activeSubtab}
              onValueChange={(id) => {
                if (id) {
                  const newIndex = subtabs.findIndex((t) => t.id === id);
                  setDirection(newIndex > activeIndex ? -1 : 1);
                  setActiveSubtab(id as SubtabId);
                }
              }}
              className="rounded-md bg-primary/10 shadow-sm"
              transition={DEFAULT_TRANSITION}
            >
              {subtabs.map((tab) => (
                <button
                  key={tab.id}
                  data-id={tab.id}
                  type="button"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[checked=true]:text-foreground"
                >
                  {tab.label}
                </button>
              ))}
            </AnimatedBackground>
          </motion.div>
        </div>
      </SubHeader>

      <TransitionPanel
        activeIndex={activeIndex}
        className="overflow-hidden"
        transition={{ duration: 0.2, ease: DEFAULT_TRANSITION.ease }}
        variants={{
          enter: { opacity: 0, x: direction * 80, filter: 'blur(4px)' },
          center: { opacity: 1, x: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, x: direction * -80, filter: 'blur(4px)' },
        }}
      >
        <div className="w-full max-w-md mx-auto p-4">
          <AppConfigurationCard />
        </div>
        <div className="w-full max-w-md mx-auto p-4">
          <JiraIntegrationCard />
        </div>
        <div className="w-full max-w-md mx-auto p-4">
          <TempoIntegrationCard />
        </div>
        <div className="w-full max-w-md mx-auto p-4">
          <ManualActionsCard />
        </div>
        <div className="w-full max-w-md mx-auto p-4">
          <LocalDataCard />
        </div>
      </TransitionPanel>
    </div>
  );
}
