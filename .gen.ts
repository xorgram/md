import modules from "./modules.json" assert { type: "json" };

for (const [k, v] of Object.entries(modules)) {
  await Deno.writeTextFile(
    `${k}/README.md`,
    `# ${k}

> ${v.description}

## Installation

\`\`\`text
\\install https://raw.githubusercontent.com/xorgram/md/main/${k}/mod.ts
\`\`\`

## Help

\`\`\`text
\\help ${k}
\`\`\`

##### Author${v.authors.length == 1 ? "" : "s"}: ${
      v.authors.sort().map((v) => `[@${v}](https://github.com/${v})`).join(", ")
    }
`,
  );
}

await Deno.writeTextFile(
  "README.md",
  `# Xor Modules Directory

> Xor modules which are made by the team and can be trusted.

## Index

${Object.keys(modules).sort().map((v) => `- [${v}](./${v})`).join("\n")}

## License

All modules here are licensed under the [Unlicense](./LICENSE).
`,
);
