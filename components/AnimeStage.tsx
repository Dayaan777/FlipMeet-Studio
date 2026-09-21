"use client";

interface AnimeStageProps {
  className?: string;
}

export default function AnimeStage({ className = "" }: AnimeStageProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 h-[220px] sm:h-[250px] select-none ${className}`}
    >
      {/* ── 1. Soft Single Overhead Key Light Cone ── */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[340px] w-[50%] max-w-[500px]"
        style={{
          background:
            "radial-gradient(ellipse 65% 90% at 50% 0%, rgba(255, 120, 50, 0.08) 0%, rgba(255, 255, 255, 0.035) 30%, rgba(255, 255, 255, 0.008) 60%, transparent 80%)",
          filter: "blur(8px)",
        }}
      />

      {/* ── 2. Deep Ground Ambient Bloom (Warm Orange Underglow) ── */}
      <div className="absolute bottom-[3.5rem] left-1/2 -translate-x-1/2 h-[120px] w-[55%] max-w-[560px]">
        <div
          className="h-full w-full rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(255, 77, 30, 0.28) 0%, rgba(255, 50, 10, 0.12) 40%, transparent 72%)",
            filter: "blur(18px)",
          }}
        />
      </div>

      {/* ── 3. Atmospheric Soft Fog / Mist Behind & Around Stage ── */}
      <div className="absolute inset-x-0 bottom-[3.5rem] h-[140px] overflow-hidden">
        {/* Deep background fog band */}
        <div
          className="absolute inset-x-[-10%] bottom-8 h-[90px]"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 70%, rgba(180, 185, 200, 0.09) 0%, rgba(255, 100, 40, 0.04) 35%, transparent 75%)",
            filter: "blur(22px)",
          }}
        />
        {/* Billowing mid-level mist plumes */}
        <div
          className="absolute left-[15%] bottom-2 h-[80px] w-[35%]"
          style={{
            background:
              "radial-gradient(ellipse at 40% 60%, rgba(200, 205, 220, 0.07) 0%, transparent 70%)",
            filter: "blur(14px)",
          }}
        />
        <div
          className="absolute right-[15%] bottom-3 h-[85px] w-[38%]"
          style={{
            background:
              "radial-gradient(ellipse at 60% 60%, rgba(200, 205, 220, 0.065) 0%, transparent 70%)",
            filter: "blur(15px)",
          }}
        />
        {/* Soft low mist swirling directly at the pedestal riser base */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[60px] w-[45%]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 80%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 90, 30, 0.05) 30%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />
      </div>

      {/* ── 4. Main SVG Stage: Base Disc + Center Raised Pedestal + Wet Reflections + Craggy Rocks ── */}
      <svg
        viewBox="0 0 1000 240"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Base outer disc vertical rim gradient */}
          <linearGradient id="stBaseWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c2c30" />
            <stop offset="30%" stopColor="#141416" />
            <stop offset="100%" stopColor="#040405" />
          </linearGradient>

          {/* Base disc top wet stone surface */}
          <radialGradient id="stBaseTop" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#1e1e22" />
            <stop offset="45%" stopColor="#131316" />
            <stop offset="80%" stopColor="#0a0a0c" />
            <stop offset="100%" stopColor="#040405" />
          </radialGradient>

          {/* Base disc front perimeter specular highlight */}
          <linearGradient id="stBaseRimHighlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="18%" stopColor="rgba(255,140,80,0.2)" />
            <stop offset="35%" stopColor="rgba(255,200,160,0.65)" />
            <stop offset="50%" stopColor="rgba(255,240,230,0.85)" />
            <stop offset="65%" stopColor="rgba(255,200,160,0.65)" />
            <stop offset="82%" stopColor="rgba(255,140,80,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Raised Pedestal vertical cylinder riser wall */}
          <linearGradient id="stPedestalWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#222226" />
            <stop offset="40%" stopColor="#141418" />
            <stop offset="85%" stopColor="#09090b" />
            <stop offset="100%" stopColor="#040405" />
          </linearGradient>

          {/* Raised Pedestal top surface */}
          <radialGradient id="stPedestalTop" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#2a2a30" />
            <stop offset="50%" stopColor="#18181c" />
            <stop offset="85%" stopColor="#0d0d0f" />
            <stop offset="100%" stopColor="#070709" />
          </radialGradient>

          {/* Pedestal top specular rim highlight */}
          <linearGradient id="stPedestalTopRim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="25%" stopColor="rgba(255,150,90,0.3)" />
            <stop offset="50%" stopColor="rgba(255,220,190,0.75)" />
            <stop offset="75%" stopColor="rgba(255,150,90,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Electric Orange Rim Light Gradient for Pedestal Base */}
          <linearGradient id="stOrangeRimGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,77,30,0)" />
            <stop offset="15%" stopColor="rgba(255,77,30,0.4)" />
            <stop offset="35%" stopColor="rgba(255,120,60,0.9)" />
            <stop offset="50%" stopColor="rgba(255,230,200,1)" />
            <stop offset="65%" stopColor="rgba(255,120,60,0.9)" />
            <stop offset="85%" stopColor="rgba(255,77,30,0.4)" />
            <stop offset="100%" stopColor="rgba(255,77,30,0)" />
          </linearGradient>

          {/* Left/Right Craggy Rocks Gradients */}
          <linearGradient id="stRockLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#070708" />
            <stop offset="45%" stopColor="#151518" />
            <stop offset="80%" stopColor="#09090a" />
            <stop offset="100%" stopColor="#020203" />
          </linearGradient>
          <linearGradient id="stRockRight" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070708" />
            <stop offset="45%" stopColor="#161619" />
            <stop offset="80%" stopColor="#0a0a0c" />
            <stop offset="100%" stopColor="#020203" />
          </linearGradient>

          {/* Filters for glow effects */}
          <filter id="stGlowSoft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="stGlowTight" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── A. Deep Base Ground Shadow ── */}
        <ellipse cx="500" cy="208" rx="465" ry="24" fill="rgba(0,0,0,0.85)" filter="blur(8px)" />

        {/* ── B. Large Flat Base (Lower Tier) ── */}
        {/* Lower disc vertical wall (riser thickness) */}
        <path
          d="M 50,188 A 450 34 0 0 0 950,188 L 950,202 A 450 34 0 0 1 50,202 Z"
          fill="url(#stBaseWall)"
        />
        {/* Lower disc wall bevel reflection seam */}
        <path
          d="M 50,202 A 450 34 0 0 0 950,202"
          fill="none"
          stroke="rgba(0,0,0,0.9)"
          strokeWidth="1.5"
        />

        {/* Lower disc top wet stone surface */}
        <ellipse cx="500" cy="188" rx="450" ry="34" fill="url(#stBaseTop)" />

        {/* Wet stone surface radial grooves & flagstone seams */}
        <ellipse cx="500" cy="188" rx="425" ry="30" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
        <ellipse cx="500" cy="188" rx="380" ry="26" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.8" />
        <ellipse cx="500" cy="188" rx="270" ry="19" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.8" />

        {/* Fine stone fissure / crack lines across lower base */}
        <path d="M 160,185 L 210,192 L 245,190" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.7" />
        <path d="M 270,196 L 310,192 L 325,198" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="0.6" />
        <path d="M 680,197 L 720,193 L 760,197" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.7" />
        <path d="M 780,187 L 830,192 L 865,189" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="0.6" />

        {/* Wet stone specular gloss pools on lower base */}
        <ellipse cx="280" cy="195" rx="70" ry="6" fill="rgba(255,255,255,0.03)" filter="blur(3px)" />
        <ellipse cx="720" cy="195" rx="75" ry="6" fill="rgba(255,255,255,0.03)" filter="blur(3px)" />
        <ellipse cx="500" cy="198" rx="140" ry="8" fill="rgba(255,100,40,0.06)" filter="blur(4px)" />

        {/* Lower base front rim specular highlight arc */}
        <path
          d="M 65,188 A 450 34 0 0 0 935,188"
          fill="none"
          stroke="url(#stBaseRimHighlight)"
          strokeWidth="1.8"
        />

        {/* ── C. Wet-Stone Reflection of Pedestal Rim ── */}
        <ellipse
          cx="500"
          cy="187"
          rx="185"
          ry="11"
          fill="url(#stOrangeRimGlow)"
          opacity="0.35"
          filter="blur(5px)"
        />

        {/* ── D. Raised Center Pedestal (Distinct Riser Tier) ── */}
        {/* Pedestal cast shadow onto lower base */}
        <ellipse cx="500" cy="184" rx="190" ry="17" fill="rgba(0,0,0,0.8)" filter="blur(5px)" />

        {/* Pedestal vertical cylindrical riser wall */}
        <path
          d="M 320,154 A 180 20 0 0 0 680,154 L 680,182 A 180 20 0 0 1 320,182 Z"
          fill="url(#stPedestalWall)"
        />

        {/* Pedestal wall subtle stone texture lines */}
        <path d="M 370,156 L 372,181" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
        <path d="M 435,158 L 436,182" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
        <path d="M 500,159 L 500,183" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
        <path d="M 565,158 L 564,182" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
        <path d="M 630,156 L 628,181" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />

        {/* Pedestal top circular cap surface */}
        <ellipse cx="500" cy="154" rx="180" ry="20" fill="url(#stPedestalTop)" />

        {/* Pedestal top inner wet stone sheen */}
        <ellipse cx="500" cy="154" rx="160" ry="16" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <ellipse cx="500" cy="154" rx="130" ry="12" fill="none" stroke="rgba(255,100,40,0.06)" strokeWidth="1.2" />

        {/* Pedestal top specular rim highlight */}
        <path
          d="M 326,154 A 180 20 0 0 0 674,154"
          fill="none"
          stroke="url(#stPedestalTopRim)"
          strokeWidth="1.4"
        />

        {/* ── E. Glowing Rim Light at Pedestal Base (Centerpiece of Reference!) ── */}
        {/* 1. Deep outer orange aura / bloom */}
        <path
          d="M 320,182 A 180 20 0 0 0 680,182"
          fill="none"
          stroke="#FF4D1E"
          strokeWidth="12"
          opacity="0.35"
          filter="url(#stGlowSoft)"
        />
        {/* 2. Intense bright orange glow */}
        <path
          d="M 320,182 A 180 20 0 0 0 680,182"
          fill="none"
          stroke="#FF6B35"
          strokeWidth="5"
          opacity="0.85"
          filter="url(#stGlowTight)"
        />
        {/* 3. Pure white-hot luminous core filament */}
        <path
          d="M 321,182 A 180 20 0 0 0 679,182"
          fill="none"
          stroke="url(#stOrangeRimGlow)"
          strokeWidth="2.2"
        />

        {/* ── F. Dark Rocky Elements at Foreground Edges (Matching Reference) ── */}
        {/* Left crag & jagged boulders */}
        <path
          d="M 0,240 L 0,165 Q 22,176 42,192 T 82,182 T 120,214 T 175,232 T 225,240 Z"
          fill="url(#stRockLeft)"
        />
        {/* Left rock facet highlight lines catching subtle light */}
        <path
          d="M 12,172 L 40,190 L 78,184 L 115,212 L 168,228"
          fill="none"
          stroke="rgba(255,120,60,0.18)"
          strokeWidth="0.9"
        />
        <path
          d="M 28,198 L 65,190 L 102,224"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.7"
        />

        {/* Right crag & jagged boulders */}
        <path
          d="M 1000,240 L 1000,168 Q 975,178 952,172 T 910,204 T 865,220 T 805,236 T 765,240 Z"
          fill="url(#stRockRight)"
        />
        {/* Right rock facet highlight lines catching subtle light */}
        <path
          d="M 988,174 L 955,174 L 914,202 L 872,218 L 812,234"
          fill="none"
          stroke="rgba(255,120,60,0.18)"
          strokeWidth="0.9"
        />
        <path
          d="M 968,186 L 932,182 L 892,214"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.7"
        />
      </svg>
    </div>
  );
}
