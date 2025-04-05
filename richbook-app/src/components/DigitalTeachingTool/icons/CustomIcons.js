import React from 'react';
import DrawingToolIcon from './DrawingToolIcon';

// Home icon for navigation to first page
export const HomeIcon = ({ size = 24, color = 'currentColor', ...props }) => {
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
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
};

// Crop-style icon for Focus Tool
export const CropIcon = ({ size = 24, color = 'currentColor', ...props }) => {
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
      <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
      <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
    </svg>
  );
};

// Export the DrawingToolIcon
export { DrawingToolIcon };

// Curtain icon - closed (when curtain is active)
export const CurtainClosedIcon = ({ size = 24, color = 'currentColor', ...props }) => {
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
      <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
      <path d="M4 3v18" />
      <path d="M8 3v18" />
      <path d="M12 3v18" />
      <path d="M16 3v18" />
      <path d="M20 3v18" />
      <path d="M2 12h20" />
      <rect x="2" y="12" width="20" height="9" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
};

// Curtain icon - open (when curtain is inactive)
export const CurtainOpenIcon = ({ size = 24, color = 'currentColor', ...props }) => {
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
      <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
      <path d="M4 4v4" />
      <path d="M8 4v4" />
      <path d="M12 4v4" />
      <path d="M16 4v4" />
      <path d="M20 4v4" />
      <path d="M4 16v4" />
      <path d="M8 16v4" />
      <path d="M12 16v4" />
      <path d="M16 16v4" />
      <path d="M20 16v4" />
      <path d="M2 12h20" />
      <path d="M2 3 L22 21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2" />
    </svg>
  );
};
