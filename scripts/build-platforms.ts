#!/usr/bin/env bun

import fs from "node:fs/promises";
import path from "node:path";
import { $ } from "bun";
import pkgJson from "../package.json" with { type: "json" };

interface Platform {
  os: string;
  arch: string;
  target: string;
}

const platforms: Platform[] = [
  { os: "darwin", arch: "arm64", target: "bun-darwin-aarch64" },
  { os: "linux", arch: "x64", target: "bun-linux-x64" },
];

console.log("🚀 Starting multi-platform build...");

const pkgVersion = pkgJson.version;

console.log(`📦 Building version: ${pkgVersion}`);

// Step 1: Clean up and create dist folder
const distPath = path.join(process.cwd(), "dist");

if (await fs.exists(distPath)) {
  console.log("🧹 Cleaning up existing dist folder...");
  await fs.rm(distPath, { recursive: true, force: true });
}

console.log("📁 Creating dist folder...");
await fs.mkdir(distPath, { recursive: true });

// Step 2 & 3: Build for each platform
for (const platform of platforms) {
  const platformDir = `${platform.os}-${platform.arch}`;
  const platformPath = path.join(distPath, platformDir);

  console.log(`\n🔨 Building for ${platformDir}...`);

  // Create platform directory
  await fs.mkdir(platformPath, { recursive: true });

  // Create platform-specific package.json
  const platformPackage = {
    name: `${pkgJson.name}-${platform.os}-${platform.arch}`,
    version: pkgVersion,
    os: [platform.os],
    cpu: [platform.arch],
    files: ["cli"],
  };

  const packageJsonOutputPath = path.join(platformPath, "package.json");
  await fs.writeFile(
    packageJsonOutputPath,
    JSON.stringify(platformPackage, null, 2),
  );

  console.log(`📄 Created package.json for ${platformDir}`);

  // Build the binary for this platform
  const outputPath = path.join(platformPath, "cli");

  try {
    await $`bun build ./src/cli.ts --compile --target=${platform.target} --outfile=${outputPath}`;
    console.log(`✅ Successfully built binary for ${platformDir}`);
  } catch (error) {
    console.error(`❌ Failed to build for ${platformDir}:`, error);
    process.exit(1);
  }
}

console.log("\n🎉 Multi-platform build completed successfully!");
console.log("\nBuilt platforms:");

for (const platform of platforms) {
  console.log(`  - ${platform.os}-${platform.arch}`);
}
