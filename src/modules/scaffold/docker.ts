import meow from "meow";
import fs from "node:fs/promises";
import path from "node:path";

export async function dockerScaffold() {
  const cli = meow(``, {
    importMeta: import.meta,
    flags: {
      static: {
        type: "boolean",
        default: false,
        description: "Generate docker for static site",
      },
    },
  });

  if (cli.flags.static) {
    await copyStaticFiles();
  } else {
    console.error("No options provided.");
    cli.showHelp();
    process.exit(1);
  }
}

async function copyStaticFiles() {
  const rootDir = process.cwd();

  const staticTemplateDir = path.join(rootDir, "./templates/static");

  try {
    await folderExists(rootDir);

    for (const file of ["Dockerfile", "nginx.conf"]) {
      const templateFile = new TemplateFile(file, staticTemplateDir);
      await templateFile.copyTo(rootDir);
    }

    console.log("Static Docker scaffold generated successfully.");
  } catch (error) {
    console.error("Error generating static Docker scaffold:", error);
    process.exit(1);
  }
}

function folderExists(path: string) {
  return fs
    .stat(path)
    .then((stat) => ({ success: true, exists: stat.isDirectory() }))
    .catch((error) => ({ success: false, exists: false, error }));
}

function fileExists(filePath: string) {
  return fs
    .stat(filePath)
    .then((stat) => ({ success: true, exists: stat.isFile() }))
    .catch((error) => ({ success: false, exists: false, error }));
}

class TemplateFile {
  #origin: string;

  constructor(
    public fileName: string,
    origin: string,
  ) {
    this.#origin = path.join(origin, fileName);
  }

  async copyTo(destination: string) {
    const destFilePath = path.join(destination, this.fileName);

    const existResult = await fileExists(destFilePath);
    if (existResult.success && existResult.exists) {
      console.log(`File "${destFilePath}" already exists.`);
      process.exit(1);
    } else {
      await fs.copyFile(this.#origin, destFilePath);
      console.log(`Copying template file to ${destFilePath}`);
    }
  }
}
