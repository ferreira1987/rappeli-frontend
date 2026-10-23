#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/var/www/rappeli-frontend}"
RELEASES_DIR="${DEPLOY_ROOT}/releases"
CURRENT_LINK="${DEPLOY_ROOT}/current"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

if [[ ! -d dist ]]; then
  echo "dist/ not found. Run npm ci && npm run build first." >&2
  exit 1
fi

SHA="${GITHUB_SHA:-local}"
SHORT_SHA="$(echo "${SHA}" | head -c 7)"
STAMP="$(date -u +%Y%m%d%H%M%S)"
RELEASE_DIR="${RELEASES_DIR}/${STAMP}-${SHORT_SHA}"

mkdir -p "${RELEASES_DIR}"
mkdir -p "${RELEASE_DIR}"
rsync -a --delete dist/ "${RELEASE_DIR}/"
ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"

if [[ "${KEEP_RELEASES}" =~ ^[0-9]+$ ]] && (( KEEP_RELEASES > 0 )); then
  mapfile -t OLD_RELEASES < <(ls -1dt "${RELEASES_DIR}"/* 2>/dev/null | tail -n +"$((KEEP_RELEASES + 1))" || true)
  for old in "${OLD_RELEASES[@]:-}"; do
    [[ -d "${old}" ]] && rm -rf "${old}"
  done
fi

echo "Deployed ${RELEASE_DIR} -> ${CURRENT_LINK}"
