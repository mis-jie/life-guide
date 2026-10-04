import { Fragment, useMemo, useState, type ReactNode } from "react";
import glossaryData from "../data/glossary.json";

type GlossaryItem = { term: string; meaning: string };
const glossary = glossaryData as GlossaryItem[];
const glossaryMap = new Map(glossary.flatMap((item) => item.term.split("、").map((term) => [term.trim(), item] as const)));
const terms = [...glossaryMap.keys()].sort((a, b) => b.length - a.length);
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const latinTerms = terms.filter((term) => /^[A-Za-z0-9%. ]+$/.test(term));
const cjkTerms = terms.filter((term) => !latinTerms.includes(term));
const termPattern = new RegExp(`(?<![A-Za-z0-9])(?:${latinTerms.map(escapeRegExp).join("|")})(?![A-Za-z0-9])|(?:${cjkTerms.map(escapeRegExp).join("|")})`, "g");

function GlossaryTerm({ term, item }: { term: string; item: GlossaryItem }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="glossary-inline">
      <button type="button" className="glossary-term" onClick={() => setOpen((value) => !value)} aria-expanded={open}>{term}</button>
      {open && <span className="glossary-popover" role="note"><strong>{item.term}</strong>{item.meaning}</span>}
    </span>
  );
}

export function GlossaryText({ text }: { text: string }) {
  const content = useMemo(() => {
    const nodes: ReactNode[] = [];
    let cursor = 0;
    for (const match of text.matchAll(termPattern)) {
      const index = match.index ?? 0;
      if (index > cursor) nodes.push(<Fragment key={`text-${cursor}`}>{text.slice(cursor, index)}</Fragment>);
      const term = match[0];
      const item = glossaryMap.get(term);
      if (item) nodes.push(<GlossaryTerm key={`term-${index}`} term={term} item={item} />);
      cursor = index + term.length;
    }
    if (cursor < text.length) nodes.push(<Fragment key={`text-${cursor}`}>{text.slice(cursor)}</Fragment>);
    return nodes;
  }, [text]);
  return <>{content}</>;
}
