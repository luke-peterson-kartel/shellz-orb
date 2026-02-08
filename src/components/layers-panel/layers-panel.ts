import type { ExtractedLayer } from '../../services/psd-parser';
import { createLayerCard } from './layer-card';
import { downloadLayer, downloadAllAsZip } from '../../services/downloader';

export interface LayersPanelConfig {
  container: HTMLElement;
  layers: ExtractedLayer[];
  fileName: string;
  onReset: () => void;
}

export function createLayersPanel(config: LayersPanelConfig) {
  let element: HTMLElement | null = null;
  let layerCards: ReturnType<typeof createLayerCard>[] = [];

  function render(): HTMLElement {
    const panel = document.createElement('section');
    panel.className = 'layers-panel';
    panel.innerHTML = `
      <div class="layers-panel__header">
        <div class="layers-panel__info">
          <h2 class="layers-panel__title">${config.fileName}</h2>
          <span class="layers-panel__count">${config.layers.length} layers</span>
        </div>
        <div class="layers-panel__actions">
          <button class="btn btn--primary layers-panel__download-all">Download All as ZIP</button>
          <button class="btn btn--secondary layers-panel__reset">Load Another</button>
        </div>
      </div>
      <div class="layers-panel__grid"></div>
    `;
    return panel;
  }

  return {
    mount() {
      element = render();

      const grid = element.querySelector('.layers-panel__grid') as HTMLElement;
      const downloadAllBtn = element.querySelector('.layers-panel__download-all') as HTMLButtonElement;
      const resetBtn = element.querySelector('.layers-panel__reset') as HTMLButtonElement;

      // Create layer cards
      for (const layer of config.layers) {
        const card = createLayerCard({
          container: grid,
          layer,
          onDownload: (format) => downloadLayer(layer.canvas, layer.name, format),
        });
        card.mount();
        layerCards.push(card);
      }

      // Download All as ZIP
      downloadAllBtn.addEventListener('click', async () => {
        downloadAllBtn.disabled = true;
        downloadAllBtn.textContent = 'Generating ZIP...';
        try {
          await downloadAllAsZip(config.layers);
        } catch (err) {
          console.error('ZIP generation failed:', err);
          alert('Failed to generate ZIP. The file may be too large.');
        } finally {
          downloadAllBtn.disabled = false;
          downloadAllBtn.textContent = 'Download All as ZIP';
        }
      });

      // Load Another
      resetBtn.addEventListener('click', config.onReset);

      config.container.appendChild(element);
    },
    unmount() {
      layerCards.forEach(card => card.unmount());
      layerCards = [];
      element?.remove();
      element = null;
    }
  };
}
