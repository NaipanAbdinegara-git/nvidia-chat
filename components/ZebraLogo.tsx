// Simple round Zebra AI logo — clean, mobile-friendly, and readable

interface ZebraLogoProps {
  size?: number;
  className?: string;
}

function ZMark() {
  return (
    <path
      d="M10 11H30V15.2L18.1 25.1H30V29H10V24.8L21.9 14.9H10V11Z"
      fill="white"
    />
  );
}

export function ZebraLogo({ size = 32, className = "" }: ZebraLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="20" fill="#111111" />
      <ZMark />
    </svg>
  );
}

export function ZebraAvatarIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="20" fill="#111111" />
      <path
        d="M10 11H30V15.2L18.1 25.1H30V29H10V24.8L21.9 14.9H10V11Z"
        fill="white"
      />
    </svg>
  );
}

export function ZebraBadge({ size = 24 }: { size?: number }) {
  return <ZebraLogo size={size} />;
}
