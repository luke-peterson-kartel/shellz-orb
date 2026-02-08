export interface LoadingSpinnerConfig {
  container: HTMLElement;
  size?: 'small' | 'medium' | 'large';
}

export function createLoadingSpinner(config: LoadingSpinnerConfig) {
  let element: HTMLElement | null = null;

  function render(): HTMLElement {
    const spinner = document.createElement('span');
    spinner.className = `loading-spinner loading-spinner--${config.size || 'medium'}`;
    return spinner;
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
