import {
  ArrowUpTrayIcon,
  BookmarkIcon,
  Cog8ToothIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import NavLinkItem from "./NavLinkItem";

const Sidebar = () => {
  return (
    <nav className=" fixed top-20 z-10 flex h-[calc(100%-5rem)] w-24   flex-col border-r-[1px] bg-white transition-colors dark:border-gray-600 dark:bg-darkBg ">
      <ul className="flex flex-1 flex-col gap-7 py-6">
        <NavLinkItem to={"/"}>
          <HomeIcon className="w-5" />
          <span className="text-xs">Home</span>
        </NavLinkItem>
        <NavLinkItem to={"/auto"}>
          <MagnifyingGlassIcon className="w-5" />
          <span className="text-xs">Auto</span>
        </NavLinkItem>
        <NavLinkItem to={"/hunt"}>
          <BookmarkIcon className="w-5" />
          <span className="text-xs">Hunt</span>
        </NavLinkItem>
      </ul>
      <ul className="flex flex-col gap-7 py-6">
        <NavLinkItem to={"/settings"}>
          <Cog8ToothIcon className="w-5" />
          <span className="text-xs">Settings</span>
        </NavLinkItem>
      </ul>
    </nav>
  );
};

export default Sidebar;
