import { ArrowDownIcon } from "@heroicons/react/24/outline";
import React from "react";
import { saveAs } from "file-saver";
import Image from "image-js";
const DownloadButton = ({
  blob,
  fileName = "image2",
  extension = "jpg",
  sizeMultiplier = 1,
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

    const image = await Image.load(blob);

    let resizedImage = image;
    if (sizeMultiplier > 1) {
      resizedImage = image.resize({
        width: image.width * sizeMultiplier,
        height: image.height * sizeMultiplier,
      });
    }

    const resizedBlob = await resizedImage.toBlob("image/png");

    saveAs(resizedBlob, `${fileName}.${extension}`);
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

export default DownloadButton;
