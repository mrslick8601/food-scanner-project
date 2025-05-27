import React from 'react';

export const StethoscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M3.75 10.125V13.5M3.75 3.75v2.25M10.125 3.75h3.375M10.125 20.25h3.375M16.875 3.75v2.25M20.25 10.125V13.5" 
    />
  </svg>
);
