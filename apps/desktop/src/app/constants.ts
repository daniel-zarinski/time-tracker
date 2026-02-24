export const WINDOW = {
  defaultWidth: 600,
  defaultHeight: 600,
  minWidth: 540,
  minHeight: 300,
  maxWidth: 1920,
  maxHeight: 1080,
} as const;

export const rendererAppPort = 4200;
export const rendererAppName = 'Time Tracker'; // options.name.split('-')[0] + '-web'
export const electronAppName = 'Time Tracker';
export const updateServerUrl = 'https://deployment-server-url.com'; // TODO: insert your update server url here
