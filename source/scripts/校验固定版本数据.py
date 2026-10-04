#!/usr/bin/env python3
"""校验指定版本静态数据的数量、字段和来源链接。"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse


EXPECTED = {
    "chapters": 34,
    "tips": 654,
    "evidence": {"A": 429, "B": 174, "C": 51},
    "valueTier": {"极高": 111, "高": 298, "一般": 245},
    "controversial": 65,
    "needsVerification": 3,
}


def validate(data: dict) -> list[str]:
    errors: list[str] = []
    chapters = data.get("chapters", [])
    tips = data.get("tips", [])
    if len(chapters) != EXPECTED["chapters"]:
        errors.append(f"章节数量错误：{len(chapters)}")
    if len(tips) != EXPECTED["tips"]:
        errors.append(f"建议数量错误：{len(tips)}")

    chapter_ids = [chapter.get("id") for chapter in chapters]
    expected_chapters = [f"{number:02d}" for number in range(1, 35)]
    if chapter_ids != expected_chapters:
        errors.append("章节编号不是 01 至 34 的连续顺序")

    ids = [tip.get("id") for tip in tips]
    if len(ids) != len(set(ids)):
        errors.append("建议编号存在重复")

    required = ["title", "cost", "plainLanguage", "benefit", "evidence", "notes"]
    for tip in tips:
        tip_id = tip.get("id", "未知编号")
        for key in required:
            if not tip.get(key):
                errors.append(f"{tip_id} 缺少字段：{key}")
        if not tip.get("needsVerification") and not tip.get("sourceText"):
            errors.append(f"{tip_id} 没有来源，也没有标记待核实")
        for source in tip.get("sources", []):
            url = source.get("url", "")
            parsed = urlparse(url)
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                errors.append(f"{tip_id} 来源链接格式错误：{url}")

    evidence = Counter(tip.get("evidence") for tip in tips)
    value_tiers = Counter(tip.get("valueTier") for tip in tips)
    controversial = sum(bool(tip.get("controversial")) for tip in tips)
    needs_verification = sum(bool(tip.get("needsVerification")) for tip in tips)
    if dict(evidence) != EXPECTED["evidence"]:
        errors.append(f"证据等级统计错误：{dict(evidence)}")
    if dict(value_tiers) != EXPECTED["valueTier"]:
        errors.append(f"性价比统计错误：{dict(value_tiers)}")
    if controversial != EXPECTED["controversial"]:
        errors.append(f"争议条目统计错误：{controversial}")
    if needs_verification != EXPECTED["needsVerification"]:
        errors.append(f"待核实条目统计错误：{needs_verification}")

    by_chapter = Counter(tip.get("chapterId") for tip in tips)
    for chapter in chapters:
        chapter_id = chapter.get("id")
        count = by_chapter.get(chapter_id, 0)
        if chapter.get("tipCount") != count:
            errors.append(f"第 {chapter_id} 章条目数不一致：章节写 {chapter.get('tipCount')}，实际 {count}")
        numbers = [tip.get("number") for tip in tips if tip.get("chapterId") == chapter_id]
        if numbers != list(range(1, len(numbers) + 1)):
            errors.append(f"第 {chapter_id} 章建议编号不连续")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("data", type=Path)
    args = parser.parse_args()
    data = json.loads(args.data.read_text(encoding="utf-8"))
    errors = validate(data)
    if errors:
        print("校验失败：")
        for error in errors:
            print(f"- {error}")
        return 1
    print("校验通过：34 章，654 条建议。")
    print("证据等级：A 429，B 174，C 51。")
    print("性价比：极高 111，高 298，一般 245。")
    print("风险标记：争议 65，待核实 3。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
