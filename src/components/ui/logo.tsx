import { Image } from "@/components/ui/image";

// Mesmo arquivo de protrack-web/public/logo.svg.
const LOGO = require("@/assets/images/logo.svg");

type LogoProps = {
  width?: number;
};

export function Logo({ width = 70 }: LogoProps) {
  return (
    <Image
      source={LOGO}
      contentFit="contain"
      style={{ width, height: (width * 48) / 105 }}
      accessibilityLabel="ProTrack"
    />
  );
}
