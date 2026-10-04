#!/usr/bin/env python3
"""把《高性价比人生指南》指定提交导入为网站使用的静态 JSON。"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse


EXPECTED_COMMIT = "91a4f53c5ba3d3f524e5c72b4e32ab4c108015eb"
SOURCE_REPOSITORY = "https://github.com/eternity4719/HowToLiveBetter"
COST_WEIGHTS = {
    "money": {"0": 0, "少": 1, "多": 2},
    "time": {"少": 0, "中": 1, "多": 2},
    "effort": {"否": 0, "些": 1, "是": 2},
}
RESOURCE_LABELS = {
    "死亡率": "换寿命",
    "金钱": "换钱",
    "时间": "换时间精力",
    "自由": "换人身自由",
}
FIELD_NAMES = {
    "成本": "cost",
    "说人话": "plainLanguage",
    "收益": "benefit",
    "证据等级": "evidence",
    "来源": "sourceText",
    "备注": "notes",
}
URL_RE = re.compile(r"https?://[^\s<>）。，；]+")
MARKDOWN_LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
GENERIC_MARKDOWN_LINK_RE = re.compile(r"\[([^\]]+)\]\([^)]*\)")
ANGLE_LINK_RE = re.compile(r"<((?:https?://)[^>]+)>")


class ImportErrorWithContext(ValueError):
    """带文件和条目上下文的数据错误。"""


def read_commit(source_dir: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=source_dir,
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        raise ImportErrorWithContext(f"无法读取固定版本提交号：{source_dir}") from exc
    return result.stdout.strip()


def clean_markdown(text: str) -> str:
    text = GENERIC_MARKDOWN_LINK_RE.sub(lambda match: match.group(1), text)
    text = ANGLE_LINK_RE.sub(lambda match: match.group(1), text)
    text = text.replace("**", "").replace("__", "")
    return re.sub(r"\\([*_])", r"\1", text).strip()


def extract_sources(source_text: str) -> list[dict[str, str]]:
    """提取链接，同时保留链接前的文献说明作为展示标签。"""
    sources: list[dict[str, str]] = []
    seen: set[str] = set()

    markdown_matches = list(MARKDOWN_LINK_RE.finditer(source_text))
    angle_matches = list(ANGLE_LINK_RE.finditer(source_text))
    occupied = [(m.start(2), m.end(2)) for m in markdown_matches]
    occupied.extend((m.start(1), m.end(1)) for m in angle_matches)

    candidates: list[tuple[int, int, str, str]] = []
    for match in markdown_matches:
        candidates.append((match.start(), match.end(), match.group(2), match.group(1)))
    for match in angle_matches:
        candidates.append((match.start(), match.end(), match.group(1), ""))
    for match in URL_RE.finditer(source_text):
        if any(start <= match.start() < end for start, end in occupied):
            continue
        candidates.append((match.start(), match.end(), match.group(0).rstrip(".,，。；;）)"), ""))

    candidates.sort(key=lambda item: item[0])
    previous_end = 0
    for start, end, url, explicit_label in candidates:
        if url in seen:
            previous_end = max(previous_end, end)
            continue
        label = explicit_label.strip()
        if not label:
            prefix = source_text[previous_end:start]
            label = re.split(r"[；;]", prefix)[-1].strip(" ；;，,")
        if not label:
            label = urlparse(url).netloc
        sources.append({"label": clean_markdown(label), "url": url})
        seen.add(url)
        previous_end = end
    return sources


def value_tier(benefit_magnitude: str, money: str, time: str, effort: str) -> tuple[int, str]:
    try:
        cost_score = (
            COST_WEIGHTS["money"][money]
            + COST_WEIGHTS["time"][time]
            + COST_WEIGHTS["effort"][effort]
        )
    except KeyError as exc:
        raise ImportErrorWithContext(f"出现未知成本标签：{exc.args[0]}") from exc

    if benefit_magnitude == "大":
        tier = "极高" if cost_score == 0 else "高" if cost_score <= 2 else "一般"
    elif benefit_magnitude == "中":
        tier = "高" if cost_score == 0 else "一般"
    elif benefit_magnitude == "小":
        tier = "一般"
    else:
        raise ImportErrorWithContext(f"出现未知收益量级：{benefit_magnitude}")
    return cost_score, tier


def parse_cost_tags(line: str, context: str) -> dict[str, str]:
    match = re.fullmatch(r"<!--\s*成本标签:\s*(.*?)\s*-->", line.strip())
    if not match:
        raise ImportErrorWithContext(f"{context}：成本标签格式无法识别")
    raw = {}
    for item in match.group(1).split():
        if "=" not in item:
            raise ImportErrorWithContext(f"{context}：成本标签缺少等号：{item}")
        key, value = item.split("=", 1)
        raw[key] = value
    expected = {"钱", "时间", "毅力", "收益", "口径"}
    if set(raw) != expected:
        raise ImportErrorWithContext(f"{context}：成本标签字段不完整：{sorted(raw)}")
    if raw["口径"] not in RESOURCE_LABELS:
        raise ImportErrorWithContext(f"{context}：未知口径：{raw['口径']}")
    return {
        "money": raw["钱"],
        "time": raw["时间"],
        "effort": raw["毅力"],
        "benefitMagnitude": raw["收益"],
        "resourceType": raw["口径"],
        "resourceLabel": RESOURCE_LABELS[raw["口径"]],
    }


def finalize_entry(entry: dict, chapter_id: str, source_file: str) -> dict:
    context = f"{source_file} 第 {entry['number']} 条"
    required = ["title", "cost", "plainLanguage", "benefit", "evidence", "sourceText", "notes", "tags"]
    missing = [key for key in required if not entry.get(key)]
    if missing:
        raise ImportErrorWithContext(f"{context}：缺少字段 {', '.join(missing)}")
    evidence_match = re.match(r"([ABC])", entry["evidence"])
    if not evidence_match:
        raise ImportErrorWithContext(f"{context}：未知证据等级 {entry['evidence']}")
    entry["evidence"] = evidence_match.group(1)

    tags = entry.pop("tags")
    cost_score, tier = value_tier(
        tags["benefitMagnitude"], tags["money"], tags["time"], tags["effort"]
    )
    entry_id = f"{chapter_id}-{entry['number']:02d}"
    source_text = entry["sourceText"].strip()
    entry.update(
        {
            "id": entry_id,
            "chapterId": chapter_id,
            **tags,
            "costScore": cost_score,
            "valueTier": tier,
            "controversial": entry["notes"].startswith("争议"),
            "needsVerification": bool(
                re.search(
                    r"待核实|TODO",
                    source_text + entry["benefit"] + entry["notes"] + entry["cost"],
                )
            ),
            "sources": extract_sources(source_text),
        }
    )
    return entry


def parse_chapter(path: Path) -> tuple[dict, list[dict]]:
    lines = path.read_text(encoding="utf-8").splitlines()
    chapter_match = next((re.fullmatch(r"#\s+(\d+)\.\s+(.+)", line.strip()) for line in lines if line.startswith("# ")), None)
    if not chapter_match:
        raise ImportErrorWithContext(f"{path.name}：未找到章节标题")
    chapter_number = int(chapter_match.group(1))
    chapter_id = f"{chapter_number:02d}"
    chapter_title = chapter_match.group(2).strip()

    intro_lines: list[str] = []
    entries: list[dict] = []
    entry: dict | None = None
    seen_first_entry = False
    finished_entries = False
    in_group_guide = False

    for line_number, raw_line in enumerate(lines, start=1):
        line = raw_line.strip()
        if seen_first_entry and re.match(r"^#{1,2}\s+", line):
            if entry is not None:
                entries.append(finalize_entry(entry, chapter_id, path.name))
                entry = None
            finished_entries = True
            continue
        if finished_entries:
            continue
        heading = re.fullmatch(r"###\s+(\d+)\.\s+(.+)", line)
        if heading:
            if entry is not None:
                entries.append(finalize_entry(entry, chapter_id, path.name))
            seen_first_entry = True
            entry = {
                "number": int(heading.group(1)),
                "title": clean_markdown(heading.group(2)),
                "cost": "",
                "plainLanguage": "",
                "benefit": "",
                "evidence": "",
                "sourceText": "",
                "notes": "",
                "tags": None,
            }
            continue

        if entry is not None and line.startswith("<!--"):
            entry["tags"] = parse_cost_tags(line, f"{path.name}:{line_number}")
            continue

        field_match = re.fullmatch(r"-\s+(成本|说人话|收益|证据等级|来源|备注)：\s*(.*)", line)
        if entry is not None and field_match:
            key = FIELD_NAMES[field_match.group(1)]
            entry[key] = clean_markdown(field_match.group(2)) if key != "sourceText" else field_match.group(2).strip()
            continue

        if not seen_first_entry and line.startswith("本节条目按主题分成下面几块"):
            in_group_guide = True
            continue
        if not seen_first_entry and in_group_guide:
            continue
        if not seen_first_entry and line and not line.startswith("[←") and not line.startswith("# "):
            intro_lines.append(clean_markdown(line))
        elif entry is not None and line and not line.startswith("[←"):
            raise ImportErrorWithContext(
                f"{path.name}:{line_number}：条目内出现无法识别的非空行：{line[:80]}"
            )

    if entry is not None:
        entries.append(finalize_entry(entry, chapter_id, path.name))

    if not entries:
        raise ImportErrorWithContext(f"{path.name}：没有建议条目")
    expected_numbers = list(range(1, len(entries) + 1))
    actual_numbers = [item["number"] for item in entries]
    if actual_numbers != expected_numbers:
        raise ImportErrorWithContext(f"{path.name}：条目编号不连续：{actual_numbers}")

    chapter = {
        "id": chapter_id,
        "number": chapter_number,
        "title": chapter_title,
        "description": "\n\n".join(intro_lines),
        "tipCount": len(entries),
        "sourceFile": f"book/{path.name}",
    }
    return chapter, entries


def parse_glossary(readme_path: Path) -> list[dict[str, str]]:
    text = readme_path.read_text(encoding="utf-8")
    match = re.search(r"^## 读懂数字[^\n]*\n([\s\S]*?)(?=^## )", text, re.MULTILINE)
    if not match:
        raise ImportErrorWithContext("README.md：未找到术语表")
    glossary: list[dict[str, str]] = []
    for line in match.group(1).splitlines():
        row = re.fullmatch(r"\|\s*(.+?)\s*\|\s*(.+?)\s*\|", line)
        if not row or row.group(1) == "术语" or re.fullmatch(r"-+", row.group(1)):
            continue
        glossary.append({"term": clean_markdown(row.group(1)), "meaning": clean_markdown(row.group(2))})
    if len(glossary) != 41:
        raise ImportErrorWithContext(f"术语表数量应为 41，实际为 {len(glossary)}")
    return glossary


def build_dataset(source_dir: Path) -> tuple[dict, list[dict[str, str]]]:
    source_dir = source_dir.resolve()
    book_dir = source_dir / "book"
    readme_path = source_dir / "README.md"
    if not book_dir.is_dir() or not readme_path.is_file():
        raise ImportErrorWithContext("输入目录缺少 book/ 或 README.md")

    commit = read_commit(source_dir)
    if commit != EXPECTED_COMMIT:
        raise ImportErrorWithContext(f"提交号不匹配：期望 {EXPECTED_COMMIT}，实际 {commit}")

    chapter_files = sorted(book_dir.glob("*.md"))
    if len(chapter_files) != 34:
        raise ImportErrorWithContext(f"章节文件应为 34 个，实际为 {len(chapter_files)}")

    chapters: list[dict] = []
    tips: list[dict] = []
    for path in chapter_files:
        chapter, chapter_tips = parse_chapter(path)
        chapters.append(chapter)
        tips.extend(chapter_tips)

    chapters.sort(key=lambda item: item["number"])
    tips.sort(key=lambda item: (int(item["chapterId"]), item["number"]))
    ids = [item["id"] for item in tips]
    if len(ids) != len(set(ids)):
        duplicates = [item for item, count in Counter(ids).items() if count > 1]
        raise ImportErrorWithContext(f"建议编号重复：{duplicates}")

    dataset = {
        "meta": {
            "title": "高性价比人生指南",
            "version": commit[:7],
            "commit": commit,
            "sourceRepository": SOURCE_REPOSITORY,
            "license": "CC BY 4.0",
            "chapterCount": len(chapters),
            "tipCount": len(tips),
        },
        "chapters": chapters,
        "tips": tips,
    }
    return dataset, parse_glossary(readme_path)


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, nargs="?", help="固定提交的本地仓库目录")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "src" / "data" / "guide-full.json",
        help="完整数据输出路径",
    )
    parser.add_argument(
        "--glossary-output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "src" / "data" / "glossary.json",
        help="术语表输出路径",
    )
    args = parser.parse_args()

    source = args.source or Path(__file__).resolve().parents[2] / "tmp" / "upstream" / "howtolivebetter-6f6d969"
    dataset, glossary = build_dataset(source)
    write_json(args.output, dataset)
    write_json(args.glossary_output, glossary)
    print(
        f"导入完成：{dataset['meta']['chapterCount']} 章、{dataset['meta']['tipCount']} 条、"
        f"{len(glossary)} 个术语。"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
