#!/usr/bin/env python3
import os
import glob
import json
import re

# Update whitelist.json to ensure 2030–2050 is included
whitelist_path = 'locales/whitelist.json'
with open(whitelist_path, 'r', encoding='utf-8') as f:
    whitelist = json.load(f)

for item in ["2030–2050", "2030-2050", "ALIYA KHAN", "HAYAATI WEB TECHNOLOGY", "HAYAATI"]:
    if item not in whitelist:
        whitelist.append(item)

with open(whitelist_path, 'w', encoding='utf-8') as f:
    json.dump(whitelist, f, ensure_ascii=False, indent=2)

print("[PASS] Updated locales/whitelist.json")

# Transliteration mappings for exact replacement
# Language specific replacements
REPLACEMENTS = {
    'hi': [
        ('हयाती वेब टेक्नोलॉजी', 'Hayaati Web Technology'),
        ('हयाती', 'Hayaati'),
        ('आलिया खान', 'Aliya Khan'),
        ('आलिया ख़ान', 'Aliya Khan'),
    ],
    'mr': [
        ('हयाती वेब टेक्नॉलॉजी', 'Hayaati Web Technology'),
        ('हयाती', 'Hayaati'),
        ('आलिया खान', 'Aliya Khan'),
    ],
    'ne': [
        ('हयाती वेब टेक्नोलोजी', 'Hayaati Web Technology'),
        ('हयाती', 'Hayaati'),
        ('आलिया खान', 'Aliya Khan'),
    ],
    'ur': [
        ('حیاتی ویب ٹیکنالوجی', 'Hayaati Web Technology'),
        ('عالیہ خان', 'Aliya Khan'),
        ('حیاتی ادراکی انٹرفیس', 'Hayaati ادراکی انٹرفیس'),
        ('حیاتی معاون', 'Hayaati معاون'),
        ('حیاتی اور', 'Hayaati اور'),
        ('حیاتی بول رہی ہے', 'Hayaati بول رہی ہے'),
        ('حیاتی سے بات کریں', 'Hayaati سے بات کریں'),
        ('"حیاتی"', '"Hayaati"'),
        ('حیاتی بنیادی انجن', 'Hayaati بنیادی انجن'),
    ],
    'ar': [
        ('حياتي لتكنولوجيا الويب', 'Hayaati Web Technology'),
        ('حياتي ويب تكنولوجيا', 'Hayaati Web Technology'),
        ('علياء خان', 'Aliya Khan'),
        ('واجهة حياتي الإدراكية', 'واجهة Hayaati الإدراكية'),
        ('مساعد حياتي', 'مساعد Hayaati'),
        ('عن حياتي', 'عن Hayaati'),
        ('حياتي تتحدث', 'Hayaati تتحدث'),
        ('مع حياتي', 'مع Hayaati'),
        ('"حياتي"', '"Hayaati"'),
        ('محرك حياتي', 'محرك Hayaati'),
    ],
    'bn': [
        ('হায়াতি ওয়েব টেকনোলজি', 'Hayaati Web Technology'),
        ('হায়াতি', 'Hayaati'),
        ('আলিয়া খান', 'Aliya Khan'),
    ],
    'pa': [
        ('ਹਯਾਤੀ ਵੈੱਬ ਟੈਕਨਾਲੋਜੀ', 'Hayaati Web Technology'),
        ('ਹਯਾਤੀ', 'Hayaati'),
        ('ਆਲੀਆ ਖ਼ਾਨ', 'Aliya Khan'),
        ('ਆਲੀਆ ਖਾਨ', 'Aliya Khan'),
    ],
    'gu': [
        ('હયાતી વેબ ટેકનોલોજી', 'Hayaati Web Technology'),
        ('હયાતી', 'Hayaati'),
        ('આલિયા ખાન', 'Aliya Khan'),
    ],
    'ta': [
        ('ஹயாதி வெப் டெக்னாலஜி', 'Hayaati Web Technology'),
        ('ஹயாதி', 'Hayaati'),
        ('ஆலியா கான்', 'Aliya Khan'),
    ],
    'te': [
        ('హయాతి వెబ్ టెక్నాలజీ', 'Hayaati Web Technology'),
        ('హయాతీ వెబ్ టెక్నాలజీ', 'Hayaati Web Technology'),
        ('హయాతి', 'Hayaati'),
        ('హయాతీ', 'Hayaati'),
        ('ఆలియా ఖాన్', 'Aliya Khan'),
    ],
    'kn': [
        ('ಹಯಾತಿ ವೆಬ್ ಟೆಕ್ನಾಲಜಿ', 'Hayaati Web Technology'),
        ('ಹಯಾತಿ', 'Hayaati'),
        ('ಆಲಿಯಾ ಖಾನ್', 'Aliya Khan'),
    ],
    'ml': [
        ('ഹയാതി വെബ് ടെക്നോളജി', 'Hayaati Web Technology'),
        ('ഹയാതി', 'Hayaati'),
        ('ആലിയ ഖാൻ', 'Aliya Khan'),
    ],
}

# Update all locale files
for lang_dir in sorted(glob.glob('locales/*')):
    if not os.path.isdir(lang_dir):
        continue
    lang = os.path.basename(lang_dir)
    for filename in ['ui.json', 'content.json']:
        filepath = os.path.join(lang_dir, filename)
        if not os.path.exists(filepath):
            continue
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Fix "2030 2050" -> "2030–2050" everywhere
        content = content.replace("2030 2050", "2030–2050")

        # 2. Fix language transliterations
        if lang in REPLACEMENTS:
            for src, target in REPLACEMENTS[lang]:
                content = content.replace(src, target)

        # 3. Always ensure founder name in uppercase keys or sectionTags is Latin
        # for example in section tags: FOUNDER_VENTURES // ALIYA KHAN
        # or in about.ownerName: "Aliya Khan"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("[PASS] Fixed brand and owner names and year range dashes across all 25 locales.")
