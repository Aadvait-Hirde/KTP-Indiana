type DefinitionGetter = (sdkKey: string) => unknown;

// Shim for environments where @vercel/flags-definitions isn't installed.
// flags-core treats missing entries as a non-fatal fallback path.
export const get: DefinitionGetter = () => undefined;
