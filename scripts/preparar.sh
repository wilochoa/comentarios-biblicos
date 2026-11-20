#!/bin/sh
# Crea una carpeta por herramienta (al lado de este repo, en ../traductores/),
# cada una con su propia copia del repo y su traductor asignado. Una sola vez.
#
#   scripts/preparar.sh                    # codex opencode cursor claude gemini
#   scripts/preparar.sh codex gemini       # solo esas
#
# Después: abre cada herramienta en su carpeta y dile «traduce 15».
set -eu
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(git -C "$RAIZ" remote get-url origin)"
DESTINO="${DESTINO:-$(dirname "$RAIZ")/traductores}"
[ $# -eq 0 ] && set -- codex opencode cursor claude gemini
mkdir -p "$DESTINO"
for quien in "$@"; do
  case "$quien" in
    claude) modelo="Claude" ;; codex) modelo="Codex" ;; gemini) modelo="Gemini" ;;
    cursor) modelo="Cursor" ;; opencode) modelo="OpenCode" ;; *) modelo="$quien" ;;
  esac
  carpeta="$DESTINO/$quien"
  if [ -d "$carpeta/.git" ]; then git -C "$carpeta" pull -q --ff-only; else git clone -q "$REPO" "$carpeta"; fi
  (cd "$carpeta" && node scripts/soy.mjs "$quien" "$modelo")
  echo "   $carpeta"
done
echo
echo "Listo. Abre cada herramienta en su carpeta y dile: traduce 15"
