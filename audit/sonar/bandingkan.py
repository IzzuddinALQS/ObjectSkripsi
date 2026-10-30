"""Bandingkan CC/CogC SonarQube (sonar_per_fungsi.csv) dengan ESLint (../hasil_audit.json).

Hanya cakupan proposal (app/, features/, lib/). Dicocokkan berdasarkan (berkas, baris).
Beberapa fungsi bisa berada pada baris yang sama (arrow function bertingkat), jadi nilai
dibandingkan sebagai multiset per lokasi, dan hitungan dilaporkan per fungsi.
Nilai ESLint dibaca langsung dari JSON mentah (bukan audit_per_fungsi.csv), karena kolom CogC
di CSV itu digabung per (berkas, baris) sehingga bisa tersalin ke fungsi lain di baris yang sama.
Pemakaian (dari folder audit/sonar): python bandingkan.py > perbandingan.txt
"""
import csv
import json
import re
from collections import defaultdict

DIR = ("app/", "features/", "lib/")
ATURAN_ESLINT = {"S1541": ("complexity", r"complexity of (\d+)"),
                 "S3776": ("sonarjs/cognitive-complexity", r"from (\d+)")}

eslint = {k: defaultdict(list) for k in ATURAN_ESLINT}
for f in json.load(open("../hasil_audit.json", encoding="utf-8")):
    p = f["filePath"].replace("\\", "/")
    for akar in ("lab-industri/", "LAB-INDUSTRI/", "ObjectSkripsi/"):
        if akar in p:
            p = p.split(akar, 1)[1]
    if not p.startswith(DIR):
        continue
    for m in f["messages"]:
        for kode, (rule, pola) in ATURAN_ESLINT.items():
            if m.get("ruleId") == rule:
                eslint[kode][(p, m["line"])].append(int(re.search(pola, m["message"]).group(1)))

sonar = {k: defaultdict(list) for k in ATURAN_ESLINT}
for r in csv.DictReader(open("sonar_per_fungsi.csv", encoding="utf-8")):
    sonar[r["aturan"].split(":")[1]][(r["berkas"], int(r["baris"]))].append(int(r["nilai"]))


def bandingkan(judul, kode):
    e, s = eslint[kode], sonar[kode]
    sama = beda = 0
    contoh, lebih_besar = [], {"ESLint": 0, "SonarQube": 0}
    for k in sorted(set(e) | set(s)):
        a, b = sorted(e.get(k, [])), sorted(s.get(k, []))
        if a == b:
            sama += len(a)
            continue
        beda += max(len(a), len(b))
        lebih_besar["ESLint" if sum(a) > sum(b) else "SonarQube"] += 1
        contoh.append((k, a, b))
    print(f"\n== {judul} ==")
    print(f"Fungsi dilaporkan ESLint   : {sum(map(len, e.values()))}")
    print(f"Issue SonarQube {kode}      : {sum(map(len, s.values()))}")
    print(f"Fungsi dengan nilai sama   : {sama}")
    print(f"Fungsi dengan nilai beda   : {beda}  (lokasi: ESLint lebih besar {lebih_besar['ESLint']}, "
          f"SonarQube lebih besar {lebih_besar['SonarQube']})")
    if contoh:
        print("Contoh perbedaan terbesar (berkas:baris ESLint vs SonarQube):")
        for (p, ln), a, b in sorted(contoh, key=lambda x: -abs(sum(x[1]) - sum(x[2])))[:15]:
            print(f"  {p}:{ln}  ESLint={a}  SonarQube={b}")


bandingkan("Cognitive Complexity (eslint-plugin-sonarjs vs S3776)", "S3776")
bandingkan("Cyclomatic Complexity (ESLint complexity vs S1541)", "S1541")
