import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { getImagesById } from "../api";
import { HeartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import DownloadButton from "./DownloadButton";
import { Link } from "react-router-dom";

const PreviewModal = ({ isOpen, onClose, id }) => {
  const [image, setImage] = useState([]);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await getImagesById(id);
        setImage(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchImage();
  }, []);
  const formatFileSize = (sizeInBytes) => {
    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;

    if (sizeInBytes < kilobyte) {
      return sizeInBytes + " B";
    } else if (sizeInBytes < megabyte) {
      const sizeInKB = (sizeInBytes / kilobyte).toFixed(2);
      return sizeInKB + " KB";
    } else {
      const sizeInMB = (sizeInBytes / megabyte).toFixed(2);
      return sizeInMB + " MB";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col overflow-hidden h-full overflow-y-auto md:flex-row max-h-[calc(100vh-200px)] max-w-[calc(100vw-100px)]  min-w-[calc(100vw-100px)] md:min-h-[calc(80vh-200px)] md:min-w-[calc(50vw-100px)]">
        <div className="md:w-1/2  flex-shrink-0 overflow-hidden text-base px-5 flex flex-col h-auto">
          <div className="md:mt-6 mt-4 ml-2 grid grid-cols-2 gap-2  md:flex  flex-wrap md:flex-col md:space-x-0 md:space-y-1 h-auto pb-4 sm:pb-8 dark:text-white">
            {image.title && (
              <div>
                <div className="text-xs opacity-50">Title</div>
                <div className="text-sm">{image.title}</div>
              </div>
            )}
            {image.description && (
              <div>
                <div className="text-xs opacity-50">Description</div>
                <div className="text-sm">{image.description}</div>
              </div>
            )}
            {image.category && (
              <div>
                <div className="text-xs opacity-50">Category</div>
                <div className="text-sm">{image.category}</div>
              </div>
            )}
            {image.tags && (
              <div>
                <div className="text-xs opacity-50">Tags</div>
                <div className="text-sm">
                  {image.tags.map((tag, index) => {
                    return (
                      <Link
                        to={`/search?q=${tag}`}
                        key={index}
                        className="mr-1 hover:text-primary"
                      >
                        {tag},
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            {image.filesize && (
              <div>
                <div className="text-xs opacity-50">Filesize</div>
                <div className="text-sm">{formatFileSize(image.filesize)}</div>
              </div>
            )}
            {image.width && image.height && (
              <div>
                <div className="text-xs opacity-50">Dimensions</div>
                <div className="text-sm">
                  {image.width} × {image.height}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* <img src={image.url} alt="" className="w-1/2 object-cover" /> */}
        <div className="relative overflow-hidden rounded-lg group bg-zinc-200 dark:bg-zinc-800">
          <div className="absolute left-0 top-0 w-full h-full bg-black opacity-0 group-hover:opacity-20 transition-all "></div>
          <div className="w-10 h-1 absolute -top-20 right-2 opacity-0 group-hover:top-2 group-hover:opacity-100 transition-all">
            <span className="flex items-center justify-center rounded w-10 h-10 bg-[#00000038] hover:bg-[#0000008a] cursor-pointer transition-all mb-2">
              <HeartIcon className="w-6 h-6 text-white" />
            </span>
          </div>
          <div className="w-10 h-1 absolute -bottom-20 right-2 opacity-0 group-hover:bottom-12 group-hover:opacity-100 transition-all">
            <DownloadButton imageUrl={image.url} />
          </div>
          <div className="">
            <img src={image.url} className="w-full h-full object-contain " />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PreviewModal;
