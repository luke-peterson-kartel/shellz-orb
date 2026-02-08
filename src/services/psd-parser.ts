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

export interface ParsedPsd {
  layers: ExtractedLayer[];
  composite: HTMLCanvasElement | null;
}

function buildComposite(width: number, height: number, children: Layer[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  function drawLayers(layers: Layer[], parentHidden: boolean) {
    for (const layer of layers) {
      const isHidden = parentHidden || (layer.hidden ?? false);

      if (layer.children && layer.children.length > 0) {
        drawLayers(layer.children, isHidden);
      } else if (layer.canvas && !isHidden) {
        ctx.globalAlpha = layer.opacity ?? 1;
        ctx.drawImage(
          layer.canvas as HTMLCanvasElement,
          layer.left ?? 0,
          layer.top ?? 0,
        );
        ctx.globalAlpha = 1;
      }
    }
  }

  drawLayers(children, false);
  return canvas;
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
        opacity: layer.opacity ?? 1,
        hidden: isHidden,
      });
    } else {
      console.debug(`[psd-parser] Skipped layer "${currentPath}" — no canvas data`);
    }
  }

  return result;
}

export function parsePsd(buffer: ArrayBuffer): ParsedPsd {
  const psd = readPsd(buffer, { skipLayerImageData: false });

  if (!psd.children || psd.children.length === 0) {
    throw new Error('This PSD file contains no layers.');
  }

  const layers = flattenLayers(psd.children, '', false);

  if (layers.length === 0) {
    throw new Error('No extractable image layers found in this PSD file.');
  }

  return {
    layers,
    composite: buildComposite(psd.width, psd.height, psd.children),
  };
}
