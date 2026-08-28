import type { Project } from '@/types/galazar';

export function createProject(name: string, id: string, timestamp: string): Project {
  return { id, name: name.trim(), description: '', createdAt: timestamp, updatedAt: timestamp, buildIds: [] };
}

export function renameProject(projects: Project[], projectId: string, name: string, timestamp: string): Project[] {
  const nextName = name.trim();
  if (!nextName) return projects;
  return projects.map((project) => project.id === projectId ? { ...project, name: nextName, updatedAt: timestamp } : project);
}

export function deleteProject(projects: Project[], projectId: string): Project[] {
  return projects.filter((project) => project.id !== projectId);
}

export function assignBuildToProject(projects: Project[], buildId: string, targetProjectId: string, timestamp: string): Project[] {
  return projects.map((project) => {
    const withoutBuild = project.buildIds.filter((id) => id !== buildId);
    const buildIds = project.id === targetProjectId ? [...withoutBuild, buildId] : withoutBuild;
    if (buildIds.length === project.buildIds.length && buildIds.every((id, index) => id === project.buildIds[index])) return project;
    return { ...project, buildIds, updatedAt: timestamp };
  });
}

export function removeBuildFromProject(projects: Project[], projectId: string, buildId: string, timestamp: string): Project[] {
  return projects.map((project) => project.id === projectId && project.buildIds.includes(buildId)
    ? { ...project, buildIds: project.buildIds.filter((id) => id !== buildId), updatedAt: timestamp }
    : project);
}

export function removeBuildFromAllProjects(projects: Project[], buildId: string): Project[] {
  return projects.map((project) => project.buildIds.includes(buildId)
    ? { ...project, buildIds: project.buildIds.filter((id) => id !== buildId) }
    : project);
}

export function filterProjects(projects: Project[], query: string): Project[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return projects;
  return projects.filter((project) => `${project.name} ${project.description}`.toLocaleLowerCase().includes(normalized));
}
