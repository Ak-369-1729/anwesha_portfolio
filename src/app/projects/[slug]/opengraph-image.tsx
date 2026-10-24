import { categoryById } from "@/data/categories";
import { flagships, getProject } from "@/data/projects";
import { ogSize, renderOg } from "@/lib/og";

export const alt = "Case study";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return flagships.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  return renderOg({
    kicker: p ? `CASE STUDY · ${categoryById[p.category].label.toUpperCase()}` : "CASE STUDY",
    title: p?.title.split(" /")[0] ?? "Systems Lab",
    subtitle: p?.summary ?? "",
  });
}
