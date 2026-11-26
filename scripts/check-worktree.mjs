#!/usr/bin/env node
/**
 * OPC Worktree 路径与 .gitignore 核验脚本（零外部依赖，需 Node >= 16）。
 * 用法：
 *   - 在子 Worktree 内直接运行：node scripts/check-worktree.mjs
 *   - 或在主仓库传任务名核验：node scripts/check-worktree.mjs <单段任务名>
 * 退出码：0 = 核验通过；1 = 核验失败。
 */

import { execFileSync } from "node:child_process";
import path from "node:path";

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function norm(p) {
  return path.resolve(p).replace(/\\/g, "/").toLowerCase();
}

const taskArg = process.argv[2];
const cwd = process.cwd();
const errors = [];

let topLevel;
let commonDir;
try {
  topLevel = path.resolve(git(["rev-parse", "--show-toplevel"], cwd));
  commonDir = path.resolve(topLevel, git(["rev-parse", "--git-common-dir"], cwd));
} catch (err) {
  console.error("[FAIL] 当前目录不是有效的 Git 仓库。");
  process.exit(1);
}

const mainRepoRoot = path.dirname(commonDir);
const expectedBase = path.join(mainRepoRoot, ".worktrees");

let targetName = taskArg;
let targetPath;

if (targetName) {
  if (
    targetName === "." ||
    targetName === ".." ||
    /[\\/:]/.test(targetName) ||
    path.isAbsolute(targetName)
  ) {
    console.error(`[FAIL] 任务名必须是单段相对目录名，禁止绝对路径或分隔符：${targetName}`);
    process.exit(1);
  }
  targetPath = path.join(expectedBase, targetName);
} else {
  if (norm(topLevel) === norm(mainRepoRoot)) {
    console.error(
      "[FAIL] 当前位于主仓库根目录。请在独立 Worktree 内运行，或传入单段任务名：node scripts/check-worktree.mjs <任务名>"
    );
    process.exit(1);
  }
  targetPath = topLevel;
  const rel = path.relative(expectedBase, topLevel);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel) || /[\\/]/.test(rel)) {
    errors.push(
      `Worktree 路径不合规：实际在 ${topLevel}，要求位于 ${expectedBase}/<单段任务名>`
    );
  } else {
    targetName = rel;
  }
}

// 1. 核对 git worktree list --porcelain 登记
try {
  const porcelain = git(["worktree", "list", "--porcelain"], mainRepoRoot);
  const registered = porcelain
    .split(/\r?\n/)
    .filter((l) => l.startsWith("worktree "))
    .map((l) => norm(l.slice("worktree ".length).trim()));
  if (!registered.includes(norm(targetPath))) {
    errors.push(`git worktree list 未登记目标路径：${targetPath}`);
  }
} catch (err) {
  errors.push(`无法读取 git worktree list：${err.message}`);
}

// 2. 核对 .gitignore 显式忽略 .worktrees/<任务名>
const checkRel = targetName ? `.worktrees/${targetName}` : ".worktrees/sample";
try {
  const ignored = git(["check-ignore", "-v", checkRel], mainRepoRoot);
  if (!ignored) {
    errors.push(`.gitignore 未忽略 ${checkRel}`);
  }
} catch {
  errors.push(`.gitignore 未忽略 ${checkRel}（请在主仓库 .gitignore 添加 .worktrees/）`);
}

if (errors.length > 0) {
  console.error(`\n[FAIL] Worktree 路径核验未通过（共 ${errors.length} 项）：`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `[PASS] Worktree 核验通过：${targetPath}（已登记在 git worktree list 且被 .gitignore 忽略）`
);
process.exit(0);
