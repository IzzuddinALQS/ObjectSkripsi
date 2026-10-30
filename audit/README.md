# Mengulang audit kompleksitas di komputer lain

Prasyarat: Git, Node.js + npm, Python 3, Docker Desktop (engine running).
Hasil dan versi acuan ada di [LAPORAN_AUDIT.md](LAPORAN_AUDIT.md).

## 0. Clone

```
git clone https://github.com/IzzuddinALQS/ObjectSkripsi.git
cd ObjectSkripsi
```

Jangan ganti nama folder: `ringkas_audit.py` hanya mengenali akar `ObjectSkripsi`, `lab-industri`,
atau `LAB-INDUSTRI`. Nama lain membuat cakupan A terbaca 0.

Untuk mengukur commit yang sama dengan laporan, checkout kode aplikasinya:
`git checkout ebd45d8 -- app features lib` (opsional; kembalikan dengan `git checkout HEAD -- app features lib`).

## 1. ESLint

```
cd audit
npm ci
cd ..
npx --prefix audit eslint --no-config-lookup -c audit/eslint.audit.mjs -f json . > audit/hasil_audit.json
cd audit
python ringkas_audit.py hasil_audit.json
```

`npm ci` memasang versi persis dari `package-lock.json`. Exit code 1 dari ESLint itu normal.

## 2. SonarQube

Image dikunci dengan digest agar versinya sama dengan laporan
(SonarQube 26.10.0.133078, SonarScanner CLI 8.1.0.6389):

```
docker run -d --name sonarqube -p 9000:9000 sonarqube@sha256:f95aaa9016dd4e92c7d70691167a6d96dbb5d8acffd61eba1cb4335d364a7840
```

Tunggu sampai http://localhost:9000/api/system/status menunjukkan `"UP"`, lalu di browser:

1. Login `admin` / `admin`, ganti password.
2. **Create Project → Local project**, nama dan key `lab-industri`, **Use the global setting**.
3. **My Account → Security**, buat **User Token**.
4. Simpan token di environment (PowerShell), jangan di berkas:
   ```powershell
   $env:SONAR_TOKEN = "TOKEN_ANDA"
   ```

Buat profile, scan, ambil data (PowerShell, dari root repo):

```powershell
python audit\sonar\setup_profile.py
docker run --rm -e SONAR_HOST_URL=http://host.docker.internal:9000 -e SONAR_TOKEN=$env:SONAR_TOKEN -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli@sha256:47956b669bf486bdad919e1cbd0533223515aa0b6d1d31763e5a3754942df6d7
cd audit\sonar
# tunggu analisis selesai diproses (Background Tasks di UI berstatus SUCCESS)
python ambil_sonar.py
python bandingkan.py > perbandingan.txt
```

Di Linux, ganti `host.docker.internal` dengan `localhost` dan tambahkan `--network host`.

Setelah selesai, hapus token: `Remove-Item Env:SONAR_TOKEN`, dan cabut token di **My Account → Security**.
