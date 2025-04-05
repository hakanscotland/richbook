import React from 'react';

const CustomEraserIcon = ({ size = 24, color = 'currentColor', ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* A more distinct eraser icon with rectangular shape */}
      <rect x="3" y="14" width="14" height="6" rx="1" transform="rotate(-45 3 14)" />
      <path d="M18.5 8.5l-7 7" />
      <path d="M15 15l5 5" />
    </svg>
  );
};

export default CustomEraserIcon;