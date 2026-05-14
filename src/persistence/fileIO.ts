import { ProjectFile } from "../model/types";
import { deserializeProject, serializeProject } from "./projectSerializer";

function sanitizeFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function saveProjectToFile(project: ProjectFile): void {
  const fileContents = serializeProject(project);
  const blob = new Blob([fileContents], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  const safeName = sanitizeFileName(project.name) || "veroboard-project";
  anchor.href = url;
  anchor.download = `${safeName}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export async function loadProjectFromFile(file: File): Promise<ProjectFile> {
  const contents = await file.text();
  return deserializeProject(contents);
}
