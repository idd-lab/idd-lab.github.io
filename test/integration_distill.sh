#!/usr/bin/env bash
set -euo pipefail

tmp_dir="$(mktemp -d)"
tmp_override="${tmp_dir}/distill-override.yml"
tmp_site="${tmp_dir}/site"

cleanup() {
  rm -rf "${tmp_dir}"
}
trap cleanup EXIT

cat >"${tmp_override}" <<'YAML'
giscus:
  repo: alshedivat/al-folio
  repo_id: R_kgDOExample
  category: Comments
  category_id: DIC_kwDOExample
YAML

bundle exec jekyll build --config "_config.yml,${tmp_override}" -d "${tmp_site}" >/dev/null

distill_page="${tmp_site}/blog/2021/distill/index.html"

if [ ! -f "${distill_page}" ]; then
  echo "distill page was not generated at ${distill_page}" >&2
  exit 1
fi

grep -q 'd-front-matter' "${distill_page}"
grep -q '/assets/js/distillpub/template.v2.js' "${distill_page}"
grep -q '/assets/js/distillpub/transforms.v2.js' "${distill_page}"
grep -q '/assets/js/distillpub/overrides.js' "${distill_page}"
grep -q '/assets/al_charts/js/mermaid-setup.js' "${distill_page}"
grep -q '/assets/al_math/js/tikzjax.min.js' "${distill_page}"
grep -q 'id="giscus_thread"' "${distill_page}"
transforms_runtime="${tmp_site}/assets/js/distillpub/transforms.v2.js"
if [ ! -f "${transforms_runtime}" ]; then
  distill_runtime="$(PATH="$HOME/.rbenv/shims:$PATH" bundle exec ruby -e 'spec = Gem.loaded_specs["al_folio_distill"]; puts(spec ? File.join(spec.full_gem_path, "assets/js/distillpub/transforms.v2.js") : "")')"
  core_runtime="$(PATH="$HOME/.rbenv/shims:$PATH" bundle exec ruby -e 'spec = Gem.loaded_specs["al_folio_core"]; puts(spec ? File.join(spec.full_gem_path, "assets/js/distillpub/transforms.v2.js") : "")')"
  if [ -f "${distill_runtime}" ]; then
    transforms_runtime="${distill_runtime}"
  elif [ -f "${core_runtime}" ]; then
    transforms_runtime="${core_runtime}"
  else
    echo "distill transforms runtime missing at ${transforms_runtime} (and not found in installed distill/core gems)" >&2
    exit 1
  fi
fi

if grep -q 'https://distill.pub/template.v2.js' "${transforms_runtime}"; then
  echo "remote Distill template loader should not be referenced in transforms runtime" >&2
  exit 1
fi

echo "distill integration checks passed"
