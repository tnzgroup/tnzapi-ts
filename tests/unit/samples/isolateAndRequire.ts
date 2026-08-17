// jest.isolateModules() only isolates for the duration of a synchronous
// callback, so re-loading modules fresh inside it must use require() —
// there is no ES import/dynamic import() equivalent that works within that
// synchronous boundary.
//
// All paths are require()'d inside the SAME isolateModules callback so they
// share one isolated module registry — e.g. so a script's own internal
// require() of a mocked dependency resolves to the exact same fresh
// instance the caller captured here, not a separately-isolated one.
//
// Results are returned positionally (aligned with modulePaths) rather than
// keyed by path string, so a caller destructures by position instead of
// re-typing a path — there's no second string for a typo to silently miss.
export function isolateAndRequire<T extends readonly string[]>(modulePaths: readonly [...T]): { [K in keyof T]: unknown } {
    const results: unknown[] = [];
    jest.isolateModules(() => {
        for (const modulePath of modulePaths) {
            results.push(require(modulePath));
        }
    });
    return results as { [K in keyof T]: unknown };
}