"use client";

import Card from "./card";
import { useCallback, useRef, useState } from "react";
import ImportData from "./import-xlsx";
import { useReactToPrint } from "react-to-print";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

const DEFAULT_BG = "/1405/card-1405-01.jpg";

/** Aspect ratio of 1405 card art: 2244×2929 */
const DEFAULT_CARD_SIZE = { width: 9, height: 11.75 };

const BACKGROUND_PRESETS = [
  {
    value: DEFAULT_BG,
    label: "۱۴۰۵ - کارت خادم",
    size: DEFAULT_CARD_SIZE,
    layout: "1405",
  },
  {
    value: "/men1404.jpg",
    label: "معمولی (مربع)",
    size: { width: 9.56, height: 9.56 },
    layout: "square",
  },
  {
    value: "/women1404.jpg",
    label: "۱۴۰۴ - خواهران",
    size: { width: 9.56, height: 9.56 },
    layout: "square",
  },
  {
    value: "/men-admin.jpg",
    label: "۱۴۰۴ مسئولین واحدها",
    size: { width: 9.56, height: 9.56 },
    layout: "square",
  },
  {
    value: "/women-admin.jpg",
    label: "۱۴۰۴ مسئولین واحد خواهران",
    size: { width: 9.56, height: 9.56 },
    layout: "square",
  },
  {
    value: "/heads.jpg",
    label: "هماهنگ‌کننده‌ها",
    size: { width: 9.56, height: 9.56 },
    layout: "square",
  },
];

const LAYOUT_1405 = {
  name: {
    top: 57.51,
    left: 19.07,
    width: 61.85,
    height: 8.47,
    fontSize: 15,
    fontWeight: 700,
  },
  role: {
    top: 68.85,
    left: 19.07,
    width: 61.85,
    height: 8.47,
    fontSize: 13,
    fontWeight: 600,
  },
  photo: {
    top: 13.48,
    left: 31,
    width: 38,
    height: 39.16,
    borderRadius: 0.35,
  },
};

const LAYOUT_SQUARE = {
  name: {
    top: 47.5,
    left: 49.15,
    width: 43,
    height: 5,
    fontSize: 14,
    fontWeight: 700,
  },
  role: {
    top: 57.5,
    left: 49.15,
    width: 43,
    height: 4,
    fontSize: 12,
    fontWeight: 600,
  },
  photo: {
    top: 33.8,
    left: 10,
    width: 30.5,
    height: 40,
    borderRadius: 0.8,
    asymmetric: true,
  },
};

const DEFAULT_LAYOUT = LAYOUT_1405;

const FONT_WEIGHTS = [
  { value: 400, label: "عادی" },
  { value: 600, label: "نیمه‌ضخیم" },
  { value: 700, label: "ضخیم" },
  { value: 800, label: "خیلی‌ضخیم" },
  { value: 900, label: "سیاه" },
];

const NumberField = ({ label, value, onChange, step = 0.1, min, max, unit }) => (
  <label className="block">
    <span className="field-label">
      {label}
      {unit ? ` (${unit})` : ""}
    </span>
    <input
      type="number"
      className="field-input"
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.valueAsNumber)}
    />
  </label>
);

const WeightField = ({ label, value, onChange }) => (
  <label className="block col-span-2">
    <span className="field-label">{label}</span>
    <select
      className="field-input"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {FONT_WEIGHTS.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label} ({item.value})
        </option>
      ))}
    </select>
  </label>
);

const PDF = () => {
  const [list, setList] = useState(null);
  const [CountPerPage, setCountPerPage] = useState(4);
  const [gap, setGap] = useState(0);
  const [MarginBottom, setMarginBottom] = useState(0);
  const [CardBackground, setCardBackground] = useState(DEFAULT_BG);
  const [cardSize, setCardSize] = useState(DEFAULT_CARD_SIZE);
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("page");
  const [fieldTab, setFieldTab] = useState("name");

  const contentRef = useRef();
  const reactToPrintFn = useReactToPrint({ contentRef });

  const handleChangeBackground = (e) => {
    const value = e.target.value;
    const preset = BACKGROUND_PRESETS.find((item) => item.value === value);
    setCardBackground(value);
    if (preset) {
      setCardSize(preset.size);
      setLayout(preset.layout === "square" ? LAYOUT_SQUARE : LAYOUT_1405);
    }
  };

  const updateField = useCallback((field, key, value) => {
    if (Number.isNaN(value)) return;
    setLayout((prev) => ({
      ...prev,
      [field]: { ...prev[field], [key]: value },
    }));
  }, []);

  const captureCard = async (card) => {
    await Promise.all(
      [...card.querySelectorAll("img")].map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            })
      )
    );

    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const cardRect = card.getBoundingClientRect();

    const layers = [...card.children].map((child) => {
      const rect = child.getBoundingClientRect();
      const style = getComputedStyle(child);
      return {
        hide: child.tagName === "INPUT",
        top: rect.top - cardRect.top,
        left: rect.left - cardRect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: style.borderRadius,
        objectFit: style.objectFit,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontFamily: style.fontFamily,
        color: style.color,
        lineHeight: style.lineHeight,
        whiteSpace: style.whiteSpace,
        textAlign: style.textAlign,
        letterSpacing: style.letterSpacing,
      };
    });

    return html2canvas(card, {
      scale: 2,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 15000,
      onclone: (_doc, clone) => {
        clone.style.width = `${width}px`;
        clone.style.height = `${height}px`;
        clone.style.margin = "0";
        clone.style.border = "none";
        clone.style.outline = "none";
        clone.style.boxSizing = "border-box";
        clone.style.position = "relative";
        clone.style.overflow = "hidden";
        clone.style.transform = "none";
        clone.style.inset = "auto";

        [...clone.children].forEach((child, index) => {
          const layer = layers[index];
          if (!layer || layer.hide) {
            child.style.display = "none";
            return;
          }

          const isBackground = index === 0 && child.tagName === "IMG";

          child.style.position = "absolute";
          child.style.top = isBackground ? "0px" : `${Math.round(layer.top * 100) / 100}px`;
          child.style.left = isBackground ? "0px" : `${Math.round(layer.left * 100) / 100}px`;
          child.style.width = isBackground ? "100%" : `${Math.round(layer.width * 100) / 100}px`;
          child.style.height = isBackground ? "100%" : `${Math.round(layer.height * 100) / 100}px`;
          child.style.right = "auto";
          child.style.bottom = "auto";
          child.style.margin = "0";
          child.style.transform = "none";
          child.style.borderRadius = isBackground ? "0" : layer.borderRadius;
          child.style.boxSizing = "border-box";
          child.style.zIndex = isBackground ? "1" : "2";

          if (child.tagName === "IMG") {
            child.style.objectFit = isBackground
              ? "fill"
              : layer.objectFit || "cover";
            child.style.maxWidth = "none";
            child.style.maxHeight = "none";
          }

          if (child.tagName === "P") {
            child.style.display = "flex";
            child.style.alignItems = "center";
            child.style.justifyContent = "center";
            child.style.fontSize = layer.fontSize;
            child.style.fontWeight = layer.fontWeight;
            child.style.fontFamily = layer.fontFamily;
            child.style.color = layer.color;
            child.style.lineHeight = layer.lineHeight;
            child.style.whiteSpace = layer.whiteSpace;
            child.style.textAlign = layer.textAlign;
            child.style.letterSpacing = layer.letterSpacing;
            child.style.padding = "0";
          }
        });
      },
    });
  };

  const handleDownloadZip = async () => {
    if (!list?.length || downloading) return;
    setDownloading(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      const cards = contentRef.current?.querySelectorAll(".card-item");
      if (!cards?.length) return;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        card.scrollIntoView({ block: "nearest", inline: "nearest" });
        const canvas = await captureCard(card);

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.95)
        );

        const user = list[i];
        const safeName = `${user?.firstName || ""}_${user?.lastName || ""}_${i + 1}`
          .replace(/\s+/g, "_")
          .replace(/[\\/:*?"<>|]/g, "");

        zip.file(`${safeName || `card_${i + 1}`}.jpg`, blob);
        setDownloadProgress(Math.round(((i + 1) / cards.length) * 100));
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `cards-${Date.now()}.zip`);
    } catch (err) {
      console.error(err);
      alert("خطا در ساخت فایل ZIP. دوباره تلاش کنید.");
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  if (!list) {
    return <ImportData handleData={(data) => setList(data)} />;
  }

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-medium text-[var(--sea-mid)]">موکب ۱۱۲۰</p>
            <h1 className="text-lg font-black text-[var(--ink)]">ویرایش کارت‌ها</h1>
            <p className="text-xs text-[var(--ink-soft)]">{list.length} کارت آماده</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn-secondary" onClick={() => setList(null)}>
              ریست
            </button>
            <button type="button" className="btn-primary" onClick={reactToPrintFn}>
              پرینت
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleDownloadZip}
              disabled={downloading}
            >
              {downloading ? `دانلود ${downloadProgress}%` : "دانلود ZIP"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[320px_1fr]">
        <aside className="no-print panel h-fit space-y-5 p-4 lg:sticky lg:top-24">
          <div className="flex rounded-xl bg-[var(--paper-deep)]/70 p-1">
            {[
              { id: "page", label: "صفحه" },
              { id: "fields", label: "فیلدها" },
              { id: "bg", label: "پس‌زمینه" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-white text-[var(--sea)] shadow-sm"
                    : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "page" && (
            <div className="space-y-3">
              <NumberField
                label="تعداد کارت در صفحه"
                value={CountPerPage}
                onChange={setCountPerPage}
                step={1}
                min={1}
                unit="عدد"
              />
              <NumberField
                label="عرض کارت"
                value={cardSize.width}
                onChange={(v) =>
                  setCardSize((prev) => ({ ...prev, width: v }))
                }
                min={1}
                unit="cm"
              />
              <NumberField
                label="ارتفاع کارت"
                value={cardSize.height}
                onChange={(v) =>
                  setCardSize((prev) => ({ ...prev, height: v }))
                }
                min={1}
                unit="cm"
              />
              <NumberField
                label="فاصله عمودی صفحه"
                value={MarginBottom}
                onChange={setMarginBottom}
                min={0}
                unit="cm"
              />
              <NumberField
                label="فاصله کارت‌ها"
                value={gap}
                onChange={setGap}
                min={0}
                unit="cm"
              />
            </div>
          )}

          {activeTab === "fields" && (
            <div className="space-y-4">
              <div className="flex rounded-xl bg-[var(--paper-deep)]/70 p-1">
                {[
                  { id: "name", label: "نام" },
                  { id: "role", label: "سمت" },
                  { id: "photo", label: "عکس" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFieldTab(tab.id)}
                    className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                      fieldTab === tab.id
                        ? "bg-white text-[var(--sea)] shadow-sm"
                        : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {fieldTab === "name" && (
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="بالا"
                    value={layout.name.top}
                    onChange={(v) => updateField("name", "top", v)}
                    unit="%"
                  />
                  <NumberField
                    label="چپ"
                    value={layout.name.left}
                    onChange={(v) => updateField("name", "left", v)}
                    unit="%"
                  />
                  <NumberField
                    label="عرض"
                    value={layout.name.width}
                    onChange={(v) => updateField("name", "width", v)}
                    unit="%"
                  />
                  <NumberField
                    label="ارتفاع"
                    value={layout.name.height}
                    onChange={(v) => updateField("name", "height", v)}
                    unit="%"
                  />
                  <NumberField
                    label="سایز فونت"
                    value={layout.name.fontSize}
                    onChange={(v) => updateField("name", "fontSize", v)}
                    step={1}
                    min={8}
                    unit="px"
                  />
                  <WeightField
                    label="وزن فونت"
                    value={layout.name.fontWeight ?? 700}
                    onChange={(v) => updateField("name", "fontWeight", v)}
                  />
                </div>
              )}

              {fieldTab === "role" && (
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="بالا"
                    value={layout.role.top}
                    onChange={(v) => updateField("role", "top", v)}
                    unit="%"
                  />
                  <NumberField
                    label="چپ"
                    value={layout.role.left}
                    onChange={(v) => updateField("role", "left", v)}
                    unit="%"
                  />
                  <NumberField
                    label="عرض"
                    value={layout.role.width}
                    onChange={(v) => updateField("role", "width", v)}
                    unit="%"
                  />
                  <NumberField
                    label="ارتفاع"
                    value={layout.role.height}
                    onChange={(v) => updateField("role", "height", v)}
                    unit="%"
                  />
                  <NumberField
                    label="سایز فونت"
                    value={layout.role.fontSize}
                    onChange={(v) => updateField("role", "fontSize", v)}
                    step={1}
                    min={8}
                    unit="px"
                  />
                  <WeightField
                    label="وزن فونت"
                    value={layout.role.fontWeight ?? 600}
                    onChange={(v) => updateField("role", "fontWeight", v)}
                  />
                </div>
              )}

              {fieldTab === "photo" && (
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="بالا"
                    value={layout.photo.top}
                    onChange={(v) => updateField("photo", "top", v)}
                    unit="%"
                  />
                  <NumberField
                    label="چپ"
                    value={layout.photo.left}
                    onChange={(v) => updateField("photo", "left", v)}
                    unit="%"
                  />
                  <NumberField
                    label="عرض"
                    value={layout.photo.width}
                    onChange={(v) => updateField("photo", "width", v)}
                    unit="%"
                  />
                  <NumberField
                    label="ارتفاع"
                    value={layout.photo.height}
                    onChange={(v) => updateField("photo", "height", v)}
                    unit="%"
                  />
                  <NumberField
                    label="گردی گوشه"
                    value={layout.photo.borderRadius}
                    onChange={(v) => updateField("photo", "borderRadius", v)}
                    unit="cm"
                  />
                </div>
              )}

              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => {
                  setLayout(LAYOUT_1405);
                  setCardSize(DEFAULT_CARD_SIZE);
                  setCardBackground(DEFAULT_BG);
                }}
              >
                بازگردانی موقعیت پیش‌فرض
              </button>
            </div>
          )}

          {activeTab === "bg" && (
            <div className="space-y-3">
              <label className="block">
                <span className="field-label">قالب پس‌زمینه</span>
                <select
                  name="background"
                  id="background"
                  value={
                    BACKGROUND_PRESETS.some((p) => p.value === CardBackground)
                      ? CardBackground
                      : DEFAULT_BG
                  }
                  onChange={handleChangeBackground}
                  className="field-input"
                >
                  {BACKGROUND_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="field-label">آپلود تصویر سفارشی</span>
                <input
                  className="field-input file:me-3 file:rounded-md file:border-0 file:bg-[var(--sea)]/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-[var(--sea)]"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setCardBackground(url);
                    const img = new window.Image();
                    img.onload = () => {
                      const width = 9;
                      const height = +(width * (img.naturalHeight / img.naturalWidth)).toFixed(2);
                      setCardSize({ width, height });
                    };
                    img.src = url;
                  }}
                  type="file"
                  name="card"
                  id="card"
                  accept="image/*"
                />
              </div>
            </div>
          )}
        </aside>

        <main className="panel overflow-auto p-4 sm:p-6">
          <div
            ref={contentRef}
            className="print-area mx-auto grid w-fit grid-cols-2 place-content-center justify-center"
            style={{ gap: gap ? `${gap}cm` : undefined }}
          >
            {list.map((user, index) => (
              <Card
                key={index}
                {...user}
                index={index}
                countPerPage={CountPerPage}
                marginBottom={MarginBottom}
                cardBackground={CardBackground}
                layout={layout}
                cardWidth={cardSize.width}
                cardHeight={cardSize.height}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PDF;
