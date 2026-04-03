#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

/**
 * Usage:
 *   node scripts/extract_figma_page_case.mjs --input ./tmp/node-663-11500.json --output ./demo/src/cases/pageCaseManifest.generated.json
 *
 * Expected input:
 *   JSON exported from TalkToFigma get_node_info/read_my_design result.
 */

function getArg(flag, fallback = "") {
  const idx = process.argv.indexOf(flag);
  if (idx < 0) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

const inputPath = getArg("--input");
const outputPath =
  getArg("--output") ||
  path.resolve(process.cwd(), "demo/src/cases/pageCaseManifest.generated.json");
const figmaLink = getArg("--figma-link");
const nodeId = getArg("--node-id");

if (!inputPath) {
  console.error("Missing required --input path");
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(process.cwd(), inputPath), "utf8");
const payload = JSON.parse(raw);

function pickRootNode(data) {
  if (Array.isArray(data) && data[0]?.document?.id && data[0]?.document?.type) {
    return data[0].document;
  }
  if (data?.id && data?.type) return data;
  if (data?.node?.id && data?.node?.type) return data.node;
  if (data?.document?.id && data?.document?.type) return data.document;
  if (data?.nodes?.[0]?.id && data?.nodes?.[0]?.type) return data.nodes[0];
  if (data?.data?.id && data?.data?.type) return data.data;
  return null;
}

const root = pickRootNode(payload);
if (!root) {
  console.error("Cannot find root node in input json.");
  process.exit(2);
}

const typeCount = new Map();
const colorCount = new Map();
const iconNameCount = new Map();

function colorToHex(color) {
  if (!color) return null;
  if (typeof color === "string") return color;
  if (
    typeof color.r === "number" &&
    typeof color.g === "number" &&
    typeof color.b === "number"
  ) {
    const r = Math.round(color.r * 255)
      .toString(16)
      .padStart(2, "0");
    const g = Math.round(color.g * 255)
      .toString(16)
      .padStart(2, "0");
    const b = Math.round(color.b * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${r}${g}${b}`.toUpperCase();
  }
  return null;
}

function walk(node) {
  const nodeType = node?.type;
  if (nodeType) typeCount.set(nodeType, (typeCount.get(nodeType) ?? 0) + 1);

  const fills = Array.isArray(node?.fills) ? node.fills : [];
  for (const fill of fills) {
    if (fill?.type === "SOLID") {
      const hex = colorToHex(fill.color);
      if (hex) colorCount.set(hex, (colorCount.get(hex) ?? 0) + 1);
    }
  }

  const nodeName = String(node?.name ?? "").toLowerCase();
  const isIconLike =
    nodeType === "VECTOR" ||
    nodeType === "BOOLEAN_OPERATION" ||
    nodeName.includes("icon") ||
    nodeName.includes("图标");
  if (isIconLike && nodeName) {
    iconNameCount.set(nodeName, (iconNameCount.get(nodeName) ?? 0) + 1);
  }

  const children = Array.isArray(node?.children) ? node.children : [];
  for (const child of children) walk(child);
}

walk(root);

const componentHeuristics = {
  TEXT: "Typography",
  RECTANGLE: "Card",
  FRAME: "Layout",
  INSTANCE: "Button",
  LINE: "Divider",
};

const components = [...typeCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => ({
    figmaType: type,
    count,
    suggestedComponent: componentHeuristics[type] ?? "待人工映射",
  }));

const topColors = [...colorCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([hex, count]) => ({ hex, count, tokenPath: "待人工映射 vcTokens.*" }));

const icons = [...iconNameCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 50)
  .map(([name, count]) => ({
    figmaName: name,
    count,
    vcIconType: "help-circle",
    fallback: true,
  }));

const output = {
  source: {
    figmaLink: figmaLink || "",
    nodeId: nodeId || root.id || "",
    generatedAt: new Date().toISOString(),
  },
  summary: {
    nodeTypeCount: typeCount.size,
    colorCount: colorCount.size,
    iconCandidateCount: iconNameCount.size,
  },
  components,
  colors: topColors,
  icons,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Generated: ${outputPath}`);
