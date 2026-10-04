#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)

with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

with open('locales/whitelist.json', 'r', encoding='utf-8') as f:
    whitelist = set(json.load(f))

print(f"Loaded English master: {len(en_ui)} UI sections, {len(en_content)} content sections.")
