import { createUploadZone } from './upload-zone';

export interface UploadPanelConfig {
  container: HTMLElement;
  onFileSelected: (file: File) => void;
}

export function createUploadPanel(config: UploadPanelConfig) {
  let element: HTMLElement | null = null;
  let uploadZone: ReturnType<typeof createUploadZone> | null = null;

  function render(): HTMLElement {
    const panel = document.createElement('section');
    panel.className = 'upload-panel';
    panel.innerHTML = `
      <div class="upload-panel__zone-container"></div>
    `;
    return panel;
  }

  return {
    mount() {
      element = render();
      const zoneContainer = element.querySelector('.upload-panel__zone-container') as HTMLElement;

      uploadZone = createUploadZone({
        container: zoneContainer,
        onFileSelected: config.onFileSelected,
      });
      uploadZone.mount();

      config.container.appendChild(element);
    },
    unmount() {
      uploadZone?.unmount();
      element?.remove();
      element = null;
      uploadZone = null;
    },
    setLoading(loading: boolean) {
      uploadZone?.setLoading(loading);
    }
  };
}
