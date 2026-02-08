import type { ExtractedLayer } from '../../services/psd-parser';
import { createLayerCard } from './layer-card';
import { downloadLayer, downloadAllAsZip } from '../../services/downloader';

export interface LayersPanelConfig {
  container: HTMLElement;
  layers: ExtractedLayer[];
  fileName: string;
  composite: HTMLCanvasElement | null;
  onReset: () => void;
}

function stripExtension(name: string): string {
  return name.replace(/\.[^/.]+$/, '');
}

export function createLayersPanel(config: LayersPanelConfig) {
  let element: HTMLElement | null = null;
  let layerCards: ReturnType<typeof createLayerCard>[] = [];
  let title = stripExtension(config.fileName);
  let description = '';

  function render(): HTMLElement {
    const panel = document.createElement('section');
    panel.className = 'layers-panel';
    panel.innerHTML = `
      <div class="layers-panel__file-info">
        <div class="layers-panel__composite"></div>
        <div class="layers-panel__meta">
          <input
            type="text"
            class="layers-panel__meta-title"
            value="${title}"
            placeholder="Enter a title..."
          />
          <textarea
            class="layers-panel__meta-desc"
            placeholder="Add a description..."
            rows="3"
          >${description}</textarea>
          <span class="layers-panel__count">${config.layers.length} layers</span>
        </div>
      </div>
      <div class="layers-panel__header">
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

      // Composite thumbnail
      const compositeContainer = element.querySelector('.layers-panel__composite') as HTMLElement;
      if (config.composite) {
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.className = 'layers-panel__composite-canvas';
        const ctx = thumbCanvas.getContext('2d')!;
        thumbCanvas.width = config.composite.width;
        thumbCanvas.height = config.composite.height;
        ctx.drawImage(config.composite, 0, 0);
        compositeContainer.appendChild(thumbCanvas);
      } else {
        compositeContainer.innerHTML = '<div class="layers-panel__composite-placeholder">No composite preview</div>';
      }

      // Editable fields
      const titleInput = element.querySelector('.layers-panel__meta-title') as HTMLInputElement;
      const descInput = element.querySelector('.layers-panel__meta-desc') as HTMLTextAreaElement;

      titleInput.addEventListener('input', () => {
        title = titleInput.value;
      });
      descInput.addEventListener('input', () => {
        description = descInput.value;
      });

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
          await downloadAllAsZip(
            config.layers,
            { title: title || config.fileName, description },
          );
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
