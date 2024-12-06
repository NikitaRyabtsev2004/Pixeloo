import { PIXEL_SIZE } from '../../config/canvas-size';

export const increaseScale = (setScale, setOffset, currentScale) => {
  if (currentScale < 5) {
    const newScale = currentScale * 1.2;
    setScale(newScale);
    setOffset((prevOffset) => ({
      x: prevOffset.x * (newScale / currentScale),
      y: prevOffset.y * (newScale / currentScale),
    }));
  }
};

export const decreaseScale = (setScale, setOffset, currentScale) => {
  if (currentScale > 0.2) {
    const newScale = currentScale / 1.2;
    setScale(newScale);
    setOffset((prevOffset) => ({
      x: prevOffset.x * (newScale / currentScale),
      y: prevOffset.y * (newScale / currentScale),
    }));
  }
};

export const moveUp = (setOffset) => {
  setOffset((prevOffset) => ({ ...prevOffset, y: prevOffset.y + 50 }));
};

export const moveDown = (setOffset) => {
  setOffset((prevOffset) => ({ ...prevOffset, y: prevOffset.y - 50 }));
};

export const moveLeft = (setOffset) => {
  setOffset((prevOffset) => ({ ...prevOffset, x: prevOffset.x + 50 }));
};

export const moveRight = (setOffset) => {
  setOffset((prevOffset) => ({ ...prevOffset, x: prevOffset.x - 50 }));
};

export const drawCanvas = (canvasData, ctx, offset, scale) => {
  if (!ctx) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, offset.x, offset.y);

  canvasData.forEach((row, y) => {
    row.forEach((color, x) => {
      drawPixel(ctx, x, y, color, scale);
    });
  });

  ctx.restore();
};

export const drawPixel = (ctx, x, y, color, scale) => {
  ctx.fillStyle = color;
  ctx.fillRect(
    x * PIXEL_SIZE * scale,
    y * PIXEL_SIZE * scale,
    PIXEL_SIZE * scale,
    PIXEL_SIZE * scale
  );
};
