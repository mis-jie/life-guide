import guide from "./guide-full.json";

export type Evidence = "A" | "B" | "C";
export type ValueTier = "极高" | "高" | "一般";
export type ResourceType = "死亡率" | "金钱" | "时间" | "自由";

export type SourceLink = { label: string; url: string };

export type Tip = {
  id: string;
  chapterId: string;
  number: number;
  title: string;
  cost: string;
  plainLanguage: string;
  benefit: string;
  evidence: Evidence;
  sourceText: string;
  notes: string;
  money: "0" | "少" | "多";
  time: "少" | "中" | "多";
  effort: "否" | "些" | "是";
  benefitMagnitude: "大" | "中" | "小";
  resourceType: ResourceType;
  resourceLabel: string;
  costScore: number;
  valueTier: ValueTier;
  controversial: boolean;
  needsVerification: boolean;
  sources: SourceLink[];
  summary: string;
};

export type Chapter = {
  id: string;
  number: number;
  title: string;
  description: string;
  tipCount: number;
  sourceFile: string;
  eyebrow: string;
  accent: string;
};

export type GuideMeta = {
  title: string;
  version: string;
  commit: string;
  sourceRepository: string;
  license: string;
  chapterCount: number;
  tipCount: number;
};

const chapterEyebrow = (id: string) => {
  const number = Number(id);
  if (number <= 2) return "安全与健康";
  if (number <= 6) return "时间与金钱";
  if (number <= 9) return "保障与法律";
  if (number <= 12) return "关系与事业";
  if (number <= 14) return "应急与信息";
  if (number <= 16) return "住房与医疗";
  if (number <= 20) return "家庭与照护";
  if (number <= 24) return "出行与生活";
  if (number <= 28) return "事务与身体";
  if (number <= 32) return "恢复与成长";
  return "健康与支持";
};

const accentPalette = ["#bde85a", "#8dcad0", "#f0c85b", "#d99bd3", "#ef906a", "#84b995", "#c7a4ef", "#e6ac6d"];

export const guideMeta = guide.meta as GuideMeta;
export const chapters: Chapter[] = guide.chapters.map((chapter) => ({
  ...chapter,
  eyebrow: chapterEyebrow(chapter.id),
  accent: accentPalette[(Number(chapter.id) - 1) % accentPalette.length],
}));

export const tips: Tip[] = guide.tips.map((tip) => ({
  ...tip,
  evidence: tip.evidence as Evidence,
  money: tip.money as Tip["money"],
  time: tip.time as Tip["time"],
  effort: tip.effort as Tip["effort"],
  benefitMagnitude: tip.benefitMagnitude as Tip["benefitMagnitude"],
  resourceType: tip.resourceType as ResourceType,
  valueTier: tip.valueTier as ValueTier,
  summary: tip.plainLanguage,
}));

export const getChapter = (id: string) => chapters.find((chapter) => chapter.id === id);
export const getChapterTips = (id: string) => tips.filter((tip) => tip.chapterId === id);
export const getTip = (id: string) => tips.find((tip) => tip.id === id);

export const costLabels = {
  money: { "0": "不花钱", 少: "花少量钱", 多: "花不少钱" },
  time: { 少: "顺手", 中: "花几小时", 多: "每天占时间" },
  effort: { 否: "不用毅力", 些: "要一点毅力", 是: "要很多毅力" },
} as const;
