# BioHackathon 2026 — Pearl

AI-powered screening tool for PCOS and Endometriosis. Combines an XGBoost ML backend (R) with a Next.js web frontend.

## Running the app

Two terminals are required — one for the R screening API, one for the web app.

### Terminal 1 — R Plumber API

The screening models run as a local REST API on port 8000.

```powershell
cd server/biohackathon2026
Rscript -e "plumber::plumb('plumber.R')`$run(port=8000)"
```

If `Rscript` is not recognised, use the full path (R 4.6.0 on Windows):

```powershell
& "C:\Program Files\R\R-4.6.0\bin\Rscript.exe" -e "plumber::plumb('plumber.R')`$run(port=8000)"
```

To add R to your PATH permanently (run PowerShell as Administrator):

```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\R\R-4.6.0\bin", "Machine")
```

Required R packages (install once):

```r
install.packages(c("plumber", "xgboost", "jsonlite"))
```

### Terminal 2 — Next.js web app

```bash
cd website/biohackathon2026
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it works

1. The user completes a 10-question assessment in the browser.
2. On completion, answers are mapped to numeric model inputs and sent to `POST /api/screen`.
3. The Next.js API route proxies the request to the Plumber API at `http://localhost:8000/stage1`.
4. The Plumber API runs the partial PCOS and Endometriosis XGBoost models and returns screening probabilities.
5. Results are stored in `localStorage` and displayed in the Results page.

## Running the full R screening script (standalone)

To run the two-stage clinical assessment directly in RStudio:

1. Open `hackathon_final/hackathon/app_refined.R` in RStudio.
2. Install dependencies if needed:

   ```r
   install.packages(c("xgboost", "svDialogs", "ggplot2"))
   ```

3. Press `Ctrl+Shift+Enter` to source the file.

The script will prompt for patient inputs via dialog boxes and print a clinical report to the console.

## Project structure

```text
hackathon_final/hackathon/
  app_refined.R                   # Standalone two-stage screening script (RStudio)
  plumber.R                       # REST API wrapping Stage 1 models
  *.rds / *.json                  # Trained XGBoost model files

website/biohackathon2026/
  app/api/screen/route.ts         # Next.js API route (proxies to Plumber)
  components/screens/Assessment.tsx  # 10-question assessment with model input mapping
  components/screens/Results.tsx     # Results page driven by real screening output
```
