# inox-example

Minimal TypeScript project used to exercise the package that Inox will publish
to the npm registry.

## Current integration status

`@inox-cc/inox` is installed from `../inox/dist/npm/packages/inox`. Its native
compiler is installed from the sibling `inox-darwin-arm64` package through a
pnpm override. Both directories contain exactly the files intended for the npm
registry; no TypeScript compiler sources are executed from `node_modules`.

MongoDB remains declared as a private GitHub dependency until its first public
release. For local integration tests, the pnpm override resolves that dependency
from the sibling `../mongodb` folder, so unpublished compiler metadata and native
sources can be exercised together. `build:simple` checks the base compiler package;
the default build checks external package discovery and native integration.

## Requirements

- Node.js 24 or newer and pnpm 11.21;
- Git, CMake and a C++20 compiler;
- the sibling `../mongodb` checkout for the local package override.

## Install

Build the native compiler and generate the npm staging directories first:

```bash
cd ../inox
pnpm build
cd ../inox-example
pnpm run package:inox
```

Then install the example dependencies:

```bash
pnpm install
```

After changing Inox, rebuild it, regenerate both staging packages and refresh
the local file dependency. `--force` is intentional because the package
version may not change between test builds:

```bash
cd ../inox
pnpm build
cd ../inox-example
pnpm run package:inox
pnpm install --force
```

The generated layout is:

```text
../inox/dist/npm/packages/inox/                 # common toolchain and launcher
../inox/dist/npm/packages/inox-darwin-arm64/    # native compiler for this host
../mongodb/                                     # local external package
```

The common manifest keeps an exact optional dependency on the platform package,
just like the public npm release. The override only replaces that exact npm
version with the local folder during development.

The lockfile records the local MongoDB folder while the override is active. Remove
the `mongodb` override to test the exact private Git commit from `master` instead.

The Git repository declares itself as `@inox-cc/mongodb`, but the dependency
key is deliberately `mongodb`: this makes the TypeScript import resolve under
the same name as the Inox library. After publication, that entry becomes the
npm alias `"mongodb": "npm:@inox-cc/mongodb@^1"`.

## Local package binary

Package scripts automatically use `node_modules/.bin/inox`:

```bash
pnpm run build:simple
pnpm build
pnpm start
pnpm run start:debug
pnpm run lint
pnpm run typecheck
```

`build:simple` checks the compiler package. The default `build` is the complete
smoke test for discovery and native integration of `@inox-cc/mongodb`.

The equivalent explicit command is:

```bash
pnpm exec inox build src/index.ts --name inox-example
```

## One-off staging execution

The `build:npx` script asks `npx` to install both local staging folders into its
temporary environment. Offline mode prevents npm from looking for the private
test version in the public registry:

```bash
pnpm run build:npx
```

After the npm release, the shorter equivalent will be:

```bash
npx --yes --package=@inox-cc/inox -- inox build src/simple.ts --name inox-example-simple
```

## Global installation

For testing the global CLI from the two local staging folders, make npm install
folder contents instead of symlinking them:

```bash
npm install --global --install-links \
  ../inox/dist/npm/packages/inox \
  ../inox/dist/npm/packages/inox-darwin-arm64
inox build src/simple.ts --name inox-example-simple
```

After the npm release:

```bash
npm install --global @inox-cc/inox
inox build src/simple.ts --name inox-example-simple
```
