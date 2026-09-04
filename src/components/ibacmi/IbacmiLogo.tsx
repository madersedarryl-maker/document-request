import React from 'react';
import officialLogoImg from '../../assets/images/ibacmi-logo.png';

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
      {/* Official IBACMI Emblem */}
      <div className={`relative shrink-0 ${sizeMap[size]}`}>
        <img
          src={officialLogoImg}
          alt="IBA College of Mindanao Official Seal"
          className="w-full h-full object-contain drop-shadow-sm select-none"
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight font-serif uppercase ${
              textColor === 'light' ? 'text-white' : 'text-slate-900'
            } ${textTitleSize[size]}`}
          >
            IBA College of Mindanao
          </span>
          <span
            className={`font-medium tracking-wide ${
              textColor === 'light' ? 'text-amber-300' : 'text-amber-700'
            } ${textSubtitleSize[size]}`}
          >
            Valencia City, Bukidnon • Founded 2004
          </span>
        </div>
      )}
    </div>
  );
};
