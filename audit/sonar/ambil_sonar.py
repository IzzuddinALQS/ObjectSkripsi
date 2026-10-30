"""Ambil metrik per berkas dan issue kompleksitas per fungsi dari SonarQube Web API.

Pemakaian (dari folder audit/sonar):
    python ambil_sonar.py
Token dibaca dari environment variable SONAR_TOKEN (tidak disimpan di berkas).
Keluaran:
    - measures_component_tree.json, issues_kompleksitas.json  (data mentah API)
    - sonar_per_berkas.csv  (berkas, complexity, cognitive_complexity, ncloc)
    - sonar_per_fungsi.csv  (berkas, baris, aturan, nilai)
"""
import base64
import csv
import json
import os
import re
import urllib.parse
import urllib.request

HOST = os.environ.get("SONAR_HOST", "http://localhost:9000")
PROYEK = "lab-industri"
ATURAN = "typescript:S3776,javascript:S3776,typescript:S1541,javascript:S1541"
AUTH = {"Authorization": "Basic " + base64.b64encode((os.environ["SONAR_TOKEN"] + ":").encode()).decode()}


def get(path, **params):
    url = f"{HOST}{path}?{urllib.parse.urlencode(params)}"
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=AUTH)))


def semua_halaman(path, kunci, **params):
    hasil, p = [], 1
    while True:
        d = get(path, p=p, ps=500, **params)
        hasil += d[kunci]
        total = d["paging"]["total"] if "paging" in d else d["total"]
        if p * 500 >= total:
            return hasil
        p += 1


def main():
    berkas = semua_halaman("/api/measures/component_tree", "components", component=PROYEK,
                           metricKeys="complexity,cognitive_complexity,ncloc", qualifiers="FIL")
    json.dump(berkas, open("measures_component_tree.json", "w", encoding="utf-8"), indent=1)
    with open("sonar_per_berkas.csv", "w", newline="", encoding="utf-8") as out:
        w = csv.writer(out)
        w.writerow(["berkas", "complexity", "cognitive_complexity", "ncloc"])
        for c in sorted(berkas, key=lambda c: c["path"]):
            m = {x["metric"]: x.get("value", "") for x in c["measures"]}
            w.writerow([c["path"], m.get("complexity", ""), m.get("cognitive_complexity", ""), m.get("ncloc", "")])

    issues = semua_halaman("/api/issues/search", "issues", componentKeys=PROYEK, rules=ATURAN)
    json.dump(issues, open("issues_kompleksitas.json", "w", encoding="utf-8"), indent=1)
    with open("sonar_per_fungsi.csv", "w", newline="", encoding="utf-8") as out:
        w = csv.writer(out)
        w.writerow(["berkas", "baris", "aturan", "nilai"])
        for i in sorted(issues, key=lambda i: (i["component"], i.get("line", 0), i["rule"])):
            # S3776: "...from 23 to the 0 allowed."  S1541: "...complexity of 12 which is greater than 0..."
            v = re.search(r"from (\d+) to|complexity of (\d+)", i["message"])
            w.writerow([i["component"].split(":", 1)[1], i.get("line", ""), i["rule"],
                        next(g for g in v.groups() if g) if v else ""])
    print(f"{len(berkas)} berkas, {len(issues)} issue tersimpan.")


if __name__ == "__main__":
    main()
