"""Ringkas hasil audit ESLint (format JSON) menjadi tabel distribusi risiko + CSV.

Pemakaian:
    python ringkas_audit.py hasil_audit.json
Keluaran:
    - ringkasan di layar untuk dua cakupan: (A) app/features/lib, (B) seluruh repo
    - audit_per_fungsi.csv  (semua fungsi, cakupan seluruh repo, ada kolom 'cakupan_ABC')
"""
import csv
import json
import re
import sys
from collections import Counter

DIR_PENELITIAN = ("app/", "features/", "lib/")


def kategori(cc):
    if cc <= 10:
        return "Low"
    if cc <= 20:
        return "Moderate"
    if cc <= 50:
        return "High"
    return "Very High"


def main(path):
    data = json.load(open(path, encoding="utf-8"))
    fungsi, cogc, gagal = [], {}, []
    for f in data:
        p = f["filePath"].replace("\\", "/")
        # path relatif terhadap root repo
        for akar in ("lab-industri/", "LAB-INDUSTRI/", "ObjectSkripsi/"):
            if akar in p:
                p = p.split(akar, 1)[1]
        for m in f["messages"]:
            if m.get("fatal"):
                gagal.append((p, m["message"]))
            elif m.get("ruleId") == "complexity":
                cc = int(re.search(r"complexity of (\d+)", m["message"]).group(1))
                nama = re.match(r"(.*?) has a complexity", m["message"]).group(1)
                fungsi.append([p, m["line"], nama, cc])
            elif m.get("ruleId") == "sonarjs/cognitive-complexity":
                v = re.search(r"from (\d+)", m["message"])
                if v:
                    cogc[(p, m["line"])] = int(v.group(1))

    def cetak(judul, daftar):
        k = Counter(kategori(x[3]) for x in daftar)
        di_atas = k["Moderate"] + k["High"] + k["Very High"]
        print(f"\n== {judul} ==")
        print(f"Total fungsi : {len(daftar)}")
        for kat in ("Low", "Moderate", "High", "Very High"):
            print(f"  {kat:<10}: {k[kat]}")
        print(f"CC > 10      : {di_atas}")

    cetak("A. Cakupan proposal (app/, features/, lib/)",
          [x for x in fungsi if x[0].startswith(DIR_PENELITIAN)])
    cetak("B. Seluruh repo (semua .ts/.tsx)", fungsi)

    if gagal:
        print("\nBerkas gagal diurai (fungsinya TIDAK terhitung):")
        for p, msg in gagal:
            print(f"  - {p}: {msg}")

    with open("audit_per_fungsi.csv", "w", newline="", encoding="utf-8") as out:
        w = csv.writer(out)
        w.writerow(["berkas", "baris", "fungsi", "CC", "CogC", "kategori", "cakupan_proposal"])
        for p, line, nama, cc in sorted(fungsi, key=lambda x: -x[3]):
            w.writerow([p, line, nama, cc, cogc.get((p, line), 0), kategori(cc),
                        "ya" if p.startswith(DIR_PENELITIAN) else "tidak"])
    print("\nTersimpan: audit_per_fungsi.csv")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "hasil_audit.json")
