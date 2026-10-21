#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "Node.js est requis. Installation via Homebrew..."
    brew install node
  else
    echo "Node.js est requis. Installez-le depuis https://nodejs.org puis relancez ce fichier."
    read -n 1 -s -r -p "Appuyez sur une touche pour fermer..."
    exit 1
  fi
fi
node installer/install.js "$@"
echo
read -n 1 -s -r -p "Appuyez sur une touche pour fermer..."
