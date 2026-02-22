import { StateCreator } from 'zustand';

export interface TimerSlice {
  elapsed: number;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const createTimerSlice: StateCreator<
  TimerSlice,
  [['zustand/devtools', never]],
  [],
  TimerSlice
> = (set) => ({
  elapsed: 0,
  isRunning: false,
  startTimer: () => set({ isRunning: true }, false, 'timer/start'),
  stopTimer: () => set({ isRunning: false }, false, 'timer/stop'),
  resetTimer: () => set({ elapsed: 0, isRunning: false }, false, 'timer/reset'),
});
