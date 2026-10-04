import { useState } from "react";
import glossaryData from "../data/glossary.json";

type GlossaryItem = { term: string; meaning: string };

export function GlossaryPage() {
  const [query, setQuery] = useState("");
  const glossary = glossaryData as GlossaryItem[];
  const filtered = glossary.filter((item) => `${item.term}${item.meaning}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <main className="page-shell">
      <section className="page-intro"><p className="section-kicker">读懂数字</p><h1>41 条常用术语</h1><p>遇到 HR、RR、95% CI 等词时，可以先查这里。详情页里带虚线的术语也可以直接点击解释。</p></section>
      <label className="glossary-search"><span>搜索术语或解释</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：HR、BMI、定金" /></label>
      <section className="glossary-grid">{filtered.map((item) => <article key={item.term}><h2>{item.term}</h2><p>{item.meaning}</p></article>)}</section>
      {!filtered.length && <section className="empty-state"><strong>没有找到这个术语</strong><p>换一个关键词再试试。</p></section>}
    </main>
  );
}
