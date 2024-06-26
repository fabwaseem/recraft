import {
  ArrowUpTrayIcon,
  BookmarkIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import NavLinkItem from "./NavLinkItem";

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-darkBg border-t-[1px] dark:border-gray-600 transition-colors  z-50">
      <ul className="px-6 h-full flex justify-center items-center gap-7 flex-1">
        <NavLinkItem to={"/"}>
          <HomeIcon className="w-5" />
          <span className="text-xs">Home</span>
        </NavLinkItem>
        <NavLinkItem to={"/auto"}>
          <MagnifyingGlassIcon className="w-5" />
          <span className="text-xs">Auto</span>
        </NavLinkItem>
      </ul>
    </nav>
  );
};

export default MobileNav;
