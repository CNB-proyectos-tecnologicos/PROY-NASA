#!/usr/bin/env bash
# Crea el entorno la primera vez y arranca el servidor. Argumentos extra pasan a servidor.py (p. ej. --tcp 9100).
set -e
cd "$(dirname "$0")"
if [ ! -d .venv ]; then
  python3 -m venv .venv
  .venv/bin/pip install --upgrade pip >/dev/null
  .venv/bin/pip install -r requirements.txt
fi
exec .venv/bin/python servidor.py "$@"
