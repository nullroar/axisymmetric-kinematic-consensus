import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = fileURLToPath(new URL("../src", import.meta.url));

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return nested.flat();
};

const rules = [
  {
    scope: "domain",
    forbidden: ["/adapters/", "/application/", "/kernel/", "/ports/"],
  },
  {
    scope: "math",
    forbidden: ["/adapters/", "/application/", "/kernel/", "/ports/"],
  },
  {
    scope: "kernel",
    forbidden: ["/adapters/", "/application/"],
  },
];

const violations = [];
for (const path of await walk(source)) {
  if (extname(path) !== ".ts") {
    continue;
  }
  const local = relative(source, path);
  const rule = rules.find(({ scope }) => local.startsWith(`${scope}/`));
  if (rule === undefined) {
    continue;
  }
  const text = await readFile(path, "utf8");
  for (const forbidden of rule.forbidden) {
    if (text.includes(forbidden)) {
      violations.push(`${local} imports forbidden boundary ${forbidden}`);
    }
  }
}

if (violations.length > 0) {
  process.stderr.write(`${violations.join("\n")}\n`);
  process.exitCode = 1;
} else {
  const displayRoot = relative(process.cwd(), root) || ".";
  process.stdout.write(
    `Architecture boundary verification passed for ${displayRoot}\n`,
  );
}
