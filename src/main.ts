import './styles/index.css';

import { createHeader } from './components';
import { createUploadPanel } from './components';
import { createLayersPanel } from './components';
import { parsePsd } from './services/psd-parser';
import type { ExtractedLayer } from './services/psd-parser';

let header: ReturnType<typeof createHeader> | null = null;
let uploadPanel: ReturnType<typeof createUploadPanel> | null = null;
let layersPanel: ReturnType<typeof createLayersPanel> | null = null;
let currentLayers: ExtractedLayer[] = [];
let currentComposite: HTMLCanvasElement | null = null;

function getApp(): HTMLElement {
  const app = document.getElementById('app');
  if (!app) throw new Error('App root element not found');
  return app;
}

function showUploadView() {
  const app = getApp();

  // Clean up existing views
  layersPanel?.unmount();
  layersPanel = null;
  uploadPanel?.unmount();
  uploadPanel = null;
  header?.unmount();
  header = null;
  currentLayers = [];
  currentComposite = null;

  // Mount header
  header = createHeader({ container: app });
  header.mount();

  // Mount main container
  const mainContainer = document.createElement('main');
  mainContainer.className = 'main-container';
  app.appendChild(mainContainer);

  // Mount upload panel
  uploadPanel = createUploadPanel({
    container: mainContainer,
    onFileSelected: handleFile,
  });
  uploadPanel.mount();
}

async function handleFile(file: File) {
  uploadPanel?.setLoading(true);

  try {
    const buffer = await file.arrayBuffer();
    const result = parsePsd(buffer);
    currentLayers = result.layers;
    currentComposite = result.composite;
    showLayersView(file.name);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse PSD file.';
    alert(message);
    uploadPanel?.setLoading(false);
  }
}

function showLayersView(fileName: string) {
  const app = getApp();

  // Clean up upload view
  uploadPanel?.unmount();
  uploadPanel = null;

  // Remove main container (will be re-created)
  const oldMain = app.querySelector('.main-container');
  oldMain?.remove();

  // Mount new main container
  const mainContainer = document.createElement('main');
  mainContainer.className = 'main-container';
  app.appendChild(mainContainer);

  // Mount layers panel
  layersPanel = createLayersPanel({
    container: mainContainer,
    layers: currentLayers,
    fileName,
    composite: currentComposite,
    onReset: showUploadView,
  });
  layersPanel.mount();
}

function initApp() {
  showUploadView();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
