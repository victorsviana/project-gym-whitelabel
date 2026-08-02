const LOGO_MAX_DIMENSION_PX = 256;
const LOGO_MIN_DIMENSION_PX = 48;
const LOGO_MAX_BYTES = 200 * 1024;
const LOGO_SHRINK_FACTOR = 0.75;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };
    image.src = url;
  });
}

function drawResized(image: HTMLImageElement, maxDimension: number): string {
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D indisponível.');
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/png');
}

function dataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Math.ceil((base64.length * 3) / 4);
}

/** Redimensiona o upload para um data URL de até ~200 KB (WHITELABEL.md#logo). */
export async function resizeLogo(file: File): Promise<string> {
  const image = await loadImage(file);
  let dimension = LOGO_MAX_DIMENSION_PX;
  let dataUrl = drawResized(image, dimension);
  while (dataUrlByteSize(dataUrl) > LOGO_MAX_BYTES && dimension > LOGO_MIN_DIMENSION_PX) {
    dimension = Math.round(dimension * LOGO_SHRINK_FACTOR);
    dataUrl = drawResized(image, dimension);
  }
  return dataUrl;
}
