from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

import pdfplumber


CHAPTER_HEADER = re.compile(r"CHAPTER\s+(\d{2})\s*/\s*34")
CHAPTER_COUNT = re.compile(r"本章\s+(\d+)\s+条建议")
TIP_HEADER = re.compile(
    r"^(\d{2}-\d{2})\s+(.+?)\s+证据\s*([ABC])(?:[（(][^）)]+[）)])?$"
)

CJK_RADICAL_REPLACEMENTS = str.maketrans(
    {
        "⺠": "民",
        "⻁": "虎",
        "⻄": "西",
        "⻅": "见",
        "⻆": "角",
        "⻉": "贝",
        "⻋": "车",
        "⻓": "长",
        "⻔": "门",
        "⻘": "青",
        "⻚": "页",
        "⻛": "风",
        "⻜": "飞",
        "⻝": "食",
        "⻢": "马",
        "⻣": "骨",
        "⻥": "鱼",
        "⻧": "卤",
        "⻩": "黄",
        "⻬": "齐",
        "⻮": "齿",
    }
)

CHINESE_PUNCTUATION = str.maketrans(
    {
        ",": "，",
        ";": "；",
        ":": "：",
        "?": "？",
        "!": "！",
        "(": "（",
        ")": "）",
    }
)


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = text.translate(CJK_RADICAL_REPLACEMENTS).translate(CHINESE_PUNCTUATION)
    return re.sub(r"\s+", " ", text).strip()


def join_wrapped(parts: list[str]) -> str:
    result = ""
    for raw_part in parts:
        part = normalize(raw_part)
        if not part:
            continue
        if result and result[-1].isascii() and result[-1].isalnum() and part[0].isascii() and part[0].isalnum():
            result += " "
        result += part
    return result


def extract_catalog(pdf_path: Path) -> dict[str, list[dict[str, str]]]:
    chapters: dict[str, dict[str, str]] = {}
    expected_counts: dict[str, int] = {}
    tips: list[dict[str, str]] = []

    current_chapter_id: str | None = None
    chapter_title_pending = False
    chapter_title_parts: list[str] = []
    chapter_description_parts: list[str] = []
    current_tip: dict[str, object] | None = None

    def finish_tip() -> None:
        nonlocal current_tip
        if current_tip is None:
            return
        title = join_wrapped(current_tip.pop("title_parts"))  # type: ignore[arg-type]
        summary = join_wrapped(current_tip.pop("summary_parts"))  # type: ignore[arg-type]
        tips.append({**current_tip, "title": title, "summary": summary})  # type: ignore[arg-type]
        current_tip = None

    def finish_chapter_description() -> None:
        nonlocal chapter_description_parts
        if current_chapter_id and current_chapter_id in chapters and chapter_description_parts:
            chapters[current_chapter_id]["description"] = join_wrapped(chapter_description_parts)
        chapter_description_parts = []

    def finish_chapter_title() -> None:
        nonlocal chapter_title_pending, chapter_title_parts
        if current_chapter_id and current_chapter_id in chapters and chapter_title_parts:
            chapters[current_chapter_id]["title"] = join_wrapped(chapter_title_parts)
        chapter_title_parts = []
        chapter_title_pending = False

    with pdfplumber.open(pdf_path) as document:
        for page in document.pages:
            lines = page.extract_text_lines(
                layout=False,
                strip=True,
                return_chars=True,
            )
            for line in lines:
                text = normalize(line["text"])
                if not text:
                    continue
                sizes = [float(char["size"]) for char in line["chars"]]
                max_size = max(sizes, default=0)

                chapter_match = CHAPTER_HEADER.search(text)
                if chapter_match:
                    finish_tip()
                    finish_chapter_title()
                    finish_chapter_description()
                    current_chapter_id = chapter_match.group(1)
                    chapters[current_chapter_id] = {
                        "id": current_chapter_id,
                        "title": "",
                        "description": "",
                    }
                    chapter_title_pending = True
                    continue

                if current_chapter_id is None:
                    continue

                if chapter_title_pending:
                    if max_size >= 20:
                        chapter_title_parts.append(text)
                        continue
                    finish_chapter_title()

                count_match = CHAPTER_COUNT.search(text)
                if count_match:
                    finish_chapter_description()
                    expected_counts[current_chapter_id] = int(count_match.group(1))
                    continue

                if (
                    not expected_counts.get(current_chapter_id)
                    and not chapter_title_pending
                    and 9.4 <= max_size <= 10.1
                ):
                    chapter_description_parts.append(text)
                    continue

                tip_match = TIP_HEADER.match(text)
                if tip_match:
                    finish_tip()
                    tip_id, first_title_line, evidence = tip_match.groups()
                    current_tip = {
                        "id": tip_id,
                        "chapterId": tip_id[:2],
                        "evidence": evidence,
                        "title_parts": [first_title_line],
                        "summary_parts": [],
                    }
                    continue

                if current_tip is None:
                    continue

                if text.startswith("完整解释"):
                    finish_tip()
                    continue

                if max_size >= 10.5 and not current_tip["summary_parts"]:
                    current_tip["title_parts"].append(text)  # type: ignore[union-attr]
                elif 8.5 <= max_size <= 9.4:
                    current_tip["summary_parts"].append(text)  # type: ignore[union-attr]

    finish_tip()
    finish_chapter_title()
    finish_chapter_description()

    ordered_chapters = [chapters[f"{number:02d}"] for number in range(1, 35)]
    return {
        "chapters": ordered_chapters,
        "tips": tips,
        "expectedCounts": [
            {"chapterId": chapter_id, "count": expected_counts[chapter_id]}
            for chapter_id in sorted(expected_counts)
        ],
    }


def validate_catalog(catalog: dict[str, list[dict[str, str]]]) -> None:
    chapters = catalog["chapters"]
    tips = catalog["tips"]
    expected_counts = {
        item["chapterId"]: int(item["count"])
        for item in catalog["expectedCounts"]
    }

    expected_ids = {
        f"{chapter_id}-{index:02d}"
        for chapter_id, count in expected_counts.items()
        for index in range(1, count + 1)
    }
    actual_ids = {tip["id"] for tip in tips}
    if expected_ids != actual_ids:
        print(f"缺少编号：{sorted(expected_ids - actual_ids)}")
        print(f"多余编号：{sorted(actual_ids - expected_ids)}")

    assert len(chapters) == 34, f"章节数应为 34，实际为 {len(chapters)}"
    assert len(tips) == 649, f"建议数应为 649，实际为 {len(tips)}"
    assert len({chapter["id"] for chapter in chapters}) == 34, "章节编号重复"
    assert len({tip["id"] for tip in tips}) == 649, "建议编号重复"
    assert all(chapter["title"] and chapter["description"] for chapter in chapters), "章节信息不完整"
    assert all(tip["title"] and tip["summary"] for tip in tips), "建议标题或摘要为空"
    assert all(tip["evidence"] in {"A", "B", "C"} for tip in tips), "证据等级异常"
    assert all(tip["id"][:2] == tip["chapterId"] for tip in tips), "建议与章节编号不一致"

    actual_counts = Counter(tip["chapterId"] for tip in tips)
    assert dict(sorted(actual_counts.items())) == dict(sorted(expected_counts.items())), (
        f"每章建议数量不一致：实际 {dict(actual_counts)}，应为 {expected_counts}"
    )


def main() -> None:
    logging.getLogger("pdfminer").setLevel(logging.ERROR)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")

    parser = argparse.ArgumentParser(description="从高性价比人生指南 PDF 导入网站目录")
    parser.add_argument("pdf", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    catalog = extract_catalog(args.pdf)
    validate_catalog(catalog)
    catalog.pop("expectedCounts")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    evidence_counts = Counter(tip["evidence"] for tip in catalog["tips"])
    print("PDF 目录导入验证通过")
    print(f"章节：{len(catalog['chapters'])}")
    print(f"建议：{len(catalog['tips'])}")
    print(f"证据等级：{dict(sorted(evidence_counts.items()))}")
    print(f"输出：{args.output}")


if __name__ == "__main__":
    main()
