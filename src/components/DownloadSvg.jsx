import { ArrowDownIcon } from "@heroicons/react/24/outline";
import React from "react";
import { saveAs } from "file-saver";

const DownloadSvg = ({
  svg,
  fileName = "image2",
  id,
  setImages,
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

    const svgBlob = new Blob([svg], {
      type: "image/svg+xml;charset=utf-8",
    });

    saveAs(svgBlob, `${fileName}.svg`);
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
