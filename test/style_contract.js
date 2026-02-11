const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');
const os = require('node:os');

const root = process.cwd();

const gemRootCache = {};
const gemRoot = (gemName, fallbackPrefix) => {
  if (Object.prototype.hasOwnProperty.call(gemRootCache, gemName)) {
    return gemRootCache[gemName];
  }

  const bundleCommands = [`bundle show ${gemName}`, `~/.rbenv/shims/bundle show ${gemName}`];
  for (const command of bundleCommands) {
    try {
      const resolved = childProcess.execSync(command, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], shell: '/bin/bash' }).toString().trim();
      if (resolved && fs.existsSync(resolved)) {
        gemRootCache[gemName] = resolved;
        return gemRootCache[gemName];
      }
    } catch (_error) {
      // Keep trying fallback commands.
    }
  }

  const fallbackGlob = path.join(os.homedir(), `.rbenv/versions/*/lib/ruby/gems/*/bundler/gems/${fallbackPrefix}-*`);
  try {
    gemRootCache[gemName] = childProcess
      .execSync(`ls -d ${fallbackGlob} 2>/dev/null | head -n 1`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], shell: '/bin/bash' })
      .toString()
      .trim();
  } catch (_error) {
    gemRootCache[gemName] = '';
  }

  return gemRootCache[gemName];
};

const resolveThemeFile = (rel) => {
  const localPath = path.join(root, rel);
  if (fs.existsSync(localPath)) {
    return localPath;
  }

  const coreGemRoot = gemRoot('al_folio_core', 'al-folio-core');
  if (coreGemRoot) {
    const gemPath = path.join(coreGemRoot, rel);
    if (fs.existsSync(gemPath)) {
      return gemPath;
    }
  }

  const distillGemRoot = gemRoot('al_folio_distill', 'al-folio-distill');
  if (distillGemRoot) {
    const gemPath = path.join(distillGemRoot, rel);
    if (fs.existsSync(gemPath)) {
      return gemPath;
    }
  }

  throw new Error(`Unable to resolve theme file: ${rel}`);
};

const read = (rel) => fs.readFileSync(resolveThemeFile(rel), 'utf8');

const resolveThemeRoot = () => {
  const localIncludes = path.join(root, "_includes");
  if (fs.existsSync(localIncludes)) {
    return root;
  }
  const coreGemRoot = gemRoot("al_folio_core", "al-folio-core");
  if (coreGemRoot && fs.existsSync(path.join(coreGemRoot, "_includes"))) {
    return coreGemRoot;
  }
  return "";
};

const walkFiles = (dir, matcher, files = []) => {
  if (!dir || !fs.existsSync(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, matcher, files);
      continue;
    }
    if (matcher(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
};

const failures = [];

const utilitiesScss = read('_sass/_utilities.scss');
if (/transition\s*:\s*all\s+/i.test(utilitiesScss)) {
  failures.push('`_sass/_utilities.scss` must not use broad `transition: all` rules.');
}

const distillTransforms = read('assets/js/distillpub/transforms.v2.js');
if (/https:\/\/distill\.pub\/template\.v2\.js/.test(distillTransforms)) {
  failures.push('`assets/js/distillpub/transforms.v2.js` must not load remote distill runtime.');
}

const tailwindAppCss = read('assets/tailwind/app.css');
if (!/@config\s+"\.\.\/\.\.\/tailwind\.config\.js";/.test(tailwindAppCss)) {
  failures.push('`assets/tailwind/app.css` must declare the Tailwind config via `@config`.');
}
if (!/@import\s+"tailwindcss\/theme\.css"\s+layer\(theme\);/.test(tailwindAppCss)) {
  failures.push('`assets/tailwind/app.css` must import Tailwind theme layer.');
}
if (!/@import\s+"tailwindcss\/utilities\.css"\s+layer\(utilities\);/.test(tailwindAppCss)) {
  failures.push('`assets/tailwind/app.css` must import Tailwind utilities layer.');
}
if (/@tailwind\s+base;|@tailwind\s+components;|@tailwind\s+utilities;/.test(tailwindAppCss)) {
  failures.push('`assets/tailwind/app.css` should not use legacy Tailwind v3 @tailwind directives.');
}

const repositoryInclude = read('_includes/repository/repo.liquid');
const repositoryUserInclude = read('_includes/repository/repo_user.liquid');
if (!repositoryInclude.includes('class="repo p-2 text-center"')) {
  failures.push('`_includes/repository/repo.liquid` must preserve the `.repo` container class contract.');
}
if (!repositoryUserInclude.includes('class="repo p-2 text-center"')) {
  failures.push('`_includes/repository/repo_user.liquid` must preserve the `.repo` container class contract.');
}

const coreThemeRoot = resolveThemeRoot();
if (!coreThemeRoot) {
  failures.push("Unable to locate theme root for template class contract checks.");
} else {
  const sassFiles = walkFiles(path.join(coreThemeRoot, "_sass"), (file) => file.endsWith(".scss"));
  const classSources = [read("assets/css/tailwind.css"), ...sassFiles.map((file) => fs.readFileSync(file, "utf8"))].join("\n");
  const templateFiles = [
    ...walkFiles(path.join(coreThemeRoot, "_includes"), (file) => file.endsWith(".liquid")),
    ...walkFiles(path.join(coreThemeRoot, "_layouts"), (file) => file.endsWith(".liquid")),
    ...walkFiles(path.join(root, "_pages"), (file) => file.endsWith(".md") || file.endsWith(".liquid")),
  ];

  const bootstrapPattern =
    /^(container|row|col-|col$|row-cols|card|btn|navbar|dropdown|pagination|page-item|page-link|badge|table|collapse|fixed-top|sticky-top|no-gutters|g-0|ml-|mr-|d-|justify-content|align-items|text-|float-)/;
  const classAttrPattern = /class\s*=\s*"([^"]+)"/g;
  const seenBootstrapLikeClasses = new Set();

  for (const file of templateFiles) {
    const content = fs.readFileSync(file, "utf8");
    let classAttrMatch;
    while ((classAttrMatch = classAttrPattern.exec(content)) !== null) {
      const normalized = classAttrMatch[1].replace(/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g, " ");
      for (const token of normalized.split(/\s+/).filter(Boolean)) {
        if (token.endsWith("-")) {
          continue;
        }
        if (bootstrapPattern.test(token)) {
          seenBootstrapLikeClasses.add(token);
        }
      }
    }
  }

  for (const className of [...seenBootstrapLikeClasses].sort()) {
    const escapedClass = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const selectorPattern = new RegExp(`\\.${escapedClass}(?![A-Za-z0-9_-])`);
    if (!selectorPattern.test(classSources)) {
      failures.push(
        `Template class contract broken: \`.${className}\` is used in layouts/includes/pages but not defined by core CSS assets.`
      );
    }
  }
}

if (failures.length > 0) {
  console.error('Style contract check failed:');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('Style contract check passed.');
