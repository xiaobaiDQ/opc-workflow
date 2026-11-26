#!/usr/bin/env node
/**
 * OPC Markdown PRD 机械格式校验脚本（零外部依赖，需要 Node >= 16）。
 * 用法：node scripts/validate-prd.mjs [docs/PRD.md] [--allow-template]
 * 退出码：0 = 格式检查通过（可能有非阻断 Warning）；1 = 格式检查失败；2 = 文件不存在。
 * 注意：脚本通过仅说明格式与结构合规，不等于 PRD 内容合格。
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const allowTemplate = args.includes("--allow-template");
const targetPath = args.find((a) => !a.startsWith("--")) || "docs/PRD.md";
const resolved = path.resolve(targetPath);

if (!fs.existsSync(resolved)) {
  console.error(`[FAIL] 未找到 PRD 文件: ${targetPath}`);
  process.exit(2);
}

const raw = fs.readFileSync(resolved, "utf8").replace(/\r\n/g, "\n");
const lines = raw.split("\n");

const errors = [];
const warnings = [];

// 0. 标记围栏代码块范围，避免代码块内的 ## 或表格被误判
const inCodeBlock = new Array(lines.length).fill(false);
let fenced = false;
for (let i = 0; i < lines.length; i++) {
  if (/^\s*```/.test(lines[i])) {
    inCodeBlock[i] = true;
    fenced = !fenced;
    continue;
  }
  inCodeBlock[i] = fenced;
}

// 1. 收集所有 H2 章节与正文切片（忽略代码块内）
const h2Sections = [];
let current = null;
for (let i = 0; i < lines.length; i++) {
  if (inCodeBlock[i]) continue;
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

function sectionLines(sec) {
  const out = [];
  for (let i = sec.startLine; i < sec.endLine; i++) {
    if (!inCodeBlock[i]) out.push({ text: lines[i], lineNo: i + 1 });
  }
  return out;
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

const badBoundaryH2 = h2Sections.find(
  (s) => s.title.includes("异常处理") || s.title.includes("边界情况")
);
if (badBoundaryH2) {
  errors.push(
    `不应设置文档级异常/边界章（## ${badBoundaryH2.title}）；边界情况应写在对应页面的【边界说明】内`
  );
}

// 3. 未填写模板占位文字检查（传 --allow-template 时跳过，供空模板自检）
if (!allowTemplate) {
  const placeholderPatterns = [
    { re: /（填写）/, label: "（填写）" },
    { re: /YYYY-MM-DD/, label: "YYYY-MM-DD" },
    { re: /示例界面名称/, label: "示例界面名称" },
    { re: /（例如[：:]/, label: "（例如：...）" },
    { re: /（示例[：:]/, label: "（示例：...）" },
    { re: /（用户获得的结果）/, label: "（用户获得的结果）" },
    { re: /（写清本次必须交付/, label: "模板占位说明" },
  ];
  const pureParenRe = /^（[^（）]+）$/;

  for (let i = 0; i < lines.length; i++) {
    if (inCodeBlock[i]) continue;
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith(">")) continue;
    if (/^#{1,6}\s/.test(trimmed)) {
      if (/示例界面名称/.test(trimmed)) {
        errors.push(`第 ${i + 1} 行标题仍包含未填写的模板占位「示例界面名称」`);
      }
      continue;
    }

    // 表格行：逐格检查是否命中固定占位或整格仅剩一段全角括号
    if (trimmed.startsWith("|")) {
      if (/^\|[\s:-]+\|$/.test(trimmed)) continue;
      const cells = trimmed
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim());
      for (const cell of cells) {
        const matched = placeholderPatterns.find((p) => p.re.test(cell));
        if (matched) {
          errors.push(`第 ${i + 1} 行表格单元格仍包含未填写的模板占位「${matched.label}」`);
        } else if (pureParenRe.test(cell)) {
          errors.push(`第 ${i + 1} 行表格单元格仍为未填写占位「${cell}」`);
        }
      }
      continue;
    }

    // 正文/列表行：先查固定占位，再剥离列表符号与粗体标签后查整行是否仅剩一段全角括号
    const matched = placeholderPatterns.find((p) => p.re.test(trimmed));
    if (matched) {
      errors.push(`第 ${i + 1} 行仍包含未填写的模板占位「${matched.label}」`);
      continue;
    }
    const stripped = trimmed
      .replace(/^(?:[-*]\s+(?:\[[ xX]\]\s+)?|\d+\.\s+)/, "")
      .replace(/^\*\*[^*]+\*\*\s*[：:]\s*/, "")
      .trim();
    if (pureParenRe.test(stripped)) {
      errors.push(`第 ${i + 1} 行仍为未填写占位「${stripped}」`);
    }
  }
}

// 4. 范围块三段检查（在需求概述内）
const overviewSec = findSection("需求概述");
if (overviewSec) {
  const txt = sectionLines(overviewSec)
    .map((x) => x.text)
    .join("\n");
  for (const part of ["本期必做", "后期预留", "本期不做"]) {
    if (!txt.includes(part)) {
      errors.push(`「需求概述」范围块缺少「${part}」段落`);
    }
  }
}

// 5. 需求目标表 5 列检查
const goalSec = findSection("需求目标");
if (goalSec) {
  const tableHeader = sectionLines(goalSec).find(
    (x) => x.text.trim().startsWith("|") && x.text.includes("用户结果")
  );
  if (!tableHeader) {
    errors.push(
      "「需求目标」缺少 5 列表格（表头须包含：用户结果 | 衡量指标 | 统计口径 | 预期方向 | 目标值）"
    );
  } else {
    const cols = tableHeader.text
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

// 6. 详细方案：每个 ### 界面必须包含【页面元素】和【交互说明】，检查分块占位“无/同上”与技术用语（仅警告）
const detailSec = findSection("详细方案");
if (detailSec) {
  const dLines = sectionLines(detailSec);
  const screens = [];
  let curScreen = null;
  for (const item of dLines) {
    const m = item.text.match(/^###\s+(.+?)\s*$/);
    if (m) {
      if (curScreen) screens.push(curScreen);
      curScreen = { title: m[1], items: [], line: item.lineNo };
    } else if (curScreen) {
      curScreen.items.push(item);
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
    const bodyText = sc.items.map((x) => x.text).join("\n");
    if (!bodyText.includes("【页面元素】")) {
      errors.push(`详细方案「${sc.title}」（第 ${sc.line} 行）缺少【页面元素】`);
    }
    if (!bodyText.includes("【交互说明】")) {
      errors.push(`详细方案「${sc.title}」（第 ${sc.line} 行）缺少【交互说明】`);
    }
    for (const item of sc.items) {
      const l = item.text.trim();
      if (l.includes("同上") && !l.includes("不写“同上”")) {
        errors.push(`详细方案「${sc.title}」（第 ${item.lineNo} 行）出现禁止指代词「同上」`);
      }
      if (/^(?:[-*]|\d+\.)\s*无\s*$/.test(l) || /^【[^】]+】\s*[:：]?\s*无\s*$/.test(l)) {
        errors.push(
          `详细方案「${sc.title}」（第 ${item.lineNo} 行）出现无效占位「无」（不涉及请省略该块）`
        );
      }
      for (const pat of techPatterns) {
        if (pat.test(l) && !l.startsWith(">")) {
          warnings.push(
            `详细方案「${sc.title}」（第 ${item.lineNo} 行）疑似包含技术实现用语（${pat.source}），请确认是否应改用产品语言`
          );
          break;
        }
      }
    }
  }
}

// 7. 全文表格单元格只拦截“同上”，不误杀权限/规则表里合法的“无”
for (let i = 0; i < lines.length; i++) {
  if (inCodeBlock[i]) continue;
  const l = lines[i].trim();
  if (!l.startsWith("|") || /^\|[\s:-]+\|$/.test(l)) continue;
  const cells = l
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
  for (const c of cells) {
    if (c === "同上") {
      errors.push(`第 ${i + 1} 行表格单元格出现禁止指代词「同上」`);
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
