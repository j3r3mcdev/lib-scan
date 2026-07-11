import { execSync } from "node:child_process";
import fs from "node:fs";

// Colors
const green = (msg) => console.log(`\x1b[32m${msg}\x1b[0m`);
const red = (msg) => console.log(`\x1b[31m${msg}\x1b[0m`);
const yellow = (msg) => console.log(`\x1b[33m${msg}\x1b[0m`);
const log = (msg) => console.log(msg);

// Mode
const mode = process.argv[2] === "lite" ? "lite" : "full";
let failed = false;

// Helper: run commands safely
const run = (label, cmd) => {
  log(label);
  try {
    execSync(cmd, { stdio: "inherit" });
    green(`✔ ${label.replace(/^[^ ]+ /, "")} OK`);
  } catch {
    red(`✖ ${label.replace(/^[^ ]+ /, "")} FAILED`);
    failed = true;
  }
};

// CLEAN DIST
log("🧹 Cleaning dist...");
try {
  fs.rmSync("dist", { recursive: true, force: true });
  green("✔ dist cleaned");
} catch {
  red("✖ Failed to clean dist");
  failed = true;
}

// TYPE CHECK
run("🔍 Checking TypeScript...", "tsc --noEmit");

// BUILD
run("🏗 Building project...", "tsc");

// TESTS + CAPTURE COVERAGE (Vitest)
log("🧪 Running Vitest tests...");
let vitestOutput = "";
try {
  vitestOutput = execSync("npm run test:ci", { encoding: "utf8" });
  green("✔ Vitest tests passed");
} catch (err) {
  vitestOutput = err.stdout?.toString() || "";
  red("✖ Vitest tests FAILED");
  failed = true;
}

// EXTRACT COVERAGE SUMMARY FROM LCOV
let coverageTable = "";
const lcovFile = "coverage/lcov.info";

if (fs.existsSync(lcovFile)) {
  const lcov = fs.readFileSync(lcovFile, "utf8");

  let totalLines = 0;
  let coveredLines = 0;

  let totalBranches = 0;
  let coveredBranches = 0;

  let totalFuncs = 0;
  let coveredFuncs = 0;

  const lines = lcov.split("\n");

  for (const line of lines) {
    if (line.startsWith("LF:")) totalLines += parseInt(line.substring(3));
    if (line.startsWith("LH:")) coveredLines += parseInt(line.substring(3));

    if (line.startsWith("BRF:")) totalBranches += parseInt(line.substring(4));
    if (line.startsWith("BRH:")) coveredBranches += parseInt(line.substring(4));

    if (line.startsWith("FNF:")) totalFuncs += parseInt(line.substring(4));
    if (line.startsWith("FNH:")) coveredFuncs += parseInt(line.substring(4));
  }

  const pct = (covered, total) =>
    total === 0 ? 100 : Math.round((covered / total) * 100);

  const pctLines = pct(coveredLines, totalLines);
  const pctBranches = pct(coveredBranches, totalBranches);
  const pctFuncs = pct(coveredFuncs, totalFuncs);
  const pctStmts = pctLines; // Vitest = lines = statements

  coverageTable = `
Statements : ${pctStmts}%
Branches   : ${pctBranches}%
Functions  : ${pctFuncs}%
Lines      : ${pctLines}%
`.trim();
} else {
  coverageTable = "⚠ Coverage summary not found";
}

// COLORIZE COVERAGE SUMMARY
const colorizeCoverage = (table) => {
  if (!table || table.startsWith("⚠")) return table;

  return table.replace(/(\d+(\.\d+)?)%/g, (match) => {
    const percent = parseFloat(match);
    if (percent >= 80) return `\x1b[32m${match}\x1b[0m`; // green
    if (percent >= 50) return `\x1b[33m${match}\x1b[0m`; // yellow
    return `\x1b[31m${match}\x1b[0m`; // red
  });
};

// GIT CHECK (FULL ONLY)
let gitWarning = false;
if (mode === "full") {
  log("🔎 Checking Git status...");
  try {
    const gitStatus = execSync("git status --porcelain").toString().trim();
    if (gitStatus.length > 0) {
      yellow("⚠ Untracked or modified files detected:");
      console.log(gitStatus);
      gitWarning = true;
    } else {
      green("✔ No untracked files");
    }
  } catch {
    yellow("⚠ Git not available — skipping");
  }
}

// FINAL REPORT
log("\n📊 FINAL REPORT");

if (failed) {
  red("❌ SANITY FAILED — Push blocked");

  log(`
                .---.
                |   |          
             ___|   |___          
            [           ]   
             ---.   .---        
         __||__ |   | __||__      
         -.  .- |   | -.  .-   
           ||   |   |   ||     
           ||_.-|   |-,_||     

    `);

  log("\n📊 Coverage Report:\n");
  console.log(colorizeCoverage(coverageTable));

  process.exit(1);
} else {
  green("✅ SANITY PASSED — Safe to push");

  if (mode === "full" && gitWarning) {
    yellow("⚠ Warning: You have untracked files");
  }
  log(`
⢦⣷⣾⣶⣷⣾⣶⣧⣮⣴⣥⣾⣤⣷⣬⣶⣵⣮⣶⣥⣾⣤⣧⣼⣶⣷⣾⣶⣷⣾⣶⣷⣾⣶⣷⣾⣶⣷⣾⣶⣷⣾⣶⣷⣼⣶⣵⣮⣶⣵⣮⣶⣷⣾⣶⣷⣼⣤⣧⣼⣴⣧⣼⣶⡡
⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⣛⣛⣻⣿⣟⣿⣟⣿⣛⣛⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇
⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣛⣭⣶⡜⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⣿⣟⣴⣮⣝⡻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡧
⢼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⣫⣴⣿⣿⣿⣿⡟⣿⣿⣿⣿⡏⣴⢹⣿⣿⣿⡗⣿⣿⣿⣿⣿⣿⣷⣭⡻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡧
⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⣵⣿⣿⣿⣿⣿⣿⣿⡟⣿⣿⣿⣿⣧⣙⣼⣿⣿⣿⣇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡝⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇
⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣱⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⢼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢏⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡷⣿⠿⠛⠋⠉⠉⠉⠉⠙⠛⠧⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣜⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇
⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢏⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣎⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡎⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⢼⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣘⠿⣿⣿⣿⣿⣿⣿⣿⣿⠋⠀⠀⠀⠀⠀⠀⣀⣤⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡗
⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⣿⣿⣿⣿⣿⣿⣿⣿⣷⡇⠀⠀⠀⠀⠀⣴⣾⣿⣿⣿⣿⣿⣷⣤⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣾⣿⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣿⢛⣋⢻⣿⣿⣿⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⠿⢷⣄⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⡟⢻⢻⣿⣿⣷⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⢼⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣷⢸⢻⢄⣿⣿⡇⠀⠀⠀⠀⡟⠛⠉⠈⢉⠻⢿⠟⠉⢀⡀⢤⡍⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⡗⣷⢸⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⢼⣿⣿⣿⣷⣷⣾⣿⣿⡇⠀⠀⠀⢠⣄⡐⢅⢀⣄⣱⢿⠠⣈⡆⠀⡀⢠⡇⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣷⣾⣾⣿⣿⡟⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⡱⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⣿⠿⢿⠿⢿⢿⡿⢿⡇⠀⠀⠀⢘⣿⣷⣾⣷⣣⣿⢸⠀⣻⣾⣷⣞⣾⠗⠀⠀⠀⠀⠀⠀⢸⢿⠿⣿⠿⡿⢿⠿⢿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⢼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢱⡿⣛⣛⣛⣛⣛⣛⣛⠀⠀⠀⡀⢻⣿⣿⣿⣿⠟⣾⡆⠹⣿⣿⡿⠋⠀⢀⡀⠀⠀⠀⠀⣚⣛⣛⣛⣛⣛⣛⣛⢷⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⢿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠁⠀⠻⣿⣿⠿⠂⠙⠁⠂⠿⣿⠃⠀⠀⠈⠀⠀⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⢧⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣎⢿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀⡸⠁⢀⣠⠥⠄⢠⡀⢹⡆⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⢋⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇
⢺⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣦⢻⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀⠐⠛⠋⠀⠀⣰⠿⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⡿⣫⣾⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⣹⣿⣿⣿⣿⣿⣿⣷⠿⣾⢶⡾⣿⣿⣷⣝⢿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠼⠋⢎⠳⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⢟⣵⣿⣿⣿⠷⠿⣶⢶⡾⣿⣿⣿⣿⣿⣿⡇
⢼⣿⣿⣿⣿⣿⣿⣿⢘⣇⢻⡗⣺⣿⣿⣿⣾⣝⢿⣿⣿⣿⣿⠟⠁⠰⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⢟⣡⣾⣿⣿⣿⣿⡇⢹⣿⢸⡗⢺⣿⣿⣿⣿⣿⡇
⠼⣿⣿⣿⣿⣿⣿⣿⣬⣿⣮⣵⣿⣿⣿⣿⣿⣿⣷⣍⡻⠟⠁⠀⠀⢠⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠑⠻⠻⠿⣿⣿⣿⣿⣼⣦⣿⣧⣥⣿⣿⣿⣿⣿⣿⡇
⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⢀⣴⡟⣿⣿⣿⣦⣀⢀⡀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠙⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⠾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⢀⣾⣿⣿⣻⣿⣿⣿⣿⣿⣿⣷⡆⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⠻⣿⣿⣿⣿⣿⣿⣿⣿⡇
⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠁⠀⠀⠰⣿⣿⣿⣽⣿⣻⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣿⣿⣿⣿⣿⡇
⢮⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠁⠀⠀⠀⠀⠀⠅⡀⠉⡻⢿⣿⣿⣿⣿⣿⣿⣿⢟⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⣿⡏
⠼⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠐⠙⠻⠿⠿⠿⠿⠯⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⡇
⣹⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠤⠄⠀⠀⠀⠤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⡇
⢲⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⣀⣀⣀⣤⣤⠤⢄⡲⠶⣴⣡⢶⣒⠚⡖⢤⠀⠀⠀⠀⢿⣿⣇
⢎⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠕⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⡆⡎⣭⠙⠛⠟⠉⢲⢘⡌⠛⢣⠻⠀⠁⠂⡀⠀⢽⠨⠀⠀⠀⠀⢸⣿⡧
⢺⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠂⠀⠀⠀⡄⠄⠀⠀⠀⠀⠀⠀⠀⢀⣰⢨⣏⡇⡃⡂⠀⠀⡒⣄⠸⡸⢶⣤⠞⣟⣔⣴⠶⠀⠀⢺⡄⠀⠀⠀⠀⠀⣿⡗
⢺⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⢀⠀⣠⡬⠔⠃⠀⠀⠀⠀⠀⠀⣴⣾⡈⢽⣗⡇⡇⡇⠀⢸⠀⠊⣀⢩⠷⢬⠻⣠⠟⣑⢄⠀⠀⠸⠀⠀⠀⠀⠀⠀⢻⢈
⣹⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠂⢠⡾⠋⡀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣄⣹⣧⡇⠇⠃⠀⢸⣀⠁⡬⢀⡀⠀⡇⣿⣈⢲⣉⠀⠀⢸⡰⠀⠀⠀⠀⠀⠘⡌
⢴⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣼⡴⠴⠤⠂⠀⢸⡇⠀⠀⠀⢀⢻⣿⢵⢛⢇⡃⡄⠃⠀⢺⢠⢛⠲⡦⠀⠀⡗⠫⢬⠞⣈⡴⠖⢼⢘⠀⠀⠀⠀⠀⠀⡘
⢺⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣞⣭⣴⠶⠶⠴⠂⠀⢀⣱⠀⠀⠀⢸⢜⢔⡮⡒⡝⡂⢀⢁⠎⣅⡠⠊⠐⠁⠁⠀⠁⠀⢠⡛⣡⠊⠉⢻⠸⠀⠀⠀⠀⠀⠀⡘
⢹⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢺⣿⠀⠀⢀⠄⠀⠑⢸⡇⠀⠀⠀⢸⣱⠇⡆⣯⡗⠁⠸⠈⠈⡰⠫⠠⠀⠒⠀⠀⠀⠤⣓⡀⡗⢦⡔⢾⣂⠁⠀⠀⠀⠀⠀⡘
⢣⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣇⠀⠀⠊⣠⣶⠘⠀⠀⠀⠀⢸⡿⠃⡧⡷⣏⢱⢨⠱⠆⡑⠿⢃⣜⡃⠀⠀⠈⣛⠶⢺⠑⡣⠼⣴⠸⠀⠀⠀⠀⠀⠀⢘
⡡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⡄⠀⣰⣿⣿⠆⠀⠀⠀⠀⣰⡇⠃⣇⣿⡇⢸⢐⠈⠙⠰⡄⣛⠶⣁⠀⠀⡄⢯⡢⢋⠆⠇⢀⡾⠘⠀⠀⠀⠀⠀⠀⢌
⠒⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡇⠀⣯⣿⠁⠀⠀⠀⠀⠀⣿⣃⡻⣝⠯⡁⢄⠸⠀⠀⠃⢥⡚⠜⠀⠀⠀⢠⠀⠒⢅⡀⡄⠀⡥⢆⠀⠀⠀⠀⠀⠀⢌
⢩⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⠓⡔⠉⠀⠀⠀⠀⠀⠀⠰⣱⠶⠶⠬⣥⣄⡈⠐⠀⢸⠀⡁⠀⡨⠄⣀⡤⡈⢨⠗⠉⠂⠁⠀⠉⠀⠀⠀⠀⠀⠀⠀⢌
⡡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠆⠆⣰⣠⣴⣿⣿⣷⣦⡀⠀⠁⠀⠐⠲⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢌
⡡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣲⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡌
⡡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣮⣿⣭⣿⣿⣿⣿⣿⠿⠍⡂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡘
⡡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠲⣶⣥⣼⣿⣩⣽⠯⢛⠥⡺⠅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡱
⡡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠚⠖⠢⠩⠔⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱
⠔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱
⢃⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⢖⡲⠶⡶⠶⠶⠶⠷⠶⠶⠶⠶⠶⠷⠾⠷⠶⠶⠶⠶⠶⠶⠶⠶⠶⢷⠷⠶⠶⠶⠶⠶⢾⠶⢶⠶⡶⢶⡶⢶⠶⣶⠶⣶⠶⡶⢾⢃

  `);

  log("\n📊 Coverage Report:\n");
  console.log(colorizeCoverage(coverageTable));

  log("\n🎉 ALL CHECKS PASSED — YOU ARE CLEAR TO DEPLOY 🚀");

  process.exit(0);
}
