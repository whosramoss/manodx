// @ts-nocheck
async function boot(): Promise<void> {
  try {
    const configModule = await import('/__manodx/config.js');
    const config = configModule.default;
    
    const res = await fetch('/__manodx/content.json');
    if (!res.ok) {
      throw new Error(`Failed to load content: ${res.status}`);
    }
    const rawContent: Record<string, string> = await res.json();
    
    const modules: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawContent)) {
      modules[`${config.contentMarker}${key}`] = value;
    }
    
    const { SiteApp } = await import('/__manodx/framework.js');
    
    const root = document.getElementById('app');
    if (!root) {
      throw new Error('Missing #app element');
    }
    
    new SiteApp(root, modules, config).start();
    
  } catch (error) {
    console.error('[manodx] Bootstrap error:', error);
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `<div style="color: red; padding: 20px;">
        <h1>Error</h1>
        <pre>${error}</pre>
      </div>`;
    }
  }
}

boot();
