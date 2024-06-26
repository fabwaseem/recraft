import React from "react";
import Masonry from "react-masonry-css";

const breakpointColumnsObj = {
  default: 2,
  900: 1,
};

const MasonaryLayout = ({ children }) => {
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex w-full "
      columnClassName="my-masonry-grid_column pl-2 "
    >
      {children}
    </Masonry>
  );
};

export default MasonaryLayout;
