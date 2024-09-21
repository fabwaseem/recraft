import React from "react";
import { saveAs } from "file-saver";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

const DownloadSvg = ({
  svg,
  fileName = "image2",
  id,
  setImages,
  extension = "svg",
  multiplier = 1,
}) => {
  const handleDownload = async () => {
    setImages((prevImages) => {
      return prevImages.map((image) => {
        if (image.id === id) {
          return { ...image, hidden: true };
        }
        return image;
      });
    });

    if (extension === "svg") {
      const svgBlob = new Blob([svg], {
        type: "image/svg+xml;charset=utf-8",
      });
      saveAs(svgBlob, `${fileName}.svg`);
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Apply multiplier to width and height
        const scaledWidth = img.width * multiplier;
        const scaledHeight = img.height * multiplier;

        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        if (extension === "jpg") {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, scaledWidth, scaledHeight);
        }

        // Draw the image with the new dimensions
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

        canvas.toBlob(
          (blob) => {
            saveAs(blob, `${fileName}.${extension}`);
          },
          `image/${extension === "jpg" ? "jpeg" : extension}`,
        );
      };

      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(svgBlob);
    }

    setImages((prevImages) => {
      return prevImages.filter((image) => image.id !== id);
    });
  };

  return (
    <span
      className="mb-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-[#00000038] transition-all hover:bg-[#0000008a]"
      onClick={handleDownload}
    >
      <ArrowDownIcon className="h-6 w-6 text-white" />
    </span>
  );
};

export default DownloadSvg;
