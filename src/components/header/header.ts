export interface HeaderConfig {
  container: HTMLElement;
}

export function createHeader(config: HeaderConfig) {
  let element: HTMLElement | null = null;

  function render(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'header';
    header.innerHTML = `
      <div class="header__brand">
        <div class="header__titles">
          <span class="header__name">ShellzOrb</span>
          <span class="header__product">PSD Layer Extractor</span>
        </div>
      </div>
    `;
    return header;
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
