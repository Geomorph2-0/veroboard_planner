#!/usr/bin/env bash
# Tracking-file audit: every git tag must have a matching `### vX.Y.Z` heading in
# docs/features.md, and no shipped version may sit under `## Planned`.
# Exits non-zero (blocking a commit/tag via the PreToolUse hook) when out of sync.
# Structure check only — bullet accuracy is the author's responsibility.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
FEATURES="docs/features.md"

if [[ ! -f "$FEATURES" ]]; then
  echo "audit-tracking: $FEATURES not found" >&2
  exit 1
fi

tags="$(git tag --sort=-v:refname)"
[[ -z "$tags" ]] && exit 0  # no tags yet — nothing to audit

headings="$(grep -oE '^### v[0-9]+\.[0-9]+\.[0-9]+' "$FEATURES" | sed 's/^### //' || true)"

# 1. Every tag has a heading somewhere in the file.
missing=""
while IFS= read -r tag; do
  [[ -z "$tag" ]] && continue
  grep -qxF "$tag" <<<"$headings" || missing+="  $tag"$'\n'
done <<<"$tags"

# 2. No version heading appears under the `## Planned` section.
planned_versions=""
if grep -qE '^## Planned' "$FEATURES"; then
  planned_versions="$(awk '/^## Planned/{p=1} p && /^### v[0-9]+\.[0-9]+\.[0-9]+/{print}' "$FEATURES" || true)"
fi

if [[ -n "$missing" || -n "$planned_versions" ]]; then
  echo "✗ docs/features.md is out of sync with git tags:" >&2
  [[ -n "$missing" ]] && { echo "  Tags missing a '### vX.Y.Z' heading:" >&2; echo "$missing" >&2; }
  [[ -n "$planned_versions" ]] && { echo "  Shipped version(s) misfiled under '## Planned':" >&2; echo "$planned_versions" >&2; }
  echo "  Fix docs/features.md before committing/tagging (see CLAUDE.md → Tracking file audit)." >&2
  exit 1
fi

echo "✓ docs/features.md: all $(wc -l <<<"$tags") tags documented, none misfiled."
