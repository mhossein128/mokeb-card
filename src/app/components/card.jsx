"use client";

import personal from "@/../public/personal.jpg";
import { useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ImageCropper } from "./cropper";
import { CM_TO_PX } from "./units";

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

  const widthPx = Math.round(cardWidth * CM_TO_PX);
  const heightPx = Math.round(cardHeight * CM_TO_PX);
  const margin = useMemo(
    () => `${Math.round(marginBottom * CM_TO_PX)}px`,
    [marginBottom]
  );

  const nameFont =
    layout?.name?.fontSize ?? (nameSize === "sm" ? 12 : 15);
  const roleFont =
    layout?.role?.fontSize ?? (roleSize === "sm" ? 12 : 15);
  const nameWeight = layout?.name?.fontWeight ?? 700;
  const roleWeight = layout?.role?.fontWeight ?? 700;

  const radius = layout?.photo?.borderRadius ?? 0.35;
  const radiusPx = `${(radius * CM_TO_PX).toFixed(2)}px`;
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
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        marginBottom: (index + 1) % countPerPage === 0 ? margin : undefined,
      }}
    >
      <img
        data-card-bg
        className="pointer-events-none absolute z-10 top-0 left-0 h-full w-full"
        src={cardBackground || "/1405/card-1405-01.jpg"}
        alt=""
        style={{ objectFit: "fill" }}
        draggable={false}
      />
      <p
        data-card-name
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
        data-card-role
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
        data-card-photo
        onClick={handleSelectImg}
        src={currentImg}
        className="absolute z-20 cursor-pointer object-cover"
        style={{
          top: `${layout?.photo?.top ?? 13.48}%`,
          left: `${layout?.photo?.left ?? 30.5}%`,
          width: `${layout?.photo?.width ?? 39}%`,
          height: `${layout?.photo?.height ?? 39.16}%`,
          borderRadius: photoRadius,
        }}
        alt=""
        draggable={false}
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
