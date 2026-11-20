#!/bin/sh
# Corrida diaria sin intervención: traduce N tramos con tu plan de Claude.
#
#   scripts/diario.sh                    # 5 tramos (según la preferencia de la carpeta)
#   scripts/diario.sh 10                 # 10 tramos
#   scripts/diario.sh 10 matthew-henry   # 10 tramos de Henry
#
# Para programarla en tu Mac (todos los días a las 6:00), agrega con `crontab -e`:
#   0 6 * * * /ruta/a/comentarios-biblicos/scripts/diario.sh 5
# La Mac debe estar encendida y con sesión iniciada en Claude Code (`claude` ya autenticado).
set -eu
cd "$(dirname "$0")/.."
mkdir -p logs
N="${1:-5}"
DE="${2:+ de $2}"
{
  echo "=== $(date '+%Y-%m-%d %H:%M') · $N tramos$DE ==="
  claude -p "Usa la skill traducir para traducir $N tramos$DE." --permission-mode acceptEdits
  echo
} >> logs/diario.log 2>&1
