// scripts/deploy.js
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { execSync } from "child_process";
import { unlink } from "fs/promises";

import { FormData } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import { FormDataEncoder } from "form-data-encoder";
import { Readable } from "stream";

const DEPLOY_URL = "https://devs.v-xplore.com/clinicpe/devops.php";
const DEPLOY_SECRET = "YOUR_DEPLOY_SECRET_HERE";

const distDir = path.resolve("dist");
const zipPath = path.resolve("dist.zip");

async function zipDist() {
  console.log("🗜️  Creating dist.zip...");
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(distDir, false);
    archive.finalize();
  });
}

async function deploy() {
  console.log("📤 Uploading dist.zip to server...");

  const form = new FormData();
  form.set("file", await fileFromPath(zipPath));

  const encoder = new FormDataEncoder(form);
  const body = Readable.from(encoder.encode());

  const response = await fetch(DEPLOY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DEPLOY_SECRET}`,
      ...encoder.headers,
    },
    body,
    duplex: "half", //  <-- REQUIRED IN NODE 18+ WHEN BODY IS STREAM
  });

  const text = await response.text();
  console.log("🧾 Raw server response:");
  console.log(text);

  try {
    console.log("Parsed:", JSON.parse(text));
  } catch {}

  await unlink(zipPath);
}

// (async () => {
//   execSync("npm run build", { stdio: "inherit" });

//   await zipDist();
//   await deploy();
// })();

(async () => {
  console.log("||==================================||");
  console.log("Deployment started at " + new Date().toString());
  console.log("🚀 Building project...");
  const startetAt = Date.now();
  execSync("npm run build", { stdio: "inherit" });

  await zipDist();
  await deploy();
  const endedAt = Date.now();
  const duration = endedAt - startetAt;
  console.log("Deployemnt takes " + parseInt(duration / 1000) + "s");
  console.log("||==================================||");
})();
