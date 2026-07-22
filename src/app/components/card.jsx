"use client";

import personal from "@/../public/personal.jpg";
import { useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ImageCropper } from "./cropper";

function Card({
  src,
  firstName,
  lastName,
  role,
  nameSize,
  roleSize,
  index,
  countPerPage = 6,
  marginBottom = 0,
  cardBackground,
  layout,
  cardWidth = 9,
  cardHeight = 11.75,
}) {
  const imgInput = useRef(null);
  const [currentImg, setCurrentImg] = useState(src || personal.src);
  const [showCropper, setShowCropper] = useState(false);

  const handleSelectImg = () => {
    imgInput.current.click();
  };

  const handleChange = (ev) => {
    const url = URL.createObjectURL(ev.target.files[0]);
    setCurrentImg(url);
    setShowCropper(true);
  };

  const handleSubmitCrop = (result) => {
    setCurrentImg(result);
    setShowCropper(false);
  };

  const margin = useMemo(() => `${marginBottom}cm`, [marginBottom]);

  const nameFont =
    layout?.name?.fontSize ?? (nameSize === "sm" ? 12 : 14);
  const roleFont =
    layout?.role?.fontSize ?? (roleSize === "sm" ? 10 : 12);
  const nameWeight = layout?.name?.fontWeight ?? 700;
  const roleWeight = layout?.role?.fontWeight ?? 600;

  const radius = layout?.photo?.borderRadius ?? 0.35;
  const radiusPx = `${((radius * 96) / 2.54).toFixed(2)}px`;
  const photoRadius = layout?.photo?.asymmetric
    ? `0 ${radiusPx}`
    : radiusPx;

  return (
    <div
      data-card-index={index}
      className={twMerge(
        "card-item relative box-border overflow-hidden bg-white outline outline-1 outline-black"
      )}
      style={{
        width: `${cardWidth}cm`,
        height: `${cardHeight}cm`,
        marginBottom: (index + 1) % countPerPage === 0 ? margin : undefined,
      }}
    >
      <img
        className="absolute z-10 top-0 left-0 h-full w-full"
        src={cardBackground || "/1405/card-1405-01.jpg"}
        alt=""
        style={{ objectFit: "fill" }}
      />
      <p
        className="absolute z-20 flex items-center justify-center text-center text-nowrap text-[#0b1f4d]"
        style={{
          top: `${layout?.name?.top ?? 59.5}%`,
          left: `${layout?.name?.left ?? 19.07}%`,
          width: `${layout?.name?.width ?? 61.85}%`,
          height: `${layout?.name?.height ?? 8.47}%`,
          fontSize: `${nameFont}px`,
          lineHeight: 1.2,
          fontWeight: nameWeight,
        }}
      >
        {firstName} {lastName}
      </p>
      <p
        className="absolute z-20 flex items-center justify-center text-center text-nowrap text-[#0b1f4d]"
        style={{
          top: `${layout?.role?.top ?? 68.85}%`,
          left: `${layout?.role?.left ?? 19.07}%`,
          width: `${layout?.role?.width ?? 61.85}%`,
          height: `${layout?.role?.height ?? 8.47}%`,
          fontSize: `${roleFont}px`,
          lineHeight: 1.2,
          fontWeight: roleWeight,
        }}
      >
        {role}
      </p>
      <img
        onClick={handleSelectImg}
        src={currentImg}
        className="absolute z-20 cursor-pointer object-cover"
        style={{
          top: `${layout?.photo?.top ?? 13.48}%`,
          left: `${layout?.photo?.left ?? 31}%`,
          width: `${layout?.photo?.width ?? 38}%`,
          height: `${layout?.photo?.height ?? 39.16}%`,
          borderRadius: photoRadius,
        }}
        alt=""
      />
      <input
        type="file"
        name="img"
        id={`image-${index}`}
        accept="image/*"
        className="invisible absolute"
        ref={imgInput}
        onChange={handleChange}
      />
      {showCropper && (
        <ImageCropper
          src={currentImg}
          handleSubmit={handleSubmitCrop}
          close={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}

export default Card;
