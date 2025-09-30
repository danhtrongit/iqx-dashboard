import type { SVGProps } from "react"

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 512 512"
    width="1em"
    height="1em"
    {...props}
  >
    <defs>
      <linearGradient
        id="a"
        x1={152}
        x2={65.523}
        y1={167.79}
        y2={259.624}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#007867" /> {/* --palette-primary-dark */}
        <stop offset={1} stopColor="#00A76F" /> {/* --palette-primary-main */}
      </linearGradient>
      <linearGradient
        id="b"
        x1={86}
        x2={86}
        y1={128}
        y2={384}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5BE49B" /> {/* --palette-primary-light */}
        <stop offset={1} stopColor="#00A76F" /> {/* --palette-primary-main */}
      </linearGradient>
      <linearGradient
        id="c"
        x1={402}
        x2={402}
        y1={288}
        y2={384}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5BE49B" /> {/* --palette-primary-light */}
        <stop offset={1} stopColor="#00A76F" /> {/* --palette-primary-main */}
      </linearGradient>
    </defs>
    <path
      fill="url(#a)"
      d="M86.352 246.358c51.159-32.175 75.484-1.341 96.816 39.215-17.653 32.143-29.331 51.758-35.036 58.845-10.759 13.37-22.496 23.493-36.93 29.334-30.346 14.262-68.07 14.929-97.202-2.704l72.352-124.69Z"
    />
    <path
      fill="url(#b)"
      fillRule="evenodd"
      d="M444.31 229.726c-46.27-80.956-94.1-157.228-149.043-45.344-7.516 14.384-12.995 42.337-25.267 42.337v-.142c-12.272 0-17.749-27.953-25.265-42.337C189.79 72.356 141.96 148.628 95.689 229.584c-3.482 6.106-6.827 11.932-9.689 16.996 106.038-67.127 97.11 135.667 184 137.278V384c86.891-1.611 77.962-204.405 184-137.28-2.861-5.062-6.206-10.888-9.69-16.994Z"
      clipRule="evenodd"
    />
    <path
      fill="url(#c)"
      fillRule="evenodd"
      d="M450 384c26.509 0 48-21.491 48-48s-21.491-48-48-48-48 21.491-48 48 21.491 48 48 48Z"
      clipRule="evenodd"
    />
  </svg>
)

export default Logo
