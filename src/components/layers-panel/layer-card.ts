import type { ExtractedLayer } from '../../services/psd-parser';

export interface LayerCardConfig {
  container: HTMLElement;
  layer: ExtractedLayer;
  onDownload: (format: 'png' | 'jpeg') => void;
}

export function createLayerCard(config: LayerCardConfig) {
  let element: HTMLElement | null = null;

  function render(): HTMLElement {
    const { layer } = config;

    const card = document.createElement('div');
    card.className = layer.hidden ? 'layer-card layer-card--hidden' : 'layer-card';

    // Preview with checkerboard background
    const preview = document.createElement('div');
    preview.className = 'layer-card__preview';

    const previewCanvas = document.createElement('canvas');
    previewCanvas.className = 'layer-card__canvas';
    const ctx = previewCanvas.getContext('2d')!;
    previewCanvas.width = layer.canvas.width;
    previewCanvas.height = layer.canvas.height;
    ctx.drawImage(layer.canvas, 0, 0);
    preview.appendChild(previewCanvas);

    // Info section
    const info = document.createElement('div');
    info.className = 'layer-card__info';
    const hiddenBadge = layer.hidden ? '<span class="layer-card__hidden-badge">Hidden</span>' : '';
    info.innerHTML = `
      <div class="layer-card__name-row">
        <span class="layer-card__name" title="${layer.name}">${layer.name}</span>
        ${hiddenBadge}
      </div>
      <span class="layer-card__dims">${layer.width} &times; ${layer.height}</span>
    `;

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'layer-card__actions';

    const pngBtn = document.createElement('button');
    pngBtn.className = 'btn btn--primary btn--sm';
    pngBtn.textContent = 'PNG';
    pngBtn.addEventListener('click', () => config.onDownload('png'));

    const jpgBtn = document.createElement('button');
    jpgBtn.className = 'btn btn--secondary btn--sm';
    jpgBtn.textContent = 'JPG';
    jpgBtn.addEventListener('click', () => config.onDownload('jpeg'));

    actions.appendChild(pngBtn);
    actions.appendChild(jpgBtn);

    card.appendChild(preview);
    card.appendChild(info);
    card.appendChild(actions);

    return card;
  }

  return {
    mount() {
      element = render();
      config.container.appendChild(element);
    },
    unmount() {
      element?.remove();
      element = null;
    }
  };
}
