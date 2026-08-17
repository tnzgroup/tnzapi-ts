import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
    {
        // demo/**: a separate self-contained app (own package.json, own
        // eslint.config.mjs, own dependency versions) nested inside this repo
        // for co-location, not part of the SDK — not linted by the SDK's config.
        ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'demo/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // Plain CommonJS config files (jest.config.js, jest.setup.js) — need Node
        // globals (require/module) that the base recommended config doesn't assume,
        // and `require()` is the normal, correct way to import in a CommonJS file.
        files: ['*.js', '**/*.config.js'],
        languageOptions: {
            globals: globals.node,
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['**/*.ts'],
        rules: {
            // Bare `: any` is used intentionally throughout the Model/DTO constructors
            // for the generic Map() mapping pattern (e.g. `constructor(data?: any)`) —
            // that's not what standardised typing rule bans, so don't flag it.
            '@typescript-eslint/no-explicit-any': 'off',

            // This codebase already prefixes intentionally-unused parameters/vars with
            // `_` (e.g. mock callback signatures that must match an interface). Respect
            // that convention instead of flagging it.
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

            // Project's Typing Rules: never use `as any` to silence a type error or
            // access a property on a union/unknown type — cast to the correct DTO/type
            // instead. Scoped precisely to the `as any` cast (TSAsExpression > TSAnyKeyword),
            // not bare `any`-typed parameters/returns.
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'TSAsExpression > TSAnyKeyword',
                    message: 'Avoid `as any` — cast to the correct DTO/type instead (see CLAUDE.md Typing Rules).',
                },
            ],

            // `interface Foo extends Bar {}` with no members of its own is normally
            // pointless (identical to `Bar`) — but for a public SDK, an interface
            // (unlike a `type` alias) can still be re-opened by consumers via
            // TypeScript declaration merging to add their own fields. Several of
            // this package's *CreateArgs interfaces are intentionally empty today
            // for exactly that reason, so allow the single-extends empty-interface
            // pattern instead of flagging it.
            '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
        },
    },
    {
        // samples/**: each file exposes several named functions as copy-paste
        // reference snippets (documentation, run via `npx ts-node`) — only a
        // couple are actually invoked at the bottom of each file by design, so
        // "unused function" isn't a real issue here the way it would be in src/.
        files: ['samples/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            // Pagination loop variables (e.g. `let totalPages = 1`) are initialized
            // for readability/declared-type clarity even though a do-while always
            // overwrites them before the initial value is read — not worth
            // restructuring example scripts to avoid.
            'no-useless-assignment': 'off',
        },
    },
    {
        // jest.isolateModules() only isolates for the duration of a synchronous
        // callback, so re-loading a module fresh inside it must use require() —
        // there's no ES import/dynamic import() equivalent that works within
        // that boundary. Same underlying reason *.js config files are exempt
        // above, just needed here from a .ts test helper instead.
        files: ['tests/unit/samples/isolateAndRequire.ts'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
);