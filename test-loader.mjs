import { existsSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  const base = specifier.startsWith('@/')
    ? resolvePath(process.cwd(), 'src', specifier.slice(2))
    : specifier.startsWith('.') && context.parentURL?.startsWith('file:')
      ? resolvePath(fileURLToPath(new URL('.', context.parentURL)), specifier)
      : null;
  if (!base) return nextResolve(specifier, context);
  const resolved = [base, `${base}.ts`, `${base}.tsx`].find(existsSync);
  if (!resolved) return nextResolve(specifier, context);

  return { shortCircuit: true, url: pathToFileURL(resolved).href };
}
