import 'ag-psd/initialize-canvas';
import { readPsd, Layer } from 'ag-psd';

export interface ExtractedLayer {
  name: string;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  opacity: number;
  hidden: boolean;
}

function flattenLayers(layers: Layer[], parentPath: string, parentHidden: boolean): ExtractedLayer[] {
  const result: ExtractedLayer[] = [];

  for (const layer of layers) {
    const currentPath = parentPath
      ? `${parentPath}/${layer.name || 'Untitled'}`
      : (layer.name || 'Untitled');

    const isHidden = parentHidden || (layer.hidden ?? false);

    if (layer.children && layer.children.length > 0) {
      result.push(...flattenLayers(layer.children, currentPath, isHidden));
    } else if (layer.canvas) {
      result.push({
        name: currentPath,
        canvas: layer.canvas as HTMLCanvasElement,
        width: layer.canvas.width,
        height: layer.canvas.height,
        opacity: layer.opacity ?? 255,
        hidden: isHidden,
      });
    } else {
      console.debug(`[psd-parser] Skipped layer "${currentPath}" — no canvas data`);
    }
  }

  return result;
}

export function parsePsd(buffer: ArrayBuffer): ExtractedLayer[] {
  const psd = readPsd(buffer, { skipLayerImageData: false });

  if (!psd.children || psd.children.length === 0) {
    throw new Error('This PSD file contains no layers.');
  }

  const layers = flattenLayers(psd.children, '', false);

  if (layers.length === 0) {
    throw new Error('No extractable image layers found in this PSD file.');
  }

  return layers;
}
