from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SCRIPTS_DIR = Path(__file__).resolve().parents[1]
PROJECT_DIR = SCRIPTS_DIR.parent


def load_module(filename: str, module_name: str):
    spec = importlib.util.spec_from_file_location(module_name, SCRIPTS_DIR / filename)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"无法载入 {filename}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


importer = load_module("从固定版本导入完整内容.py", "fixed_importer")
validator = load_module("校验固定版本数据.py", "fixed_validator")


class ImporterUnitTests(unittest.TestCase):
    def test_value_tier_matches_original_rule(self):
        self.assertEqual(importer.value_tier("大", "0", "少", "否"), (0, "极高"))
        self.assertEqual(importer.value_tier("大", "少", "中", "否"), (2, "高"))
        self.assertEqual(importer.value_tier("大", "多", "多", "是"), (6, "一般"))
        self.assertEqual(importer.value_tier("中", "0", "少", "否"), (0, "高"))
        self.assertEqual(importer.value_tier("小", "0", "少", "否"), (0, "一般"))

    def test_extract_sources_supports_original_formats(self):
        text = (
            "WHO 报告. <https://www.who.int/example>；"
            "[法规原文](https://www.gov.cn/example)；裸链接 https://example.com/a"
        )
        sources = importer.extract_sources(text)
        self.assertEqual([item["url"] for item in sources], [
            "https://www.who.int/example",
            "https://www.gov.cn/example",
            "https://example.com/a",
        ])

    def test_parse_chapter_rejects_unknown_lines(self):
        sample = """[← 回总目录](../README.md)
# 1. 示例

章节说明。

### 1. 做一件事
<!-- 成本标签: 钱=0 时间=少 毅力=否 收益=大 口径=死亡率 -->
- 成本：不花钱。
- 说人话：一句话。
- 收益：有收益。
- 证据等级：A
- 来源：示例. <https://example.com>
- 备注：无。
多出来的一行
"""
        with tempfile.TemporaryDirectory(dir=PROJECT_DIR) as temp_dir:
            path = Path(temp_dir) / "01-示例.md"
            path.write_text(sample, encoding="utf-8")
            with self.assertRaises(importer.ImportErrorWithContext):
                importer.parse_chapter(path)

    def test_parse_chapter_excludes_group_guide_from_description(self):
        sample = """[← 回总目录](../README.md)
# 1. 示例

真正的章节简介。

本节条目按主题分成下面几块，括号里是条号。

- **第一组**：示例条目（第 1 条）。

### 1. 做一件事
<!-- 成本标签: 钱=0 时间=少 毅力=否 收益=大 口径=死亡率 -->
- 成本：不花钱。
- 说人话：一句话。
- 收益：有收益。
- 证据等级：A
- 来源：示例. <https://example.com>
- 备注：无。
"""
        with tempfile.TemporaryDirectory(dir=PROJECT_DIR) as temp_dir:
            path = Path(temp_dir) / "01-示例.md"
            path.write_text(sample, encoding="utf-8")
            chapter, entries = importer.parse_chapter(path)
            self.assertEqual(chapter["description"], "真正的章节简介。")
            self.assertEqual(len(entries), 1)


class GeneratedDataTests(unittest.TestCase):
    def test_generated_dataset_passes_full_gate(self):
        data_path = PROJECT_DIR / "src" / "data" / "guide-full.json"
        self.assertTrue(data_path.is_file(), "请先运行固定版本导入脚本")
        data = json.loads(data_path.read_text(encoding="utf-8"))
        self.assertEqual(validator.validate(data), [])

    def test_generated_glossary_has_41_rows(self):
        glossary_path = PROJECT_DIR / "src" / "data" / "glossary.json"
        glossary = json.loads(glossary_path.read_text(encoding="utf-8"))
        self.assertEqual(len(glossary), 41)
        self.assertIn("HR", {item["term"] for item in glossary})
        self.assertIn("定金与订金", {item["term"] for item in glossary})


if __name__ == "__main__":
    unittest.main()
