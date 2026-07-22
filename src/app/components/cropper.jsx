"use client";

import React, { useRef, useState } from "react";
import { Cropper } from "react-advanced-cropper";

export const ImageCropper = ({ src, handleSubmit, close }) => {
  const [image, setImage] = useState(src);
  const [rotate, setRotate] = useState(0);
  const cropperRef = useRef();

  const onChange = (cropper) => {
    // setImage(cropper);
    console.log(
      cropper.getCoordinates(),
      cropper.getCanvas(),
      cropper.getImage()
    );
  };

  return (
    <div className="panel fixed top-9 right-9 z-50 w-[400px] p-5 shadow-2xl">
      <Cropper
        ref={cropperRef}
        aspectRatio={3 / 4}
        src={image}
        onChange={onChange}
        className={"cropper h-[400px] w-full"}
      />
      <div className="my-3 flex justify-center">
        <input
          min={0}
          max={36}
          step={1}
          defaultValue={0}
          onChange={(ev) => {
            cropperRef.current.getTransforms();
            cropperRef.current.rotateImage(+ev.target.value);
          }}
          type="range"
          name="rotate"
          className="mx-auto w-full accent-[var(--sea)]"
        />
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => {
            handleSubmit(
              cropperRef.current.getCanvas().toDataURL("image/jpeg")
            );
          }}
          className="btn-primary"
        >
          تایید
        </button>
        <button onClick={close} className="btn-danger">
          بستن
        </button>
      </div>
    </div>
  );
};
