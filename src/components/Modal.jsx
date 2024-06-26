import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  const handleClose = () => {
    document.body.style.overflow = "auto";
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed left-0 top-0 z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={handleClose}
        >
          <div
            className="bg-white dark:bg-darkBg rounded-lg p-5 drop-shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="absolute right-2 -top-12 z-10 flex items-center justify-center rounded w-10 h-10 bg-[#00000038] hover:bg-[#0000008a] cursor-pointer transition-all mb-2"
              onClick={handleClose}
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </span>
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
