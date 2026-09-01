import React from 'react';

interface IbacmiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light';
}

export const IbacmiLogo: React.FC<IbacmiLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'dark',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textTitleSize = {
    sm: 'text-xs leading-tight',
    md: 'text-sm sm:text-base leading-none',
    lg: 'text-base sm:text-lg leading-tight',
    xl: 'text-xl sm:text-2xl leading-tight',
  };

  const textSubtitleSize = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-xs',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official IBACMI Emblem SVG */}
      <div className={`relative shrink-0 ${sizeMap[size]}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Outer Outer Ring Gold */}
          <circle cx="50" cy="50" r="48" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />
          
          {/* Outer Crimson Red Ring */}
          <circle cx="50" cy="50" r="44" fill="#881337" stroke="#f59e0b" strokeWidth="1" />
          
          {/* Inner Light Ring */}
          <circle cx="50" cy="50" r="33" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />

          {/* Curved Text Simulation in Crimson Ring */}
          <path id="curveTop" d="M 20,50 A 30,30 0 0,1 80,50" fill="transparent" />
          <text fontSize="7.5" fontWeight="900" fill="#ffffff" letterSpacing="1.2">
            <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
              IBA COLLEGE
            </textPath>
          </text>

          <path id="curveBottom" d="M 80,50 A 30,30 0 0,1 20,50" fill="transparent" />
          <text fontSize="6.5" fontWeight="800" fill="#fcd34d" letterSpacing="1">
            <textPath href="#curveBottom" startOffset="50%" textAnchor="middle">
              OF MINDANAO
            </textPath>
          </text>

          {/* Central Shield Graphic */}
          <g transform="translate(30, 26) scale(0.4)">
            {/* Shield Background */}
            <path
              d="M 50,0 Q 100,5 100,45 C 100,85 50,110 50,110 C 50,110 0,85 0,45 Q 0,5 50,0 Z"
              fill="#991b1b"
              stroke="#d97706"
              strokeWidth="4"
            />
            {/* Split Shield Colors */}
            <path
              d="M 50,0 Q 100,5 100,45 C 100,85 50,110 50,110 Z"
              fill="#b91c1c"
            />
            {/* Open Book */}
            <path
              d="M 30,45 Q 50,38 50,48 Q 50,38 70,45 L 70,68 Q 50,60 50,70 Q 50,60 30,68 Z"
              fill="#fef08a"
              stroke="#b45309"
              strokeWidth="2"
            />
            {/* Torch of Knowledge */}
            <path
              d="M 47,20 L 53,20 L 52,38 L 48,38 Z"
              fill="#f59e0b"
            />
            {/* Flame */}
            <path
              d="M 50,10 Q 56,16 50,22 Q 44,16 50,10 Z"
              fill="#dc2626"
            />
            {/* Tech Gear accent */}
            <circle cx="50" cy="85" r="8" fill="#d97706" />
            <circle cx="50" cy="85" r="4" fill="#ffffff" />
          </g>
          
          {/* Small Stars */}
          <polygon points="12,50 14,51 13,53 11,52 10,53 10,51" fill="#f59e0b" />
          <polygon points="88,50 90,51 89,53 87,52 86,53 86,51" fill="#f59e0b" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight font-serif uppercase ${
              textColor === 'light' ? 'text-white' : 'text-navy-950 text-slate-900'
            } ${textTitleSize[size]}`}
          >
            IBA College of Mindanao
          </span>
          <span
            className={`font-medium tracking-wide ${
              textColor === 'light' ? 'text-amber-300' : 'text-amber-700'
            } ${textSubtitleSize[size]}`}
          >
            Valencia City, Bukidnon • Founded 2005
          </span>
        </div>
      )}
    </div>
  );
};
