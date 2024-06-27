import { ArrowDownIcon } from "@heroicons/react/24/outline";
import React from "react";
import { saveAs } from "file-saver";

const DownloadSvg = ({
  svg,
  fileName = "image2",
  sizeMultiplier = 1,
  index,
  setImages,
}) => {
  const handleDownload = async () => {
    // download svg with .svg extension
    // Example svg
    //     const svg = `
    // <svg width="2048" height="1024" viewBox="0 0 2048 1024" xmlns="http://www.w3.org/2000/svg">
    //   <path d="M 0 0 L 2046.25 0 C 2048.75 3.75313 2047.99 9.76244 2047.99 14.1208 L 2048.02 767.612 L 2048.01 954.147 C 2048.01 967.073 2049.66 1011.74 2047.62 1020.8 C 2047.36 1021.98 2046.85 1022.96 2046.25 1024 L 0 1024 L 0 0 z" fill="#fefefeff"/>
    // </svg>
    // `;

    const svgBlob = new Blob([svg], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);

    saveAs(svgBlob, `${fileName}.svg`);
    setImages((prevImages) => {
      return prevImages.filter((_, i) => i !== index);
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
