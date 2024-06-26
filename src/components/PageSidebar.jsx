import React, { useState } from "react";
import useWindowSize from "../hooks/WindowSize";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Overlay from "./Overlay";

const PageSidebar = ({ children, sidebarActive, handleSidebar }) => {
  return (
    <div>
      {sidebarActive && <Overlay onClick={handleSidebar} />}
      <div
        className={` h-screen px-5 border-l dark:border-gray-600  fixed bottom-0  w-full max-w-[300px] z-50 bg-white text-[#414141] dark:bg-darkBg  transition-all
       ${sidebarActive ? "right-0" : "-right-[300px]"}
       ${useWindowSize().width > 768 ? "p-10 " : `p-5   `}`}
      >
        {sidebarActive && (
          <div className="absolute right-full top-24 ">
            <button
              className="w-10 h-10 flex justify-center items-center rounded border dark:border-gray-600  bg-white dark:bg-dark dark:text-white"
              onClick={handleSidebar}
            >
              <span className="sr-only">Close Sidebar</span>
              <span className={`block`}>
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default PageSidebar;
