#!/usr/bin/env bash
#
# One-time setup: point git at the hooks checked into this repo.
#
#   bin/setup-hooks.sh
#
# This has to be done once per clone because `core.hooksPath` is a local
# config setting that git doesn't carry across clones.

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

git config core.hooksPath .githooks

echo "✓ git hooks enabled — core.hooksPath set to .githooks"
echo
echo "Active hooks:"
ls -1 .githooks | sed 's/^/  /'
echo
echo "To disable: git config --unset core.hooksPath"
