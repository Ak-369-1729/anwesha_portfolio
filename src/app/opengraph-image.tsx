import { site } from "@/data/site";
import { ogSize, renderOg } from "@/lib/og";

export const alt = `${site.name} — AI, Systems, Security & Infrastructure`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    kicker: "AI • SYSTEMS • SECURITY • INFRASTRUCTURE",
    title: site.name,
    subtitle: site.thesis,
  });
}
