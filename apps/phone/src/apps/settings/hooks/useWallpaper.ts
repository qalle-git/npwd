import { useSettings, useSettingsValue } from './useSettings';
import { isDefaultWallpaper } from '../utils/isDefaultWallpaper';
import getBackgroundPath from '../utils/getBackgroundPath';

export const adjustTextColor = async (imageSrc: string): Promise<number> => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imageSrc;
  await img.decode(); // Wait for the image to be decoded

  // Create a canvas and draw the image onto it to analyze pixels
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return; // Exit if the context is not available
  ctx.drawImage(img, 0, 0);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const length = data.length;
  let colorSum = 0;

  // Loop through each pixel and sum up its brightness
  for (let i = 0; i < length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const avg = (r + g + b) / 3;
    colorSum += avg;
  }

  // Calculate average brightness
  const brightness = colorSum / (img.width * img.height);

  return brightness;
};

export const useWallpaper = () => {
  const wallpaper = useSettingsValue().wallpaper.value;

  return {
    wallpaper: !isDefaultWallpaper(wallpaper)
      ? `url(${wallpaper})`
      : `url(${getBackgroundPath(wallpaper)})`,
  };
};
