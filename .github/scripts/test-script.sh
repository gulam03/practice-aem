#!/bin/bash

# Colors.
RED=$'\E[1;31m'
GREEN=$'\E[1;32m'
BLUE=$'\E[1;34m'

# Message status.
COLOR_RESET=$'\E[0m'
MSG_ERROR="${RED}[ERROR]${COLOR_RESET}"
MSG_OK="${GREEN}[OK]${COLOR_RESET}"
MSG_INFO="${BLUE}[INFO]${COLOR_RESET}"

# Checks if a file exists. First argument is the file path.
function check_file_exists() {
  if [ -f "$1" ]; then
    echo "${MSG_OK} File '${1}' has been found."
  else
    echo "${MSG_ERROR} File '${1}' has not been found."
    exit 1
  fi
}

# Checks if a file was removed. First argument is the file path.
function check_file_removed() {
  if [ -f "$1" ]; then
    echo "${MSG_ERROR} File '${1}' has not been removed."
    exit 1
  else
    echo "${MSG_OK} File '${1}' has been removed."
  fi
}

# Checks if a folder exists. First argument is the folder path.
function check_folder_exists() {
  if [ -d "$1" ]; then
    echo "${MSG_OK} Folder '${1}' has been found."
  else
    echo "${MSG_ERROR} Folder '${1}' has not been found."
    exit 1
  fi
}

# Checks if a folder was removed. First argument is the folder path.
function check_folder_removed() {
  if [ -d "$1" ]; then
    echo "${MSG_ERROR} Folder '${1}' has not been removed."
    exit 1
  else
    echo "${MSG_OK} Folder '${1}' has been removed."
  fi
}

# Checks if a file was hydrated.
# First argument is the string to search for.
# Second argument is the path of the file to check.
check_file_hydrated() {
  if grep -q "${1}" "${2}" && ! $(grep -q "{{" "${2}"); then
    echo "${MSG_OK} ${2} has been successfully hydrated."
  else
    echo "${MSG_ERROR} ${2} has not been hydrated."
    exit 1
  fi
}

# Check if edison.yml doesnt speficy a framework.
FILE=edison.yml
check_file_exists ${FILE}
if grep -q "framework: false" "${FILE}"; then
  echo "${MSG_OK} '${FILE}' does not speficy a framework."
else
  echo "${MSG_ERROR} '${FILE}' is specifying a framework."
  exit 1
fi

check_file_removed composer.json
check_file_removed composer.lock
check_folder_removed vendor
check_folder_removed .github/scripts

# Check if README.md has been hydrated.
check_file_removed README.md.dist
check_file_exists README.md
check_file_hydrated "# Edison Adobe pfizer-skel-adobe" README.md

# Check if .pfizer.yml.dist has been renamed.
check_file_removed .pfizer.yml.dist
check_file_exists .pfizer.yml

# Check if Adobe helix files renamed.
check_file_removed fstab.yaml.dist
check_file_exists fstab.yaml
check_file_exists head.html
check_file_exists helix-sitemap.yaml
