"""Buat quality profile "Audit Kompleksitas" (salinan Sonar way) untuk TS dan JS,
aktifkan S3776 dan S1541 dengan ambang 0, lalu pasang ke proyek lab-industri.

Pemakaian (dari folder audit/sonar), setelah proyek lab-industri dibuat di UI:
    python setup_profile.py
Token (User Token) dibaca dari environment variable SONAR_TOKEN.
Aman dijalankan ulang: profile yang sudah ada dipakai ulang.
"""
import base64
import json
import os
import urllib.parse
import urllib.request

HOST = os.environ.get("SONAR_HOST", "http://localhost:9000")
PROYEK = "lab-industri"
NAMA = "Audit Kompleksitas"
AUTH = {"Authorization": "Basic " + base64.b64encode((os.environ["SONAR_TOKEN"] + ":").encode()).decode()}
# bahasa -> (repo aturan, nama parameter ambang S1541)
BAHASA = {"ts": ("typescript", "Threshold"), "js": ("javascript", "maximumFunctionComplexityThreshold")}


def api(path, post=None, **params):
    data = urllib.parse.urlencode(post).encode() if post is not None else None
    req = urllib.request.Request(f"{HOST}{path}?{urllib.parse.urlencode(params)}", data=data, headers=AUTH)
    body = urllib.request.urlopen(req).read()
    return json.loads(body) if body else None


def main():
    for lang, (repo, param_cc) in BAHASA.items():
        profil = {p["name"]: p for p in api("/api/qualityprofiles/search", language=lang)["profiles"]}
        if NAMA in profil:
            kunci = profil[NAMA]["key"]
        else:
            sumber = next(p for p in profil.values() if p["isBuiltIn"] and p["name"] == "Sonar way")
            kunci = api("/api/qualityprofiles/copy", post={"fromKey": sumber["key"], "toName": NAMA})["key"]
        api("/api/qualityprofiles/activate_rule", post={"key": kunci, "rule": f"{repo}:S3776", "params": "threshold=0"})
        api("/api/qualityprofiles/activate_rule", post={"key": kunci, "rule": f"{repo}:S1541", "params": f"{param_cc}=0"})
        api("/api/qualityprofiles/add_project", post={"language": lang, "qualityProfile": NAMA, "project": PROYEK})
        aktif = api("/api/rules/search", qprofile=kunci, activation="true", f="actives", ps=500)["actives"]
        print(lang, NAMA, {r: aktif[r][0]["params"] for r in (f"{repo}:S3776", f"{repo}:S1541")})


if __name__ == "__main__":
    main()
