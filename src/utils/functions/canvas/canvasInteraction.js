import {
  showAuthenticationRequiredNotification,
  showOutOfPixelsNotification,
} from '../../helpers/notifications';
import { drawPixel } from './canvasHelpers';

export const applyDirtyPixels = (canvasRef, dirtyPixels) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  dirtyPixels.forEach(({ x, y, color }) => {
    drawPixel(ctx, x, y, color);
  });

  dirtyPixels.length = 0;
};

export const handlePixelClick = (
  x,
  y,
  {
    isAuthenticated,
    canDraw,
    hasNoMorePixels,
    offset,
    scale,
    selectedColor,
    setCanDraw,
    setRemainingTime,
    setPixels,
    addRecentColor,
    dirtyPixels,
    dispatch,
    socket,
    PIXEL_SIZE,
  }
) => {
  if (!isAuthenticated || !localStorage.getItem('uniqueIdentifier')) {
    showAuthenticationRequiredNotification();
    return;
  }

  if (!canDraw) return;

  if (hasNoMorePixels) {
    showOutOfPixelsNotification();
    return;
  }

  setCanDraw(false);
  setRemainingTime(300);

  const interval = setInterval(() => {
    setRemainingTime((prev) => {
      if (prev <= 100) {
        clearInterval(interval);
        setCanDraw(true);
        return 0;
      }
      return prev - 100;
    });
  }, 100);

  const adjustedX = Math.floor((x - offset.x) / (PIXEL_SIZE * scale));
  const adjustedY = Math.floor((y - offset.y) / (PIXEL_SIZE * scale));
  const color = selectedColor;

  dispatch(addRecentColor(color));

  const newPixel = {
    x: adjustedX,
    y: adjustedY,
    color,
    userId: localStorage.getItem('uniqueIdentifier'),
  };

  dirtyPixels.push(newPixel);

  setPixels((prevPixels) => {
    const newPixels = prevPixels.map((row) => [...row]);
    if (newPixels[adjustedY] && newPixels[adjustedX]) {
      newPixels[adjustedY][adjustedX] = newPixel.color;
    }
    return newPixels;
  });

  socket.emit('draw-pixel', newPixel);
};
