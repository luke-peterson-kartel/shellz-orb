import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: 'image/png' | 'image/jpeg',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      type,
      quality
    );
  });
}

function sanitizeName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-');
}

export async function downloadLayer(
  canvas: HTMLCanvasElement,
  name: string,
  format: 'png' | 'jpeg'
): Promise<void> {
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, mimeType);
  const safeName = sanitizeName(name);
  saveAs(blob, `${safeName}.${format === 'jpeg' ? 'jpg' : 'png'}`);
}

export interface ZipMetadata {
  title: string;
  description: string;
}

export async function downloadAllAsZip(
  layers: Array<{ name: string; canvas: HTMLCanvasElement }>,
  metadata?: ZipMetadata,
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();
  const pngFolder = zip.folder('png')!;
  const jpegFolder = zip.folder('jpeg')!;

  if (metadata) {
    const info = `Title: ${metadata.title}\nDescription: ${metadata.description}\n`;
    zip.file('metadata.txt', info);
  }

  for (let i = 0; i < layers.length; i++) {
    const { name, canvas } = layers[i];
    const safeName = sanitizeName(name);

    const [pngBlob, jpegBlob] = await Promise.all([
      canvasToBlob(canvas, 'image/png'),
      canvasToBlob(canvas, 'image/jpeg'),
    ]);

    pngFolder.file(`${safeName}.png`, pngBlob);
    jpegFolder.file(`${safeName}.jpg`, jpegBlob);

    onProgress?.(Math.round(((i + 1) / layers.length) * 100));
  }

  const zipName = metadata?.title ? `${sanitizeName(metadata.title)}.zip` : 'psd-layers.zip';
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, zipName);
}
