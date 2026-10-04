import { chapters, type Evidence, type ResourceType, type ValueTier } from "../data/content";

export type FilterState = {
  query: string;
  chapterId: string;
  evidence: Evidence[];
  valueTier: ValueTier[];
  resourceType: ResourceType[];
  money: string[];
  time: string[];
  effort: string[];
};

export const emptyFilters: FilterState = { query: "", chapterId: "全部", evidence: [], valueTier: [], resourceType: [], money: [], time: [], effort: [] };

type MultiFilterProps<T extends string> = { label: string; values: readonly T[]; selected: T[]; onChange: (values: T[]) => void; labels?: Record<string, string> };

function MultiFilter<T extends string>({ label, values, selected, onChange, labels = {} }: MultiFilterProps<T>) {
  const toggle = (value: T) => onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  return <fieldset className="multi-filter"><legend>{label}</legend><div>{values.map((value) => <label key={value}><input type="checkbox" checked={selected.includes(value)} onChange={() => toggle(value)} /><span>{labels[value] ?? value}</span></label>)}</div></fieldset>;
}

export function FullFilter({ value, onChange, resultCount }: { value: FilterState; onChange: (next: FilterState) => void; resultCount: number }) {
  const update = <K extends keyof FilterState>(key: K, next: FilterState[K]) => onChange({ ...value, [key]: next });
  const activeCount = value.evidence.length + value.valueTier.length + value.resourceType.length + value.money.length + value.time.length + value.effort.length + (value.query ? 1 : 0) + (value.chapterId !== "全部" ? 1 : 0);
  return (
    <section className="filter-panel full-filter" aria-label="建议组合筛选">
      <div className="filter-primary">
        <label><span>搜索全部字段</span><input value={value.query} onChange={(event) => update("query", event.target.value)} placeholder="例如：睡眠、安全带、密码、HR" /></label>
        <label><span>所属章节</span><select value={value.chapterId} onChange={(event) => update("chapterId", event.target.value)}><option value="全部">全部章节</option>{chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.id} · {chapter.title}</option>)}</select></label>
      </div>
      <div className="filter-groups">
        <MultiFilter label="证据等级" values={["A", "B", "C"] as const} selected={value.evidence} onChange={(next) => update("evidence", next)} />
        <MultiFilter label="性价比" values={["极高", "高", "一般"] as const} selected={value.valueTier} onChange={(next) => update("valueTier", next)} />
        <MultiFilter label="换回什么" values={["死亡率", "金钱", "时间", "自由"] as const} selected={value.resourceType} onChange={(next) => update("resourceType", next)} labels={{ 死亡率: "寿命", 金钱: "金钱", 时间: "时间精力", 自由: "人身自由" }} />
        <MultiFilter label="花钱" values={["0", "少", "多"] as const} selected={value.money} onChange={(next) => update("money", next)} labels={{ "0": "不花", 少: "少量", 多: "较多" }} />
        <MultiFilter label="花时间" values={["少", "中", "多"] as const} selected={value.time} onChange={(next) => update("time", next)} labels={{ 少: "顺手", 中: "几小时", 多: "每天" }} />
        <MultiFilter label="要毅力" values={["否", "些", "是"] as const} selected={value.effort} onChange={(next) => update("effort", next)} labels={{ 否: "不用", 些: "一点", 是: "很多" }} />
      </div>
      <div className="filter-summary"><strong>找到 {resultCount} 条建议</strong><span>不同类别之间为“并且”，同一类别多选为“或者”。</span><button type="button" onClick={() => onChange(emptyFilters)} disabled={!activeCount}>清除全部筛选</button></div>
    </section>
  );
}
