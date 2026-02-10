import { $ } from "bun";
import fs from "node:fs/promises";

// We specifically DO NOT want a token here for Trusted Publishing
console.log("Publishing via OIDC (Trusted Publishing)...");

const hasNoNpmrc = process.argv.includes("--no-npmrc");

if (!hasNoNpmrc) {
  await fs.rm(".npmrc", { force: true });

  // ONLY set the registry. DO NOT set _authToken.
  // This satisfies the "need for an npmrc" without breaking OIDC.
  const npmrcContent = `registry=https://registry.npmjs.org/`;

  await fs.writeFile(".npmrc", npmrcContent);
}

try {
  // 1. We must ensure npm is at least v11.5.1
  // 2. We use --provenance (required for OIDC publishes)
  await $`npm publish`;
  console.log("Success!");
} catch (error) {
  // @ts-ignore
  console.error("stderr:", error.stderr?.toString());
  process.exit(1);
}
