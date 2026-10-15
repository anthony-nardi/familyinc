// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
// `gtag` is declared globally by @types/gtag.js and installed by the script in _app.tsx.
export const pageView = (url: string) => {
  gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID as string, {
    page_path: url,
  });
};

export const emitEvent = (event: string) => {
  gtag('event', event);
};
