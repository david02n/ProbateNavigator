import React from "react";

interface SwiftLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export const SwiftLogo: React.FC<SwiftLogoProps> = ({ 
  className = "", 
  size = 40,
  color = "#002B49" // Dark blue color from the logo
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M443 180c-36.4 21.6-75.3 54.1-117.4 77.8-35.1 19.8-72.6 31.7-110.6 43.2-15.6 4.7-31.3 9.3-45.9 16.7-5.4 2.7-10.6 5.8-14.6 10.2-6 6.7-8 15.8-5.4 24.4 3.1 10.3 11.6 17.4 21.2 21.7 16.4 7.2 35 7.7 52.5 7.8 36.3.2 72.5-3.9 108.4-9.4 41.1-6.3 81.7-15.6 121.8-26.9 7.2-2 14.4-4.2 20.2-9 4.2-3.5 7.3-8.3 8.2-13.7 1.3-7.7-2.2-15.1-6.5-21.1-12.2-17-31.9-26.1-51.1-32.6-45.8-15.5-95.8-17.1-142.3-4.9-47.7 12.7-90.1 41.5-124 77.8-16.7 17.9-31.5 37.8-41.8 60-5.1 10.9-9.1 22.3-10.8 34.2-1.7 12-1 24.7 3.5 36 6.7 17 20.6 29.7 36.6 37.8 20 10.1 42.7 13.8 64.9 14.9 49.5 2.4 98.9-5.9 147.1-16.9 54.3-12.3 108.3-27.9 158.7-51.9 25.2-12 49.3-26.6 69.1-45.8 10-9.7 19-20.7 24.1-33.9 5.2-13.2 5.9-28.7-1.2-41.1-10.8-18.8-35.1-24-54.5-16.5-10.9 4.3-20.2 12.1-28.4 20.4-28.9 29.4-48.1 68.4-52.3 109.2-2.1 19.8-.6 40.3 7.2 58.7 7.3 17.2 19.9 31.5 35.9 40.8"
        fill={color}
      />
    </svg>
  );
};

// Also create a text+logo component for use in the header
export const SwiftLogoWithText: React.FC<SwiftLogoProps> = ({
  className = "",
  size = 40,
  color = "#002B49"
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <SwiftLogo size={size} color={color} />
      <span className="ml-2 font-semibold text-lg" style={{ color }}>
        ProbateSwift
      </span>
    </div>
  );
};