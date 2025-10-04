import type { SVGProps } from "react"

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 200 200"
    width="1em"
    height="1em"
    {...props}
  >
    <defs>
      {/* Modern gradient - Electric Blue to Cyan */}
      <linearGradient id="iqx-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      
      {/* Accent gradient - Purple to Pink */}
      <linearGradient id="iqx-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f093fb" />
        <stop offset="100%" stopColor="#f5576c" />
      </linearGradient>
      
      {/* Tech gradient - Teal to Blue */}
      <linearGradient id="iqx-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4facfe" />
        <stop offset="100%" stopColor="#00f2fe" />
      </linearGradient>
    </defs>
    
    {/* Letter I - Stylized with circuit line */}
    <g>
      <rect x="28" y="60" width="18" height="80" rx="9" fill="url(#iqx-gradient-1)" />
      <circle cx="37" cy="45" r="11" fill="url(#iqx-gradient-1)" />
    </g>
    
    {/* Letter Q - Modern with digital touch */}
    <g>
      <circle 
        cx="100" 
        cy="100" 
        r="35" 
        stroke="url(#iqx-gradient-2)" 
        strokeWidth="18" 
        fill="none"
        strokeLinecap="round"
      />
      {/* Q tail with modern angle */}
      <path 
        d="M 120 120 L 135 145 Q 140 150 145 145" 
        stroke="url(#iqx-gradient-2)" 
        strokeWidth="18" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner dot for tech feel */}
      <circle cx="100" cy="100" r="10" fill="url(#iqx-gradient-3)" />
    </g>
    
    {/* Letter X - Dynamic crossed lines */}
    <g>
      <path 
        d="M 150 65 L 180 130" 
        stroke="url(#iqx-gradient-3)" 
        strokeWidth="18" 
        strokeLinecap="round"
      />
      <path 
        d="M 180 65 L 150 130" 
        stroke="url(#iqx-gradient-3)" 
        strokeWidth="18" 
        strokeLinecap="round"
      />
      {/* Center connection point */}
      <circle cx="165" cy="97.5" r="9" fill="url(#iqx-gradient-1)" />
    </g>
    
    {/* Modern accent elements - Tech dots */}
    <circle cx="25" cy="150" r="4" fill="url(#iqx-gradient-3)" opacity="0.7" />
    <circle cx="175" cy="50" r="4" fill="url(#iqx-gradient-2)" opacity="0.7" />
    <circle cx="50" cy="40" r="3" fill="url(#iqx-gradient-1)" opacity="0.5" />
  </svg>
)

export default Logo
