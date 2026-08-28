import type { Build } from '@/types/galazar';

export function cloneBuild(build: Build): Build {
  return structuredClone(build);
}

export function upsertSavedBuild(builds: Build[], build: Build): Build[] {
  const savedCopy = cloneBuild(build);
  return [savedCopy, ...builds.filter((candidate) => candidate.id !== build.id)];
}

export function loadSavedBuild(build: Build): Build {
  return cloneBuild(build);
}

export function requiresSavedBuildLoadConfirmation(hasUnpreservedActiveBuild: boolean): boolean {
  return hasUnpreservedActiveBuild;
}

export function deleteSavedBuild(builds: Build[], buildId: string): Build[] {
  return builds.filter((build) => build.id !== buildId);
}

export function searchSavedBuilds(builds: Build[], query: string): Build[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return builds;

  return builds.filter((build) =>
    [build.name, build.prompt].some((field) =>
      field.toLocaleLowerCase().includes(normalizedQuery)
    )
  );
}

export function renameSavedBuild(
  builds: Build[],
  buildId: string,
  name: string,
  updatedAt: string
): Build[] {
  const nextName = name.trim();
  if (!nextName) return builds;

  return builds.map((build) =>
    build.id === buildId ? { ...build, name: nextName, updatedAt } : build
  );
}
