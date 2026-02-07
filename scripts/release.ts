import { $ } from "bun";
import fs from "node:fs/promises";

if (!process.env.NPM_CONFIG_TOKEN) {
  console.error("NPM_CONFIG_TOKEN is not set");
  process.exit(1);
}

const hasNoNpmrc = process.argv.includes("--no-npmrc");

if (!hasNoNpmrc) {
  await fs.rm(".npmrc", { force: true });

  const npmrcContent = `//registry.npmjs.org/:_authToken=${process.env.NPM_CONFIG_TOKEN}
registry=https://registry.npmjs.org/
always-auth=true`;

  await fs.writeFile(".npmrc", npmrcContent);
}

try {
  await $`bunx npm publish --provenance --access public`;
} catch (error) {
  console.log(error.stderr.toString());
}
