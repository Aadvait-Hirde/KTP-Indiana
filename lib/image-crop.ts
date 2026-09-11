/**
 * Browser-only helper that renders a crop rectangle of an image onto a square
 * canvas and exports it as a JPEG. Used by the avatar cropper so every profile
 * picture is stored as a square at a predictable size.
 */
export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Could not load the selected image."));
    // Object URLs are same-origin; this keeps the canvas untainted for blob: URLs
    // and harmless for remote images that send CORS headers.
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

/**
 * Draws `pixelCrop` (coordinates in the image's natural pixels, as reported by
 * react-easy-crop's `onCropComplete`) to an `outputSize`×`outputSize` canvas
 * and returns it as an `image/jpeg` blob.
 *
 * Browsers apply EXIF orientation when decoding into an <img>, so the crop
 * coordinates already match what the user saw in the cropper; no manual EXIF
 * handling is needed here.
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputSize = 512,
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Your browser does not support image editing.");
  }

  // JPEG has no alpha channel; without this, transparent PNG areas render black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outputSize, outputSize);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const sourceX = Math.max(0, Math.round(pixelCrop.x));
  const sourceY = Math.max(0, Math.round(pixelCrop.y));
  const sourceWidth = Math.max(
    1,
    Math.min(Math.round(pixelCrop.width), image.naturalWidth - sourceX),
  );
  const sourceHeight = Math.max(
    1,
    Math.min(Math.round(pixelCrop.height), image.naturalHeight - sourceY),
  );

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not export the cropped image."));
        }
      },
      "image/jpeg",
      0.9,
    );
  });
}
