/**
 * PlatformRing — shared SVG concentric-ring stage platform.
 * Used by both LookCarousel and FeaturedLooksGrid.
 *
 * Props
 * bloomX   – horizontal % (0-100) for the orange floor bloom. 50 = centre.
 * className – extra classes on the root wrapper (use for positioning).
 */

interface PlatformRingProps {
  bloomX?: number;
  className?: string;
}

export default function PlatformRing({ bloomX = 50, className = "" }: PlatformRingProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 h-[120px] ${className}`}
    >
      {/* Active-look orange floor bloom */}
      <div
        className="absolute bottom-0 h-[90px] w-[28%] -translate-x-1/2"
        style={{ left: `${bloomX}%` }}
      >
        <div className="h-full w-full rounded-[50%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,100,20,0.55)_0%,rgba(255,60,0,0.22)_35%,transparent_70%)] blur-[2px]" />
      </div>

      {/* SVG concentric ring platform */}
      <svg
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="prRingOuter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#555555" stopOpacity="1" />
            <stop offset="30%"  stopColor="#2a2a2a" stopOpacity="1" />
            <stop offset="100%" stopColor="#0d0d0d" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="prRingInner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#444444" stopOpacity="1" />
            <stop offset="25%"  stopColor="#1e1e1e" stopOpacity="1" />
            <stop offset="100%" stopColor="#080808" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="prSpecular" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0)"    />
            <stop offset="20%"  stopColor="rgba(255,255,255,0.06)" />
            <stop offset="38%"  stopColor="rgba(255,255,255,0.28)" />
            <stop offset="52%"  stopColor="rgba(255,255,255,0.18)" />
            <stop offset="70%"  stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
          </linearGradient>
          <clipPath id="prTopHalf">
            <rect x="0" y="0" width="1000" height="60" />
          </clipPath>
        </defs>

        {/* Outer ring groove */}
        <ellipse cx="500" cy="80" rx="490" ry="38"
          fill="#050505" stroke="url(#prRingOuter)" strokeWidth="5" />

        {/* Subtle surface sheen */}
        <ellipse cx="500" cy="80" rx="472" ry="33"
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="30" />

        {/* Inner ring groove */}
        <ellipse cx="500" cy="80" rx="455" ry="28"
          fill="none" stroke="url(#prRingInner)" strokeWidth="3.5" />

        {/* Specular arc highlight — top arc only */}
        <ellipse cx="500" cy="80" rx="490" ry="38"
          fill="none" stroke="url(#prSpecular)" strokeWidth="5"
          clipPath="url(#prTopHalf)" />
      </svg>
    </div>
  );
}
