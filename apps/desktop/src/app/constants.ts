export const WINDOW = {
  defaultWidth: 600,
  defaultHeight: 600,
  minWidth: 500,
  minHeight: 300,
  maxWidth: 1920, // TODO: Set max width to 700 or 1000
  maxHeight: 1080,
} as const;

export const MENU_MAX_LENGTH = 50;

export const rendererAppPort = 4200;
export const rendererAppName = 'renderer';
export const electronAppName = 'Time Tracker';
export const updateServerUrl = 'https://deployment-server-url.com'; // TODO: insert your update server url here
