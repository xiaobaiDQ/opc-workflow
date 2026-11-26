#!/usr/bin/env node
/**
 * OPC Markdown PRD 机械格式校验脚本（零外部依赖，仅用 Node 标准库）。
 * 用法：node scripts/validate-prd.mjs [docs/PRD.md]
 * 退出码：0 = 格式检查通过（可能有非阻断 Warning）；1 = 格式检查失败；2 = 文件不存在。
 * 注意：脚本通过仅说明格式与结构合规，不等于 PRD 内容合格。
 */

import fs from "node:fs";
import path from "node:path";

const targetPath = process.argv[2] || "docs/PRD.md";
const resolved = path.resolve(targetPath);

if (!fs.existsSync(resolved)) {
  console.error(`[FAIL] 未找到 PRD 文件: ${targetPath}`);
  process.exit(2);
}

const raw = fs.readFileSync(resolved, "utf8").replace(/\r\n/g, "\n");
const lines = raw.split("\n");

const errors = [];
const warnings = [];

// 1. 收集所有 H2 章节与正文切片
const h2Sections = [];
let current = null;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^##\s+(.+?)\s*$/);
  if (m) {
    if (current) {
      current.endLine = i;
      h2Sections.push(current);
    }
    current = { title: m[1], startLine: i + 1, endLine: lines.length };
  }
}
if (current) h2Sections.push(current);

function findSection(keyword) {
  return h2Sections.find((s) => s.title.includes(keyword));
}

function sectionText(sec) {
  return lines.slice(sec.startLine, sec.endLine).join("\n");
}

// 2. 必需章节检查
const requiredSections = [
  "需求背景",
  "需求目标",
  "需求概述",
  "详细方案",
  "待后续确认的产品口径",
];
for (const name of requiredSections) {
  if (!findSection(name)) {
    errors.push(`缺少必需章节（H2）：${name}`);
  }
}

// 不允许独立的异常/边界大章
const badBoundaryH2 = h2Sections.find(
  (s) => s.title.includes("异常处理") || s.title.includes("边界情况")
);
if (badBoundaryH2) {
  errors.push(
    `不应设置文档级异常/边界章（## ${badBoundaryH2.title}）；边界情况应写在对应页面的【边界说明】内`
  );
}

// 3. 范围块三段检查（在需求概述内）
const overviewSec = findSection("需求概述");
if (overviewSec) {
  const txt = sectionText(overviewSec);
  for (const part of ["本期必做", "后期预留", "本期不做"]) {
    if (!txt.includes(part)) {
      errors.push(`「需求概述」范围块缺少「${part}」段落`);
    }
  }
}

// 4. 需求目标表 5 列检查
const goalSec = findSection("需求目标");
if (goalSec) {
  const txt = sectionText(goalSec);
  const tableHeaderLine = txt
    .split("\n")
    .find((l) => l.trim().startsWith("|") && l.includes("用户结果"));
  if (!tableHeaderLine) {
    errors.push(
      "「需求目标」缺少 5 列表格（表头须包含：用户结果 | 衡量指标 | 统计口径 | 预期方向 | 目标值）"
    );
  } else {
    const cols = tableHeaderLine
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());
    const expected = ["用户结果", "衡量指标", "统计口径", "预期方向", "目标值"];
    if (
      cols.length !== expected.length ||
      expected.some((col, idx) => !cols[idx].includes(col))
    ) {
      errors.push(
        `「需求目标」表头须为 5 列（${expected.join(" | ")}），当前为：${cols.join(" | ")}`
      );
    }
  }
}

// 5. 详细方案：每个 ### 界面必须包含【页面元素】和【交互说明】，并检查技术用语（仅警告）
const detailSec = findSection("详细方案");
if (detailSec) {
  const detailLines = lines.slice(detailSec.startLine, detailSec.endLine);
  const screens = [];
  let curScreen = null;
  for (let i = 0; i < detailLines.length; i++) {
    const m = detailLines[i].match(/^###\s+(.+?)\s*$/);
    if (m) {
      if (curScreen) screens.push(curScreen);
      curScreen = { title: m[1], body: [], line: detailSec.startLine + i + 1 };
    } else if (curScreen) {
      curScreen.body.push(detailLines[i]);
    }
  }
  if (curScreen) screens.push(curScreen);

  if (screens.length === 0) {
    errors.push("「详细方案」下至少应包含一个界面小节（### <界面名称>）");
  }

  const techPatterns = [
    /\b(?:GET|POST|PUT|PATCH|DELETE)\s+\//i,
    /\/api\/[a-z0-9/_-]+/i,
    /字段\s*key/i,
    /错误码\s*\d{3}/,
    /表结构/,
    /\bSQL\b/,
  ];

  for (const sc of screens) {
    const bodyText = sc.body.join("\n");
    if (!bodyText.includes("【页面元素】")) {
      errors.push(`详细方案「${sc.title}」（第 ${sc.line} 行）缺少【页面元素】`);
    }
    if (!bodyText.includes("【交互说明】")) {
      errors.push(`详细方案「${sc.title}」（第 ${sc.line} 行）缺少【交互说明】`);
    }
    // 检查懒惰占位词（同上 / 独立“无”）
    for (let j = 0; j < sc.body.length; j++) {
      const l = sc.body[j].trim();
      const absLine = sc.line + j + 1;
      if (l.includes("同上") && !l.includes("不写“同上”")) {
        errors.push(`详细方案「${sc.title}」（第 ${absLine} 行）出现禁止指代词「同上」`);
      }
      if (/^(?:[-*]|\d+\.)\s*无\s*$/.test(l) || /^【[^】]+】\s*[:：]?\s*无\s*$/.test(l)) {
        errors.push(`详细方案「${sc.title}」（第 ${absLine} 行）出现无效占位「无」（不涉及请省略该块）`);
      }
      for (const pat of techPatterns) {
        if (pat.test(l) && !l.startsWith(">")) {
          warnings.push(
            `详细方案「${sc.title}」（第 ${absLine} 行）疑似包含技术实现用语（${pat.source}），请确认是否应改用产品语言`
          );
          break;
        }
      }
    }
  }
}

// 6. 全文表格单元格独立“同上”或“无”检查
for (let i = 0; i < lines.length; i++) {
  const l = lines[i].trim();
  if (!l.startsWith("|") || /^\|[\s:-]+\|$/.test(l)) continue;
  const cells = l
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
  for (const c of cells) {
    if (c === "同上" || c === "无") {
      errors.push(`第 ${i + 1} 行表格单元格出现无效占位「${c}」`);
    }
  }
}

if (warnings.length > 0) {
  console.log(`\n[WARN] 共 ${warnings.length} 条提示（不阻断通过）：`);
  for (const w of warnings) console.log(`  - ${w}`);
}

if (errors.length > 0) {
  console.error(`\n[FAIL] PRD 格式校验未通过（共 ${errors.length} 项）：`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `\n[PASS] ${targetPath} 格式校验通过（0 项错误，${warnings.length} 条提示）。注：格式通过仅代表结构合规，不等于内容合格。`
);
process.exit(0);
