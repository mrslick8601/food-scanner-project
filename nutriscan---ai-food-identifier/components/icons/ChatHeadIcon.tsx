
import React from 'react';

export const ChatHeadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    // fill="currentColor" is usually passed via props by the parent button's text color (text-white)
    // Individual paths will define their own fills for the 3D effect.
    {...props}
    className={`${props.className || ''} animate-pulseSlow`} 
  >
    <defs>
      <linearGradient id="chatHeadTopSurfaceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{stopColor: 'white', stopOpacity: 1}} />
        <stop offset="100%" style={{stopColor: '#e0e0e0', stopOpacity: 1}} /> 
      </linearGradient>
    </defs>

    {/* Base Layer (Depth/Extrusion) */}
    {/* This path is just the outer circle of the icon */}
    <path 
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
      fill="#581C87" // A dark purple, like Tailwind's purple-800 or darker, for depth
      transform="translate(0.6, 1.2)" // Offset to create the 3D effect
    />

    {/* Top Surface Layer (with face details) */}
    {/* This path includes the outer circle and the internal "face" features */}
    <path 
      fill="url(#chatHeadTopSurfaceGradient)" // Apply the gradient for a rounded/beveled look
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM9.5 9.5a1 1 0 110-2 1 1 0 010 2zm5 0a1 1 0 110-2 1 1 0 010 2zm-2.5 7a4.5 4.5 0 01-4.243-3h8.486a4.5 4.5 0 01-4.243 3zM12 6.5A1.5 1.5 0 0110.5 5h3A1.5 1.5 0 0112 6.5z"
    />
    
    {/* Glint Element (on top) */}
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M17.25 6.25a.75.75 0 01.22.53v.22l-1.5 1.5-.22-.53-.22.53-1.5-1.5.22-.53.53.22 1.5-1.5.53.22.22-.53.22.53z" 
      fill="white" // Glint should be bright white
      fillOpacity="0.75" // Slightly adjusted opacity
    />
  </svg>
);
