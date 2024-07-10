import {
  ArrowUpTrayIcon,
  BookmarkIcon,
  CheckBadgeIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import NavLinkItem from "./NavLinkItem";

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 z-50 h-16 w-full border-t-[1px] bg-white transition-colors dark:border-gray-600  dark:bg-darkBg">
      <ul className="flex h-full flex-1 items-center justify-center gap-7 px-6">
        <NavLinkItem to={"/"}>
          <CheckBadgeIcon className="w-5" />
          <span className="text-xs">Single</span>
        </NavLinkItem>
        <NavLinkItem to={"/auto"}>
          <MagnifyingGlassIcon className="w-5" />
          <span className="text-xs">Multi</span>
        </NavLinkItem>
      </ul>
    </nav>
  );
};

export default MobileNav;
