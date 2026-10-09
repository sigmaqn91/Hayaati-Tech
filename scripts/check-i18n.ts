import fs from 'fs';
import path from 'path';

interface FailureRecord {
  type: 'MISSING_KEY' | 'EMPTY_VALUE' | 'IDENTICAL_TO_ENGLISH' | 'HARDCODED_COMPONENT_TEXT';
  lang?: string;
  location: string;
  detail: string;
}

function getFlattenedObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, getFlattenedObject(val, newKey));
    } else {
      result[newKey] = val;
    }
  }
  return result;
}

async function runCheck() {
  console.log('====================================================');
  console.log('HAYAATI WEB TECHNOLOGY — I18N AUDIT SYSTEM');
  console.log('====================================================\n');

  const failures: FailureRecord[] = [];
  const localesDir = path.join(process.cwd(), 'locales');
  const whitelistPath = path.join(localesDir, 'whitelist.json');

  if (!fs.existsSync(whitelistPath)) {
    console.error('FATAL: locales/whitelist.json does not exist!');
    process.exit(1);
  }

  const whitelist: string[] = JSON.parse(fs.readFileSync(whitelistPath, 'utf-8'));
  const whitelistSet = new Set(whitelist.map((item) => item.trim()));

  function isWhitelisted(val: string): boolean {
    const trimmed = val.trim();
    if (!trimmed) return true;
    if (whitelistSet.has(trimmed)) return true;
    // Numbers, years, coordinate formats, emails, URLs, system codes
    if (/^[\d\s.,:/\-–—+°%#()//]+$/.test(trimmed)) return true;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return true;
    if (/^https?:\/\//.test(trimmed)) return true;
    if (/^SYS\/\//.test(trimmed)) return true;
    return false;
  }

  // 1. Verify English Baseline
  const enUiPath = path.join(localesDir, 'en', 'ui.json');
  const enContentPath = path.join(localesDir, 'en', 'content.json');

  if (!fs.existsSync(enUiPath) || !fs.existsSync(enContentPath)) {
    console.error('FATAL: locales/en/ui.json or locales/en/content.json is missing!');
    process.exit(1);
  }

  const enUi = JSON.parse(fs.readFileSync(enUiPath, 'utf-8'));
  const enContent = JSON.parse(fs.readFileSync(enContentPath, 'utf-8'));

  const flatEnUi = getFlattenedObject(enUi);
  const flatEnContent = getFlattenedObject(enContent);

  // Check English UI has no empty strings
  for (const [key, val] of Object.entries(flatEnUi)) {
    if (typeof val === 'string' && val.trim() === '') {
      failures.push({
        type: 'EMPTY_VALUE',
        lang: 'en',
        location: `ui.json -> ${key}`,
        detail: 'Value is empty',
      });
    }
  }

  // Check English Content has no empty strings
  for (const [key, val] of Object.entries(flatEnContent)) {
    if (typeof val === 'string' && val.trim() === '') {
      failures.push({
        type: 'EMPTY_VALUE',
        lang: 'en',
        location: `content.json -> ${key}`,
        detail: 'Value is empty',
      });
    }
  }

  console.log(`[BASE] English baseline loaded: ${Object.keys(flatEnUi).length} UI keys, ${Object.keys(flatEnContent).length} content keys.`);

  // 2. Discover and Audit all existing locales in locales/
  const localeDirs = fs
    .readdirSync(localesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name !== 'bundles')
    .map((dirent) => dirent.name);

  console.log(`[AUDIT] Found ${localeDirs.length} locale directory/ies: ${localeDirs.join(', ')}\n`);

  for (const lang of localeDirs) {
    if (lang === 'en') continue;

    const langUiPath = path.join(localesDir, lang, 'ui.json');
    const langContentPath = path.join(localesDir, lang, 'content.json');

    if (!fs.existsSync(langUiPath)) {
      failures.push({
        type: 'MISSING_KEY',
        lang,
        location: `${lang}/ui.json`,
        detail: 'ui.json file missing',
      });
      continue;
    }

    if (!fs.existsSync(langContentPath)) {
      failures.push({
        type: 'MISSING_KEY',
        lang,
        location: `${lang}/content.json`,
        detail: 'content.json file missing',
      });
      continue;
    }

    let langUi: any;
    let langContent: any;
    try {
      langUi = JSON.parse(fs.readFileSync(langUiPath, 'utf-8'));
      langContent = JSON.parse(fs.readFileSync(langContentPath, 'utf-8'));
    } catch (e: any) {
      failures.push({
        type: 'MISSING_KEY',
        lang,
        location: `${lang}`,
        detail: `JSON parse error: ${e.message}`,
      });
      continue;
    }

    const flatLangUi = getFlattenedObject(langUi);
    const flatLangContent = getFlattenedObject(langContent);

    // Audit UI keys
    for (const [key, enVal] of Object.entries(flatEnUi)) {
      // heroAdvert.* is optional per language: missing keys fall back to English at runtime
      if (key.startsWith('heroAdvert.') && !(key in flatLangUi)) continue;
      if (!(key in flatLangUi)) {
        failures.push({
          type: 'MISSING_KEY',
          lang,
          location: `ui.json -> ${key}`,
          detail: 'Key is missing',
        });
      } else {
        const langVal = flatLangUi[key];
        if (typeof langVal === 'string') {
          if (langVal.trim() === '') {
            failures.push({
              type: 'EMPTY_VALUE',
              lang,
              location: `ui.json -> ${key}`,
              detail: 'Value is empty',
            });
          } else if (
            langVal.trim() === String(enVal).trim() &&
            !isWhitelisted(langVal) &&
            key !== 'meta.code'
          ) {
            failures.push({
              type: 'IDENTICAL_TO_ENGLISH',
              lang,
              location: `ui.json -> ${key}`,
              detail: `Value "${langVal}" is identical to English and not in whitelist`,
            });
          }
        }
      }
    }

    // Audit Content keys
    for (const [key, enVal] of Object.entries(flatEnContent)) {
      if (!(key in flatLangContent)) {
        failures.push({
          type: 'MISSING_KEY',
          lang,
          location: `content.json -> ${key}`,
          detail: 'Key is missing',
        });
      } else {
        const langVal = flatLangContent[key];
        if (typeof langVal === 'string') {
          if (langVal.trim() === '') {
            failures.push({
              type: 'EMPTY_VALUE',
              lang,
              location: `content.json -> ${key}`,
              detail: 'Value is empty',
            });
          } else if (
            langVal.trim() === String(enVal).trim() &&
            !isWhitelisted(langVal)
          ) {
            failures.push({
              type: 'IDENTICAL_TO_ENGLISH',
              lang,
              location: `content.json -> ${key}`,
              detail: `Value "${langVal}" is identical to English and not in whitelist`,
            });
          }
        }
      }
    }
  }

  // 3. Scan components for hard-coded visible English text
  console.log('[AUDIT] Scanning components for raw visible English strings...');
  const componentsDir = path.join(process.cwd(), 'components');
  const componentFiles = fs
    .readdirSync(componentsDir)
    .filter((f) => f.endsWith('.tsx'));

  for (const file of componentFiles) {
    if (file === 'DecryptText.tsx' || file === 'HeroStarfield.tsx') continue;
    const filePath = path.join(componentsDir, file);
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      // Skip imports, comments, console logs
      if (
        trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('import ') ||
        trimmed.includes('console.')
      ) {
        return;
      }

      // 1. Check aria-label="..."
      const ariaMatch = /aria-label=["']([^"']+)["']/.exec(line);
      if (ariaMatch) {
        const val = ariaMatch[1].trim();
        if (val.length > 2 && !isWhitelisted(val) && !val.includes('{') && !val.includes('$')) {
          failures.push({
            type: 'HARDCODED_COMPONENT_TEXT',
            location: `components/${file}:${lineIndex + 1}`,
            detail: `Found raw aria-label: "${val}"`,
          });
        }
      }

      // 2. Check placeholder="..."
      const placeholderMatch = /placeholder=["']([^"']+)["']/.exec(line);
      if (placeholderMatch) {
        const val = placeholderMatch[1].trim();
        if (val.length > 2 && !isWhitelisted(val) && !val.includes('{') && !val.includes('$')) {
          failures.push({
            type: 'HARDCODED_COMPONENT_TEXT',
            location: `components/${file}:${lineIndex + 1}`,
            detail: `Found raw placeholder: "${val}"`,
          });
        }
      }

      // 3. Check raw JSX text >Text<
      const jsxTextRegex = />\s*([A-Za-z][A-Za-z0-9\s.,!?:;'’"—\-/]+)\s*</g;
      let jsxMatch: RegExpExecArray | null;
      while ((jsxMatch = jsxTextRegex.exec(line)) !== null) {
        const text = jsxMatch[1].trim();
        if (text.length > 2 && !isWhitelisted(text) && !text.includes('{') && !text.includes('$')) {
          failures.push({
            type: 'HARDCODED_COMPONENT_TEXT',
            location: `components/${file}:${lineIndex + 1}`,
            detail: `Found raw JSX text: "${text}"`,
          });
        }
      }
    });
  }

  // 4. Output Results
  console.log('\n====================================================');
  console.log('AUDIT REPORT SUMMARY');
  console.log('====================================================');

  if (failures.length > 0) {
    console.error(`\nFAILED: Found ${failures.length} issue(s):\n`);
    for (let i = 0; i < Math.min(failures.length, 50); i++) {
      const f = failures[i];
      console.error(
        `[${f.type}] ${f.lang ? `[${f.lang}] ` : ''}${f.location}: ${f.detail}`
      );
    }
    if (failures.length > 50) {
      console.error(`...and ${failures.length - 50} more issues.`);
    }
    process.exit(1);
  } else {
    console.log('SUCCESS: All checks passed!');
    console.log('- Zero missing or empty keys in checked languages.');
    console.log('- Zero non-whitelisted English leaks.');
    console.log('- Zero hardcoded visible strings in components.');
    process.exit(0);
  }
}

runCheck().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
