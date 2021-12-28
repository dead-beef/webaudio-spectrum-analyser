# Webaudio Spectrum Analyser

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

![Master](https://github.com/dead-beef/webaudio-spectrum-analyser/workflows/Master/badge.svg) ![PR validation](https://github.com/dead-beef/webaudio-spectrum-analyser/workflows/PR%20validation/badge.svg)

## Requirements

In order to run own copy of the project one must fulfill the following requirements.

### Mandatory

- [Node.js](https://nodejs.org/)
- [NPM](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [Emscripten](https://emscripten.org/)
- [Git](https://git-scm.com/)

### Optional

#### Android

- [Android SDK](https://developer.android.com/studio#command-tools)

#### Tools

- [GCC](https://gcc.gnu.org/)
- [Make](https://www.gnu.org/software/make/)
- [libavcodec](https://www.ffmpeg.org/libavcodec.html), [libavformat](https://www.ffmpeg.org/libavformat.html), [libavfilter](https://www.ffmpeg.org/libavfilter.html), [libavutil](https://www.ffmpeg.org/libavutil.html)
- [pthreads](https://en.wikipedia.org/wiki/POSIX_Threads)

### Preferred package manager

- [Yarn](https://www.npmjs.com/package/yarn) is a preferred package manager for dependencies installation in the project root.
- [npm](https://www.npmjs.com/) is a preferred package manager for dependencies installation in the `functions` folder if any.

### Package scripts reference

The project has lots of package scripts, check it in the `package.json` located in the project root, or use the following command (see terminal output for usage tips)

```
yarn workspace:help
```

### Committing changes to repo

Using commitizen cli is mandatory, [reference](https://github.com/commitizen/cz-cli).

Provided all dependencies are installed, and this requirements are fulfilled [cz-cli#conventional-commit-messages-as-a-global-utility](https://github.com/commitizen/cz-cli#conventional-commit-messages-as-a-global-utility) the following command must be used when doing a commit

```bash
git cz
```

## Installation

```bash
yarn install
```

### Updating

```bash
yarn workspace:update:check
```

```bash
yarn workspace:update:migrate
```

## Building

### Web

```bash
ng build
```

```bash
ng build --prod
```

### Android

```bash
cat >tools/shell/vars.sh <<EOF
export JAVA_HOME=[PATH_TO_JAVA]
export ANDROID_HOME=[PATH_TO_ANDROID_SDK]
export ANDROID_BUILD_TOOLS=[PATH_TO_ANDROID_BUILD_TOOLS]

ANDROID_KEYSTORE=[PATH_TO_KEYSTORE]
ANDROID_KEYSTORE_ALIAS=[KEY_ALIAS]
ANDROID_KEYSTORE_PASSWORD=[KEYSTORE_PASSWORD]
EOF

./tools/shell/build-android

adb install -r android/build/release-signed.apk
```

### Tools

First of all init submodules if you haven't yet

```bash
git submodule update --init --recursive
```

TODO: update instruction on working with submodules

```bash
make -C tools/audio
```

## Testing

### Unit

```bash
yarn test
yarn test:coverage
```

```bash
yarn e2e
```

## Server

```bash
yarn start
```

## Linting

This will check ts sources, html templates, and scss stylesheets.

```bash
yarn lint
yarn lint:fix
```

### Only TS

```bash
yarn nx:lint
yarn nx:lint:fix
```

### Only HTML

```bash
yarn prettier:all:html
yarn prettier:all:html:fix
```

### Only SCSS

```bash
yarn stylelint:all
yarn stylelint:all:fix
```

## Analyze bundle

Webpack bundle analyzer is used for application bundles analysis.

```bash
yarn analyze:webaudio-spectrum-analyser
```

## General Tooling

This project was generated using [Nx](https://nx.dev).

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/nx-logo.png" width="450"></p>

🔎 **Nx is a set of Angular CLI power-ups for modern development.**

### Quick Start & Documentation

- [Nx Documentation](https://nx.dev)
- [30-minute video showing all Nx features](https://nx.dev/getting-started/what-is-nx)
- [Interactive Tutorial](https://nx.dev/tutorial/01-create-application)

### Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, .etc as well as the devtools to test, and build projects as well.

Below are some plugins which you can add to your workspace:

| Application type                       | Command                  |
| -------------------------------------- | ------------------------ |
| [Angular](https://angular.io)          | `ng add @nrwl/angular`   |
| [React](https://reactjs.org)           | `ng add @nrwl/react`     |
| Web (no framework frontends)           | `ng add @nrwl/web`       |
| [Nest](https://nestjs.com)             | `ng add @nrwl/nest`      |
| [Express](https://expressjs.com)       | `ng add @nrwl/express`   |
| [Node](https://nodejs.org)             | `ng add @nrwl/node`      |
| [Storybook](https://storybook.js.org/) | `ng add @nrwl/storybook` |

### Generating an application

To generate an application run:

```bash
ng g @nrwl/angular:app my-app
```

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

### Generating a library

To generate a library run:

```bash
ng g @nrwl/angular:lib my-lib
```

> You can also use any of the plugins above to generate libraries as well.

Libraries are sharable across libraries and applications.

It can be imported from `@nx-ng-starter/mylib`.

### Running a development server

To start a dev server run:

```bash
ng serve my-app
```

Navigate to http://localhost:4200/.

The app will automatically reload if you change any of the source files.

### Code scaffolding

To generate a new component run:

```bash
ng g component my-component --project=my-app
```

### Building applications

To build the project run:

```bash
ng build my-app
```

The build artifacts will be stored in the `dist/` directory.

Use the `--prod` flag for a production build.

### Unit testing with [Jest](https://jestjs.io)

To execute the unit tests run:

```bash
ng test my-app
```

To execute the unit tests affected by a change run:

```bash
npm run affected:test
```

### End-to-end testing with [Cypress](https://www.cypress.io)

To execute the end-to-end tests run:

```bash
ng e2e my-app
```

To execute the end-to-end tests affected by a change run:

```bash
npm run affected:e2e
```

### Understanding your workspace

To see a diagram of the dependencies of your projects run:

```bash
npm run dep-graph
```

### Generating a storybook for a feature or ui library

```bash
npx nx g @nrwl/angular:storybook-configuration project-name
```

### Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.

## Licenses

- [`webaudio-spectrum-analyser`](LICENSE)
