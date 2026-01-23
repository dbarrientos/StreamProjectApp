import React from "react";

import LogoIcon from './LogoIcon';

const Logo = ({ className = "" }) => {
  return (
    <div
      className={`select-none flex items-center justify-center ${className}`}
    >
      <LogoIcon 
        className="h-12 md:h-16 w-auto drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]"
      />
    </div>
  );
};

export default Logo;
