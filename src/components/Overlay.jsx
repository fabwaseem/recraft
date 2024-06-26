import React from "react";

const Overlay = ({ children, onClick }) => {
  return (
    <div
      className="fixed top-0 left-0 h-screen w-screen z-50  flex items-center justify-center"
      onClick={onClick}
    >
      <div className="w-full h-full -z-10 absolute bg-black opacity-30"></div>
      {children}
    </div>
  );
};

export default Overlay;
