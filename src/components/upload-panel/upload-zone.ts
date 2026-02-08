export interface UploadZoneConfig {
  container: HTMLElement;
  onFileSelected: (file: File) => void;
}

export function createUploadZone(config: UploadZoneConfig) {
  let element: HTMLElement | null = null;
  let fileInput: HTMLInputElement | null = null;
  let loadingOverlay: HTMLElement | null = null;
  let isLoading = false;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    element?.classList.add('upload-zone--active');
  }

  function handleDragLeave(e: DragEvent) {
    const relatedTarget = e.relatedTarget as Node | null;
    if (!element?.contains(relatedTarget)) {
      element?.classList.remove('upload-zone--active');
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    element?.classList.remove('upload-zone--active');

    if (isLoading) return;

    const file = e.dataTransfer?.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.psd')) {
      alert('Please drop a valid PSD file.');
      return;
    }

    config.onFileSelected(file);
  }

  function handleClick() {
    if (isLoading) return;
    fileInput?.click();
  }

  function handleFileInputChange() {
    const file = fileInput?.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.psd')) {
        alert('Please select a valid PSD file.');
      } else {
        config.onFileSelected(file);
      }
    }
    if (fileInput) fileInput.value = '';
  }

  function render(): HTMLElement {
    const zone = document.createElement('div');
    zone.className = 'upload-zone';
    zone.innerHTML = `
      <div class="upload-zone__empty-state">
        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 class="upload-zone__title">Drop a PSD file here</h3>
        <span class="upload-zone__subtitle">or click to browse (.psd)</span>
      </div>
      <div class="upload-zone__loading">
        <div class="upload-zone__loading-spinner"></div>
        <span class="upload-zone__loading-text">Parsing PSD...</span>
      </div>
    `;
    return zone;
  }

  function createFileInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.psd';
    input.style.display = 'none';
    return input;
  }

  return {
    mount() {
      element = render();
      fileInput = createFileInput();
      loadingOverlay = element.querySelector('.upload-zone__loading') as HTMLElement;

      element.addEventListener('dragover', handleDragOver);
      element.addEventListener('dragleave', handleDragLeave);
      element.addEventListener('drop', handleDrop);
      element.addEventListener('click', handleClick);
      fileInput.addEventListener('change', handleFileInputChange);

      config.container.appendChild(fileInput);
      config.container.appendChild(element);
    },
    unmount() {
      element?.removeEventListener('dragover', handleDragOver);
      element?.removeEventListener('dragleave', handleDragLeave);
      element?.removeEventListener('drop', handleDrop);
      element?.removeEventListener('click', handleClick);
      fileInput?.removeEventListener('change', handleFileInputChange);

      element?.remove();
      fileInput?.remove();
      element = null;
      fileInput = null;
      loadingOverlay = null;
    },
    setLoading(loading: boolean) {
      isLoading = loading;
      if (loadingOverlay) {
        loadingOverlay.style.display = loading ? 'flex' : 'none';
      }
      if (element) {
        element.style.cursor = loading ? 'default' : 'pointer';
      }
    }
  };
}
