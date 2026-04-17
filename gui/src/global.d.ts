export {};

declare global {
  interface Window {
    electronAPI: {
      invokeHSE: (command: string, args?: string[]) => Promise<any>;
    };
  }
}
