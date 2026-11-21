import { cn } from "@/lib/utils";

const COLORS = [
  "bg-primary text-primary-foreground",
  "bg-emerald-500 text-white",
  "bg-orange-500 text-white",
  "bg-violet-500 text-white",
  "bg-rose-500 text-white",
  "bg-sky-500 text-white",
];

function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

export function Avatar({
  name,
  src,
  size = 96,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full shrink-0 flex items-center justify-center font-semibold",
        !src && hashColor(name),
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </div>
  );
}