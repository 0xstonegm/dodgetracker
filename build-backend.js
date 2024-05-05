const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["lambda/updateDatabase/main.ts"],
    outfile: "lambda/updateDatabase/dist/main.js",
    bundle: true,
    platform: "node",
    format: "esm",
    target: "es2020",
  })
  .catch(() => process.exit(1));
