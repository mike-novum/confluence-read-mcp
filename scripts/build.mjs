import { chmod, readFile, rm } from "node:fs/promises";
import { build } from "esbuild";

await rm("dist", { recursive: true, force: true });

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  outfile: "dist/index.js",
  legalComments: "none",
  plugins: [
    {
      name: "cjs-import-meta-url",
      setup(build) {
        build.onLoad({ filter: /\/config\.ts$/ }, async (args) => {
          const source = await readFile(args.path, "utf8");
          return {
            contents: source.replaceAll("fileURLToPath(import.meta.url)", "__filename"),
            loader: "ts",
          };
        });
      },
    },
  ],
});

await chmod("dist/index.js", 0o755);
