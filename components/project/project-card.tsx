import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Eye } from "lucide-react";
import {
  DEPARTMENT_LABEL,
  DEPARTMENT_COLOR,
  PROJECT_TYPE_LABEL,
  type ProjectDepartment,
} from "@/lib/innovations";
import { cn } from "@/lib/utils";

type ProjectCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  department: ProjectDepartment;
  projectType: string;
  authorName: string;
  _count: { likes: number; comments: number };
  viewCount: number;
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const typeLabel =
    PROJECT_TYPE_LABEL[project.department]?.[project.projectType] ??
    project.projectType;

  return (
    <Link
      href={`/innovation/${project.slug}`}
      className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition flex flex-col"
    >
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={cn(
              "h-full w-full flex items-center justify-center text-4xl font-bold",
              DEPARTMENT_COLOR[project.department]
            )}
          >
            {project.title[0]}
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-medium",
              DEPARTMENT_COLOR[project.department]
            )}
          >
            {DEPARTMENT_LABEL[project.department]}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit text-xs">
          {typeLabel}
        </Badge>
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        {project.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.excerpt}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{project.authorName}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {project._count.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> {project._count.comments}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {project.viewCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}