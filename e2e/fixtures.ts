import { test as base, Page } from '@playwright/test';

/**
 * Fixture to stub Web Audio APIs so audio autoplay restrictions don't block headless browsers.
 */
export async function stubAudio(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (typeof window !== 'undefined') {
      const origAudio = window.Audio;
      // Mock HTMLAudioElement play
      window.Audio = class extends origAudio {
        override async play() {
          return Promise.resolve();
        }
      };
      // Mock Web Audio Context
      if (window.AudioContext) {
        const origCtx = window.AudioContext;
        window.AudioContext = class extends origCtx {
          override async resume() {
            return Promise.resolve();
          }
        };
      }
    }
  });
}

export const test = base.extend<{ pageWithAudio: Page }>({
  pageWithAudio: async ({ page }, use) => {
    await stubAudio(page);
    await page.goto('/');
    await use(page);
  },
});

export { expect } from '@playwright/test';
