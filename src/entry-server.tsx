import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

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
          <App />
        </StaticRouter>
      </React.StrictMode>
    </HelmetProvider>
  );
  return { html, helmetContext: context };
}
