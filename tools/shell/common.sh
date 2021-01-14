set -uo pipefail


DEFAULT='\033[0m'

BLACK='\033[0;30m'
DARK_GRAY='\033[1;30m'
RED='\033[0;31m'
LIGHT_RED='\033[1;31m'
GREEN='\033[0;32m'
LIGHT_GREEN='\033[1;32m'
BROWN='\033[0;33m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
LIGHT_BLUE='\033[1;34m'
PURPLE='\033[0;35m'
LIGHT_PURPLE='\033[1;35m'
CYAN='\033[0;36m'
LIGHT_CYAN='\033[1;36m'
LIGHT_GRAY='\033[0;37m'
WHITE='\033[1;37m'

BLACK_BG='\033[0;40m'
RED_BG='\033[0;41m'
GREEN_BG='\033[0;42m'
BROWN_BG='\033[0;43m'
BLUE_BG='\033[0;44m'
PURPLE_BG='\033[0;45m'
CYAN_BG='\033[0;46m'
LIGHT_GRAY_BG='\033[0;47m'

COLOR_NAMES=(
  DEFAULT

  BLACK      DARK_GRAY
  RED        LIGHT_RED
  GREEN      LIGHT_GREEN
  BROWN      YELLOW
  BLUE       LIGHT_BLUE
  PURPLE     LIGHT_PURPLE
  CYAN       LIGHT_CYAN
  LIGHT_GRAY WHITE

  BLACK_BG
  RED_BG
  GREEN_BG
  BROWN_BG
  BLUE_BG
  PURPLE_BG
  CYAN_BG
  LIGHT_GRAY_BG
)


USAGE="Usage: $0 [-h]\n"
CMD_COLOR="${PURPLE}"
LOG_COLOR="${LIGHT_BLUE}"
WARNING_COLOR="${YELLOW}"
ERROR_COLOR="${LIGHT_RED}"


colors() {
  for name in "${COLOR_NAMES[@]}"; do
    printf -- "- %s = ${!name}%s${DEFAULT}\n" "$name" "${!name}"
  done
}

printfc() {
  printf "$1" >&2
  shift
  printf "$@" >&2
  printf "${DEFAULT}\n" >&2
}

log() {
  printfc "${LOG_COLOR}" "$@"
}

warn() {
  printfc "${WARNING_COLOR}Warning: " "$@"
}

error() {
  printfc "${ERROR_COLOR}Error: " "$@"
  exit 1
}

usage() {
  printfc "${USAGE}" >&2
  exit 1
}

cmd() {
  printfc "${CMD_COLOR}>" " %s" "$@"
  "$@"
  local rc=$?
  if (( rc )); then
    error "%s " "process exited with status ${rc}:" "$@"
  fi
}
