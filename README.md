# Webaudio Spectrum Analyser

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Overview

## Requirements

- [Node.js](https://nodejs.org/)
- [NPM](https://nodejs.org/)
- **[Yarn](https://yarnpkg.com/)** `Is preferred package manager for dependencies installation in the project root`
- [Git](https://git-scm.com/)

### Optional

- [Android SDK](https://developer.android.com/studio#command-tools)

#### Committing changes to repo

Using commitizen cli is mandatory, [reference](https://github.com/commitizen/cz-cli).

Provided all dependencies are installed, and this requirements are fulfilled [cz-cli#conventional-commit-messages-as-a-global-utility](https://github.com/commitizen/cz-cli#conventional-commit-messages-as-a-global-utility) the following command must be used when doing a commit

```bash
git cz
```

## Installation

### Install all: system, global, and project

```bash
yarn install:all
```

### Install system

#### Local

```bash
yarn install:shellcheck
```

#### CI

```bash
yarn install:shellcheck:ci
```

## Global dependencies installation

```bash
yarn install:global
```

### Project dependencies

```bash
yarn install
```

## Fixed dependencies

The following dependencies should not be updated by now, this specific versions should be fixed

| Name         | Version | Note regarding newer versions (but it may be outdated, and should be confirmed over time) |
| ------------ | ------- | ----------------------------------------------------------------------------------------- |
| eslint       | 6.8.0   | incompatible with NX                                                                      |
| eslint-watch | 6.0.1   | incompatible with NX                                                                      |
| typescript   | 3.8.3   | currently installed is the latest version @angular/cli supports                           |

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

## Licenses

- [`webaudio-spectrum-analyser`](LICENSE)
