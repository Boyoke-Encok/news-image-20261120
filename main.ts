import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const SOURCE = new URL("./entry.png", import.meta.url);
const TARGET = join(OUTPUT_DIR, "entry.png");

async function sha256Of(path: string): Promise<string> {
  const bytes = await readFile(path);
  return createHash("sha256").update(bytes).digest("hex");
}

async function run(): Promise<void> {
  const before = await stat(SOURCE);
  if (before.size === 0) {
    console.error("entry.png is empty");
    process.exit(1);
  }
  await mkdir(OUTPUT_DIR, { recursive: true });
  await copyFile(SOURCE, TARGET);
  const after = await stat(TARGET);
  if (after.size !== before.size) {
    throw new Error(
      `copied size ${after.size} does not match source size ${before.size}`,
    );
  }
  const digest = await sha256Of(TARGET);
  console.log(
    `entry.png -> ${TARGET} (${after.size} bytes, sha256 ${digest})`,
  );
}

run().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
