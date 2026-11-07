#!/usr/bin/env bash
# Copia o template Coworking Space para um novo projeto.
# Uso: bash new_site.sh <pasta-destino> [nome-do-pacote]
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: bash new_site.sh <pasta-destino> [nome-do-pacote]" >&2
  exit 1
fi

DEST="$1"
NAME="${2:-$(basename "$DEST")}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$SKILL_DIR/assets/template"

if [ -e "$DEST" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ]; then
  echo "Erro: $DEST já existe e não está vazio." >&2
  exit 1
fi

mkdir -p "$DEST"
cp -r "$TEMPLATE"/. "$DEST"/

# Renomeia o pacote (nome npm: minúsculas, sem espaços)
SAFE_NAME="$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9-' '-' | sed 's/^-*//;s/-*$//')"
sed -i.bak "s/\"name\": \"site-creator-vinext-starter\"/\"name\": \"${SAFE_NAME:-meu-site}\"/" "$DEST/package.json"
rm -f "$DEST/package.json.bak"

echo "Projeto criado em $DEST (pacote: ${SAFE_NAME:-meu-site})"
echo "Próximos passos:"
echo "  cd $DEST && npm install"
echo "  Edite app/page.tsx (HERO_VIDEO, HEADLINES, textos), app/layout.tsx e app/globals.css"
echo "  npm run dev   |   npm run build"
