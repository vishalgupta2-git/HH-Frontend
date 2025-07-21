import type { SVGProps } from "react";
import * as React from "react";
const SvgArch = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 393 195"
    {...props}
  >
    <path
      fill="url(#arch_svg__a)"
      d="M196.41 50.53s-5.13 43.221-71.95 40.794c0 0-40.54-3.602-34.782 31.081 0 0-54.113-5.229-56.648 54.746 0 0-28.936-1.707-32.008 17.849H-120V0h633v195H391.799s.955-18.142-32.008-17.849c0 0 1.432-55.439-56.648-54.799 0 0 8.353-27.213-29.412-30.868-.03 0-60.228 9.551-77.321-40.953"
    />
    <defs>
      <linearGradient
        id="arch_svg__a"
        x1={196.5}
        x2={196.5}
        y1={29.206}
        y2={151.717}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFAE51" />
        <stop offset={0.989} stopColor="#E87C00" />
      </linearGradient>
    </defs>
  </svg>
);
export default SvgArch;
