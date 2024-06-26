import React from "react";
import { NavLink } from "react-router-dom";

const NavLinkItem = ({ to, children }) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive
            ? "nav-link text-primary"
            : "nav-link text-gray-500 hover:text-dark dark:text-gray-400 dark:hover:text-white"
        }
      >
        {children}
      </NavLink>
    </li>
  );
};

export default NavLinkItem;
