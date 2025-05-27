
import React from 'react';

export const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      transform="scale(0.8) translate(3, 2)" // Adjusted to look more like a leaf
    />
     <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9.508 8.443c-.817.664-1.553 1.433-2.206 2.287-.973 1.293-1.706 2.733-2.227 4.242M14.492 8.443c.817.664 1.553 1.433 2.206 2.287.973 1.293 1.706 2.733 2.227 4.242M12 18.75V6.75" 
      fill="currentColor"
      className="text-green-300 opacity-50"
    />
  </svg>
);

// Alternative Leaf Icon (Simpler)
// export const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
//     <path d="M17 8C8 10 5.904 16.633 6.5 21.5C12.5 18.5 16.5 12.5 17 8Z" />
//     <path d="M17 7C17 7 18 2 21 3C19.5 4.5 17 7 17 7Z" />
//   </svg>
// );
