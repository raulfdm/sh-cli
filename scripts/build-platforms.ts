#!/usr/bin/env bun

import fs from "node:fs/promises";
import path from "node:path";
import { $ } from "bun";
import pkgJson from "../package.json" with { type: "json" };

const DIST_FOLDER_NAME = "dist";
const DIST_PATH = path.join(process.cwd(), DIST_FOLDER_NAME);

class Platform {
  target: string;
  dir: string;
  cliOutputRelativePath: string;
  cliOutputFileAbsolutePath: string;

  constructor(
    public os: string,
    public arch: string,
  ) {
    this.target = `${this.os}-${this.arch}`;
    this.cliOutputRelativePath = path.join(
      DIST_FOLDER_NAME,
      this.target,
      "cli",
    );
    this.dir = path.join(DIST_PATH, this.target);
    this.cliOutputFileAbsolutePath = path.join(this.dir, "cli");
  }

  get pkgJsonContent() {
    return {
      name: `${pkgJson.name}-${this.os}-${this.arch}`,
      version: pkgVersion,
      os: [this.os],
      cpu: [this.arch],
      files: ["cli"],
      publishConfig: {
        access: "public",
      },
    };
  }
}

const platforms: Platform[] = [
  new Platform("darwin", "arm64"),
  new Platform("linux", "x64"),
];

console.log("🚀 Starting multi-platform build...");

const pkgVersion = pkgJson.version;

console.log(`📦 Building version: ${pkgVersion}`);

// Step 1: Clean up and create dist folder
await cleanDistFolder();

// Step 2 & 3: Build for each platform
await buildPlatformPackages();

// Step 4: Create root package
await buildRootPkg();

async function buildRootPkg() {
  console.log("\n📦 Creating root package...");
  const rootPath = path.join(DIST_PATH, "root");

  // Create bin directory for the wrapper script
  const binPath = path.join(rootPath, "bin");
  await fs.mkdir(binPath, { recursive: true });

  // Create the run.js script by compiling the TypeScript version
  console.log("🔨 Compiling bin/run.ts...");
  const tempRunJs = path.join(process.cwd(), "temp-run.js");

  try {
    await $`bun build ./bin/run.ts --outfile=${tempRunJs} --target=node`;

    // Copy the compiled file to the bin directory
    const runScriptPath = path.join(binPath, "run.js");
    await fs.copyFile(tempRunJs, runScriptPath);

    // Clean up the temporary file
    await fs.rm(tempRunJs, { force: true });

    console.log("📄 Created bin/run.js from TypeScript source");
  } catch (error) {
    console.error("❌ Failed to compile bin/run.ts:", error);
    process.exit(1);
  }

  // Create root package.json
  const optionalDependencies: Record<string, string> = {};
  for (const platform of platforms) {
    optionalDependencies[platform.pkgJsonContent.name] =
      platform.pkgJsonContent.version;
  }

  const binName = pkgJson.name.split("/")[1] || pkgJson.name;

  const rootPackage = {
    name: pkgJson.name,
    version: pkgVersion,
    type: "module",
    bin: {
      [binName]: "bin/run.js",
    },
    engines: {
      node: ">=20.0.0",
    },
    files: ["bin/run.js"],
    optionalDependencies,
  };

  await writePackageJson(rootPath, rootPackage);

  console.log("📄 Created root package.json");

  console.log("\n🎉 Multi-platform build completed successfully!");
  console.log("\nBuilt packages:");

  for (const platform of platforms) {
    console.log(`  - ${platform.os}-${platform.arch} (platform-specific)`);
  }
  console.log(`  - root (main package)`);
}

async function buildPlatformPackages() {
  for (const platform of platforms) {
    console.log(`\n🔨 Building for "${platform.target}"...`);

    await createDir(platform.dir);
    await writePackageJson(platform.dir, platform.pkgJsonContent);

    console.log(`📄 Created package.json`);

    try {
      await buildForPlatform(platform);
      console.log(`✅ Successfully built binary`);
    } catch (error) {
      console.error(`❌ Failed to build:`, error);
      process.exit(1);
    }
  }
}

async function cleanDistFolder() {
  if (await fs.exists(DIST_PATH)) {
    console.log("🧹 Cleaning up existing dist folder...");
    await fs.rm(DIST_PATH, { recursive: true, force: true });
  }

  console.log("📁 Creating dist folder...");
  await fs.mkdir(DIST_PATH, { recursive: true });
}

async function createDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writePackageJson(dir: string, content: object) {
  const filePath = path.join(dir, "package.json");
  await fs.writeFile(filePath, JSON.stringify(content, null, 2));
}

async function buildForPlatform(platform: Platform) {
  return $`bun build ./src/cli.ts --compile --target=bun-${platform.target} --outfile=${platform.cliOutputRelativePath}`;
}
