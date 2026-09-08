import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // This app is role/tenant-aware and entirely client-state driven,
    // so every route is rendered on the client.
    path: '**',
    renderMode: RenderMode.Client,
  },
];
