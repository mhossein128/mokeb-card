"use client";

import React, { useRef, useState } from "react";
import readXlsxFile from "read-excel-file";

function ImportData({ handleData }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const data = await readXlsxFile(file);
      const copy = [];
      data.forEach((item) => {
        copy.push({
          firstName: item?.[1],
          lastName: item?.[2],
          role: item?.[7],
          nationalId: item?.[3] + "",
          nameSize: (item?.[1] + item?.[2])?.length > 15 ? "sm" : "md",
          roleSize: item?.[7]?.length > 22 ? "sm" : "md",
          image: "",
        });
      });
      handleData(copy);
    } catch (err) {
      console.error(err);
      setError("خواندن فایل با خطا مواجه شد. فرمت اکسل را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    parseFile(e.target.files?.[0]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    parseFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium tracking-wide text-[var(--sea-mid)]">
          موکب ۱۱۲۰
        </p>
        <h1 className="mt-2 text-3xl font-black text-[var(--ink)] sm:text-4xl">
          ساخت کارت شناسایی
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
          فایل اکسل افراد را وارد کنید تا کارت‌ها آماده پرینت و دانلود شوند.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`panel group w-full cursor-pointer border-dashed p-10 text-center transition ${
          dragging
            ? "border-[var(--sea-mid)] bg-[var(--sea)]/5"
            : "hover:border-[var(--sea-mid)]/50"
        }`}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--sea)]/10 text-[var(--sea)] transition group-hover:scale-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-base font-semibold text-[var(--ink)]">
          {loading ? "در حال خواندن فایل..." : "انتخاب یا رها کردن فایل اکسل"}
        </p>
        <p className="mt-2 text-xs text-[var(--ink-soft)]">
          فرمت‌های پشتیبانی‌شده: .xlsx و .xls
        </p>
        <input
          ref={inputRef}
          className="hidden"
          title="فایل اکسل را اینجا وارد کنید"
          onChange={handleChange}
          type="file"
          name="xlsx"
          accept=".xlsx, .xls"
        />
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-[var(--accent)]">{error}</p>
      )}
    </div>
  );
}

export default ImportData;
