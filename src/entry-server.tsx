import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';

// The prerenderer installs a JSDOM window/document (pdfjs-dist needs it), which
// makes react-helmet-async take its client path and never populate
// helmetContext.helmet. Force server mode so head tags land in the static HTML.
(HelmetProvider as unknown as { canUseDOM: boolean }).canUseDOM = false;
import App from './App';
import { UploadProvider } from './context/UploadContext';

/**
 * Render the page for a given URL on the server.
 * @param url The request URL (pathname + search).
 * @param helmetContext An object that will be populated with helmet data.
 */
export function render(url: string, helmetContext?: Record<string, unknown>) {
  const context = helmetContext ?? ({} as Record<string, unknown>);
  const html = renderToString(
    <HelmetProvider context={context}>
      <React.StrictMode>
        <StaticRouter location={url}>
          <UploadProvider>
            <App />
          </UploadProvider>
        </StaticRouter>
      </React.StrictMode>
    </HelmetProvider>
  );
  return { html, helmetContext: context };
}

export { TOOLS } from './lib/tools';
export { RESOURCES } from './content/resources';
export { PROGRAMMATIC } from './lib/programmatic';
export { POSTS } from './content/blog/posts';
