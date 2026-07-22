"use client";

import { CM_TO_PX } from "./units";

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    if (/^https?:/i.test(src)) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });

const roundRectPath = (ctx, x, y, w, h, radii) => {
  const { tl, tr, br, bl } = radii;
  const rTl = Math.min(tl, w / 2, h / 2);
  const rTr = Math.min(tr, w / 2, h / 2);
  const rBr = Math.min(br, w / 2, h / 2);
  const rBl = Math.min(bl, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(x + rTl, y);
  ctx.lineTo(x + w - rTr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rTr);
  ctx.lineTo(x + w, y + h - rBr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rBr, y + h);
  ctx.lineTo(x + rBl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rBl);
  ctx.lineTo(x, y + rTl);
  ctx.quadraticCurveTo(x, y, x + rTl, y);
  ctx.closePath();
};

const drawImageCover = (ctx, img, x, y, w, h) => {
  const ir = img.naturalWidth / img.naturalHeight;
  const br = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (ir > br) {
    sw = img.naturalHeight * br;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / br;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
};

const boxFromPercent = (box, cardW, cardH) => ({
  x: ((box?.left ?? 0) / 100) * cardW,
  y: ((box?.top ?? 0) / 100) * cardH,
  w: ((box?.width ?? 0) / 100) * cardW,
  h: ((box?.height ?? 0) / 100) * cardH,
});

const drawCenteredText = (ctx, text, box, cardW, cardH, fontFamily) => {
  if (!text) return;
  const { x, y, w, h } = boxFromPercent(box, cardW, cardH);
  const fontSize = box?.fontSize ?? 14;
  const fontWeight = box?.fontWeight ?? 700;

  ctx.save();
  ctx.fillStyle = "#0b1f4d";
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(text), x + w / 2, y + h / 2, w);
  ctx.restore();
};

/**
 * Renders a card to canvas using the same %-based layout as the preview.
 * Avoids html2canvas cm/font mismatches.
 */
export async function renderCardToCanvas({
  cardEl,
  layout,
  cardWidthCm,
  cardHeightCm,
  scale = 3,
}) {
  await document.fonts.ready;

  const cardW = Math.round(cardWidthCm * CM_TO_PX);
  const cardH = Math.round(cardHeightCm * CM_TO_PX);

  const bgEl = cardEl.querySelector("[data-card-bg]");
  const photoEl = cardEl.querySelector("[data-card-photo]");
  const nameEl = cardEl.querySelector("[data-card-name]");
  const roleEl = cardEl.querySelector("[data-card-role]");

  const fontFamily =
    getComputedStyle(nameEl || document.body).fontFamily || "sans-serif";

  const [bgImg, photoImg] = await Promise.all([
    loadImage(bgEl?.currentSrc || bgEl?.src),
    loadImage(photoEl?.currentSrc || photoEl?.src),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cardW * scale);
  canvas.height = Math.round(cardH * scale);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cardW, cardH);
  ctx.drawImage(bgImg, 0, 0, cardW, cardH);

  const photo = layout.photo || {};
  const { x, y, w, h } = boxFromPercent(photo, cardW, cardH);
  const radiusPx = (photo.borderRadius ?? 0.35) * CM_TO_PX;
  const radii = photo.asymmetric
    ? { tl: 0, tr: radiusPx, br: 0, bl: radiusPx }
    : { tl: radiusPx, tr: radiusPx, br: radiusPx, bl: radiusPx };

  ctx.save();
  roundRectPath(ctx, x, y, w, h, radii);
  ctx.clip();
  drawImageCover(ctx, photoImg, x, y, w, h);
  ctx.restore();

  drawCenteredText(
    ctx,
    nameEl?.textContent?.trim(),
    layout.name,
    cardW,
    cardH,
    fontFamily
  );
  drawCenteredText(
    ctx,
    roleEl?.textContent?.trim(),
    layout.role,
    cardW,
    cardH,
    fontFamily
  );

  return canvas;
}
