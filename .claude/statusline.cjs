#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");
const fs = require("fs");
const os = require("os");

function readStdin() {
  try {
    return fs.readFileSync(0, "utf-8");
  } catch (e) {
    return "";
  }
}

// Dim color helper (dim + 8-bit ANSI color code) for use in a terminal
// rendering the status line with dimmed colors.
function dim(code, text) {
  return `\x1b[2m\x1b[${code}m${text}\x1b[0m`;
}

function safeExec(cmd, cwd) {
  try {
    return execSync(cmd, { cwd, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch (e) {
    return null;
  }
}

function shortenPath(p) {
  if (!p) return p;
  const home = os.homedir();
  let out = p;
  if (home && p.startsWith(home)) {
    out = "~" + p.slice(home.length);
  }
  return out.replace(/\\/g, "/");
}

let input = {};
try {
  input = JSON.parse(readStdin() || "{}");
} catch (e) {
  input = {};
}

const parts = [];
const sep = dim("90", " | ");

// 1. Model name + current working directory
const modelName = (input.model && input.model.display_name) || "Claude";
const cwd =
  (input.workspace && input.workspace.current_dir) || input.cwd || process.cwd();
parts.push(dim("33", modelName) + " " + dim("33", shortenPath(cwd)));

// 2. Git branch + dirty/clean status
const insideGit = safeExec(
  "git --no-optional-locks rev-parse --is-inside-work-tree",
  cwd
);
if (insideGit === "true") {
  const branch =
    safeExec("git --no-optional-locks symbolic-ref --short -q HEAD", cwd) ||
    safeExec("git --no-optional-locks rev-parse --short HEAD", cwd) ||
    "HEAD";
  const statusOutput = safeExec(
    "git --no-optional-locks status --porcelain",
    cwd
  );
  const isDirty = !!(statusOutput && statusOutput.length > 0);
  parts.push(
    isDirty
      ? dim("33", `git:${branch} ✗`)
      : dim("33", `git:${branch} ✓`)
  );
}

// 3. Context window usage percentage
const cw = input.context_window || {};
const usedPct =
  cw.used_percentage !== null && cw.used_percentage !== undefined
    ? cw.used_percentage
    : null;
if (usedPct !== null) {
  parts.push(dim("33", `ctx:${Math.round(usedPct)}%`));
}

// 4. Claude.ai rate-limit usage (5-hour / 7-day)
const rateLimits = input.rate_limits || {};
const fiveHour =
  rateLimits.five_hour && rateLimits.five_hour.used_percentage;
const sevenDay =
  rateLimits.seven_day && rateLimits.seven_day.used_percentage;
const rateParts = [];
if (fiveHour !== undefined && fiveHour !== null) {
  rateParts.push(`5h:${Math.round(fiveHour)}%`);
}
if (sevenDay !== undefined && sevenDay !== null) {
  rateParts.push(`7d:${Math.round(sevenDay)}%`);
}
if (rateParts.length > 0) {
  parts.push(dim("33", rateParts.join(" ")));
}

process.stdout.write(parts.join(sep));
