import React, { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import LogoWhite from "../assets/logo-white.png";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const handelDarkMode = () => {
    if (darkMode) {
      setDarkMode(false);
      document.body.classList.remove("dark");
      localStorage.removeItem("darkMode", true);
    } else {
      setDarkMode(true);
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", true);
    }
  };

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode");
    if (isDarkMode) {
      setDarkMode(true);
      document.body.classList.add("dark");
    }
  }, [localStorage]);

  return (
    <nav className="bg-white border-b-[1px] fixed w-full h-14 md:h-20 flex items-center justify-between  text-dark px-5 md:px-10 dark:bg-darkBg dark:border-gray-600 transition-colors z-50 ">
      <div className="h-full flex items-center ">
        <Link
          to={"/"}
          className=" text-xl dark:text-white transition-colors flex items-center gap-3"
        >
          {darkMode ? (
            <img src={LogoWhite} alt="logo" className="w-8" />
          ) : (
            <img src={Logo} alt="logo" className="w-8" />
          )}
          Imager
        </Link>
      </div>
      <div className="flex items-center h-full">
        <div
          className="flex items-center justify-between relative px-2 cursor-pointer h-10 w-20  bg-gray-100 rounded-full dark:bg-[#303030]  transition-colors"
          onClick={handelDarkMode}
        >
          <SunIcon
            className={`w-6 z-10 transition-all text-dark dark:text-gray-500`}
          />
          <MoonIcon
            className={`w-5 z-10 transition-all dark:text-white text-gray-500`}
          />
          <span
            className={` w-10 h-10 rounded-full absolute  top-0  bg-white shadow-lg transition-all left-0 dark:left-10  dark:bg-darkBg dark:shadow-white dark:shadow-sm `}
          ></span>
        </div>
       
      </div>
    </nav>
  );
};

export default Navbar;
