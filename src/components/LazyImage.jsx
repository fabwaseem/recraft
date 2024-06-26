import React, { useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import placehodlderImage from "../assets/placeholder.jpg";

const LazyImage = ({ src, alt }) => {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      placeholderSrc={placehodlderImage}
      className="h-full w-full object-cover rounded-lg"
    />
  );
};

export default LazyImage;
