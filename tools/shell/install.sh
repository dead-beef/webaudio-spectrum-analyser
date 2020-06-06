#!/bin/bash

##
# Colors.
##
source tools/shell/colors.sh ''

##
# Exits with error.
##
exitWithError() {
  exit 1
}

##
# Reports usage error and exits.
##
reportUsage() {
  local TITLE="<< USAGE >>"
  printf "
    ${LIGHT_BLUE}%s\n
    ${DEFAULT} - ${YELLOW} bash tools/shell/install.sh${DEFAULT} (print install.sh usage)
    ${DEFAULT} - ${YELLOW} bash tools/shell/install.sh local${DEFAULT} (install project dependencies only)
    ${DEFAULT} - ${YELLOW} bash tools/shell/install.sh global${DEFAULT} (install global dependencies only)
    ${DEFAULT} - ${YELLOW} bash tools/shell/install.sh all${DEFAULT} (install projects dependencies, global dependencies, brew (linux), protolint (linux), shellcheck (linux))
    ${DEFAULT} - ${YELLOW} bash tools/shell/install.sh all linux ci${DEFAULT} (install projects dependencies, global dependencies, brew (linux), protolint (linux), shellcheck (linux) in ci environment)
    ${DEFAULT} - ${YELLOW} bash tools/shell/install.sh proto${DEFAULT} (install protobuf dependencies on linux)
    ${DEFAULT} - ${YELLOW} bash tools/shell/install.sh proto linux ci${DEFAULT} (install protobuf dependencies on linux in ci environment)
    ${DEFAULT} - ${YELLOW} bash tools/shell/install.sh shellcheck${DEFAULT} (install shellcheck on linux)
    ${DEFAULT} - ${YELLOW} bash tools/shell/install.sh shellcheck linux ci${DEFAULT} (install shellcheck on linux in ci environment)
    ${DEFAULT}\n\n" "$TITLE"
}

##
# Installs dependencies in project root folder as well as in /functions if no arguments are provided.
# Installs global dependencies with sudo if first argument equals 'global'.
##

##
# Installs project dependencies,
##
installProjectDependencies() {
  local TITLE="<< INSTALLING PROJECT DEPENDENCIES >>"
  printf "
    ${LIGHT_BLUE}%s
    ${DEFAULT}\n\n" "$TITLE"
  yarn install || exitWithError
}

##
# Installs global npm dependencies.
##
installGlobalDependencies() {
  local TITLE="<< INSTALLING GLOBAL DEPENDENCIES >>"
  printf "
    ${LIGHT_BLUE}%s
    ${DEFAULT}\n\n" "$TITLE"
  sudo npm install -g @angular/cli@latest @nestjs/cli@latest @nrwl/schematics@latest typescript@latest firebase-tools@latest @compodoc/compodoc@latest commitizen@latest cz-conventional-changelog@latest clang-format@latest yarn@latest || exitWithError
}

##
# Installs brew on Linux.
##
installBrewAndProtobufLinux() {
  local TITLE="<< INSTALLING BREW, PROTOLINT, PROTOBUF, PROTOC-GEN-GRPC-WEB on LINUX >>"
  printf "
    ${LIGHT_BLUE}%s
    ${DEFAULT}\n\n" "$TITLE"
  # install linux brew wrapper
  if [ "$1" = "ci" ]; then
    # don't use sudo in CI environment
    apt -y install linuxbrew-wrapper
  else
    sudo apt -y install linuxbrew-wrapper
  fi
  # pass ENTER to brew --help command so that it automatically proceeds with installation
  printf '\n' | brew --help
  # export variables for brew to work
  # shellcheck disable=SC2016
  {
    echo ''
    echo '# homebrew'
    echo 'export PATH="/home/linuxbrew/.linuxbrew/bin:$PATH"'
    echo 'export MANPATH="/home/linuxbrew/.linuxbrew/share/man:$MANPATH"'
    echo 'export INFOPATH="/home/linuxbrew/.linuxbrew/share/info:$INFOPATH"'
  } >>~/.bashrc
  # run doctor
  brew doctor
  # tap source code
  brew tap yoheimuta/protolint
  # install protolint
  brew install protolint
  # export variable for plex.vscode-protolint plugin to work
  # shellcheck disable=SC2016
  {
    echo ''
    echo '# protolint'
    echo 'export PATH="/home/linuxbrew/.linuxbrew/Cellar/protolint/0.23.1/bin:$PATH"'
  } >>~/.bashrc
  if [ "$1" = "ci" ]; then
    local TITLE="PASSING PROTOBUF, PROTOC-GEN-GRPC-WEB INSTALLATION"
    printf "
    ${LIGHT_BLUE}%s
    ${DEFAULT}" "$TITLE"
  else
    # install protobuf and protoc-gen-grpc-web only in local environment
    brew install protobuf
    brew install protoc-gen-grpc-web --ignore-dependencies
  fi
}

##
# Installs Shellcheck on Linux.
##
installShellcheckLinux() {
  local TITLE="<< INSTALLING SHELLCHECK on LINUX >>"
  printf "
    ${LIGHT_BLUE}%s
    ${DEFAULT}\n\n" "$TITLE"
  if [ "$1" = "ci" ]; then
    # don't use sudo in CI environment
    apt -y install shellcheck
  else
    sudo apt -y install shellcheck
  fi
}

##
# Dependencies installation control flow.
##
if [ $# -lt 1 ]; then
  reportUsage
elif [ "$1" = "all" ]; then
  installProjectDependencies
  installGlobalDependencies
  installBrewAndProtobufLinux "$2"
  installShellcheckLinux "$2"
elif [ "$1" = "local" ]; then
  installProjectDependencies
elif [ "$1" = "global" ]; then
  installGlobalDependencies
elif [ "$1" = "proto" ]; then
  installBrewAndProtobufLinux "$2"
elif [ "$1" = "shellcheck" ]; then
  installShellcheckLinux "$2"
else
  reportUsage
fi
