#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// We'll use `ignore` to handle ignoring files
import ignore from "ignore";
import { DEFAULT_IGNORE_PATTERNS } from "./default-ignore";

// Add this right after the imports
if (!DEFAULT_IGNORE_PATTERNS || typeof DEFAULT_IGNORE_PATTERNS !== "string") {
  console.error("Warning: Default ignore patterns could not be loaded");
  process.exit(1);
}

// Resolve current directory in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ParsedArgs {
  output: string | null;
  maxTokens: number | null;
  extensions: string[] | null;
  verbose: boolean;
}

/**
 * Simple function to parse CLI args:
 *
 * -o, --output <file> : specify output filename
 * --max-tokens, -tok <number> : limit output tokens
 * -e, --extension <ext,...> : filter by file extensions (.ts,.js etc)
 */
function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    output: null,
    maxTokens: null,
    extensions: null,
    verbose: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else if (arg === "-v" || arg === "--verbose") {
      result.verbose = true;
    } else if ((arg === "-o" || arg === "--output") && argv[i + 1]) {
      result.output = argv[i + 1];
      i++;
    } else if ((arg === "--max-tokens" || arg === "-tok") && argv[i + 1]) {
      const tokens = parseInt(argv[i + 1]);
      if (!isNaN(tokens)) {
        result.maxTokens = tokens;
      }
      i++;
    } else if ((arg === "-e" || arg === "--extension") && argv[i + 1]) {
      result.extensions = argv[i + 1]
        .split(",")
        .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));
      i++;
    }
  }
  return result;
}

const { output, maxTokens, extensions, verbose } = parseArgs(process.argv);

// Initialize ignore instance with default patterns
const ig = ignore().add(
  DEFAULT_IGNORE_PATTERNS.split("\n").filter(
    (line) => line && !line.startsWith("#")
  )
);

// Try reading .gitignore if it exists
try {
  const gitignoreContent = fs.readFileSync(
    path.join(process.cwd(), ".gitignore"),
    "utf8"
  );
  ig.add(gitignoreContent);
} catch {
  // .gitignore not found or unreadable - that's fine
}

// Try reading .codefetchignore if it exists
try {
  const codefetchignoreContent = fs.readFileSync(
    path.join(process.cwd(), ".codefetchignore"),
    "utf8"
  );
  ig.add(codefetchignoreContent);
} catch {
  // .codefetchignore not found or unreadable - that's fine
}

/**
 * Recursively collect all files in the current working directory,
 * ignoring anything matched by .gitignore or .codefetchignore (if present).
 */
function collectFiles(dir: string): string[] {
  const results: string[] = [];
  const list = fs.readdirSync(dir);

  for (const filename of list) {
    const filePath = path.join(dir, filename);
    const relPath = path.relative(process.cwd(), filePath);

    if (ig.ignores(relPath)) {
      verbose && console.log(`Ignoring: ${relPath}`);
      continue;
    }

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      verbose && console.log(`Processing directory: ${relPath}`);
      results.push(...collectFiles(filePath));
    } else {
      if (extensions) {
        const ext = path.extname(filename);
        if (!extensions.includes(ext)) {
          verbose && console.log(`Skipping non-matching extension: ${relPath}`);
          continue;
        }
      }
      verbose && console.log(`Processing file: ${relPath}`);
      results.push(filePath);
    }
  }
  return results;
}

// Actually gather up the file list
const allFiles = collectFiles(process.cwd());

/**
 * Very rough token count estimation.
 * This is a simple approximation - actual tokens may vary by tokenizer.
 */
function estimateTokens(text: string): number {
  // Rough estimate: Split on whitespace and punctuation
  return text.split(/[\s\p{P}]+/u).length;
}

/**
 * Generate the final markdown content.
 * We replicate the style:
 *
 * /path/to/file:
 * --------------------------------------------------------------------------------
 * 1 | ...
 * 2 | ...
 * --------------------------------------------------------------------------------
 */
function generateMarkdown(files: string[]): string {
  const lines: string[] = [];
  let totalTokens = 0;

  verbose && console.log("\nGenerating markdown output...");

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, "utf8");
    const fileTokens = estimateTokens(content);

    if (maxTokens && totalTokens + fileTokens > maxTokens) {
      verbose &&
        console.log(`Skipping ${relativePath} (would exceed token limit)`);
      continue;
    }

    verbose &&
      console.log(`Adding to output: ${relativePath} (${fileTokens} tokens)`);
    totalTokens += fileTokens;

    // Rest of the existing markdown generation code...
    lines.push(`/${relativePath}:`);
    lines.push(
      "--------------------------------------------------------------------------------"
    );

    const fileLines = content.split("\n");
    fileLines.forEach((line, i) => {
      lines.push(`${i + 1} | ${line}`);
    });

    lines.push("");
    lines.push(
      "--------------------------------------------------------------------------------"
    );
  }

  // if (maxTokens) {
  //   lines.unshift(`// Approximate token count: ${totalTokens}\n`);
  // }

  return lines.join("\n");
}

// Build the final output
const final = generateMarkdown(allFiles);

// Write to file if `-o/--output` was given, else print to stdout
if (output) {
  // Create codefetch directory if it doesn't exist
  const codefetchDir = path.join(process.cwd(), "codefetch");
  if (!fs.existsSync(codefetchDir)) {
    fs.mkdirSync(codefetchDir, { recursive: true });
    console.log("Created codefetch directory.");
  }

  // Create .codefetchignore if it doesn't exist
  const codefetchignorePath = path.join(process.cwd(), ".codefetchignore");
  if (!fs.existsSync(codefetchignorePath)) {
    const ignoreContent = "# Codefetch specific ignores\ncodefetch/\n";
    fs.writeFileSync(codefetchignorePath, ignoreContent, "utf8");
    console.log(
      "Created .codefetchignore file. Add 'codefetch/' to your .gitignore to avoid committing fetched code."
    );
  }

  // Write the output file to the codefetch directory
  const outputPath = path.join(codefetchDir, output);
  fs.writeFileSync(outputPath, final, "utf8");

  // Calculate and display token count
  const totalTokens = estimateTokens(final);

  console.log("\nSummary:");
  console.log("✓ Code was successfully fetched");
  console.log(`✓ Output written to: ${outputPath}`);
  console.log(`✓ Approximate token count: ${totalTokens}`);
} else {
  console.log(final);
}

function printHelp() {
  console.log(`
Usage: codefetch [options]

Options:
  -o, --output <file>       Specify output filename
  -tok, --max-tokens <n>    Limit output tokens (useful for AI models)
  -e, --extension <ext,...> Filter by file extensions (e.g., .ts,.js)
  -v, --verbose            Show detailed processing information
  -h, --help               Display this help message
`);
}
