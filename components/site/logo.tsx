import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className }: LogoProps) {
  return (
    <Image
      src="/mario-charts-logo.svg"
      alt="Mario Charts"
      width={size}
      height={size}
      className={className}
    />
  );
}