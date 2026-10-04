import type { Tip } from "../data/content";

export function SourceList({ tip }: { tip: Tip }) {
  return (
    <details className="source-details" open>
      <summary>依据与来源（{tip.sources.length || "原文说明"}）</summary>
      {tip.sources.length ? (
        <ol className="source-list">
          {tip.sources.map((source, index) => (
            <li key={`${source.url}-${index}`}>
              <a href={source.url} target="_blank" rel="noreferrer">{source.label || source.url}</a>
              <small>{source.url}</small>
            </li>
          ))}
        </ol>
      ) : <p>{tip.sourceText}</p>}
      <p className="source-raw"><strong>固定版本原文：</strong>{tip.sourceText}</p>
    </details>
  );
}
