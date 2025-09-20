import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Keep all other routes prerendered
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },

  // But override edit/:id to SSR instead of prerender
  {
    path: 'complaint/edit/:id',
    renderMode: RenderMode.Server
  }
];
