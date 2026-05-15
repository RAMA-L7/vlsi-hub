# VLSI Hub

> Open source EDA intelligence platform for synthesis and layout engineers.

Parse logs, analyse timing reports, compare synthesis runs, track QoR trends, and validate SDC constraints — all in one place. Supports Design Compiler, Genus, PrimeTime, ICC2, and Innovus.

---

## Live demo

🔗 [vlsi-hub.vercel.app](https://vlsi-hub.vercel.app) *(deploy your own — see below)*

---

## Features

### 📊 Overview
- Live stat cards — errors, warnings, WNS, violating paths
- Issues by category chart (timing, elaboration, netlist, physical)
- Clock domain health table
- QoR trend sparkline

### 🔍 Log Analyzer
- Drag-and-drop log upload — auto-detects tool (DC / Genus / PT / ICC2 / Innovus)
- Group repeated errors by code (e.g. `OPT-110 ×15`)
- Filter by severity and category
- Expand any entry for a fix suggestion
- CSV export

### ⏱ Timing Viewer
- Upload `.rpt` timing reports
- WNS / TNS / violating paths summary
- Slack histogram — see how many paths are in each slack bucket
- Per clock domain bar chart
- Sortable critical paths table with detail panel
- CSV export

### 🔀 Run Comparison
- Upload multiple log files, select any two as A and B
- Delta cards — error delta, warning delta, WNS delta, TNS delta
- Per-category diff breakdown
- New / Fixed / Remaining issue tabs
- Verdict banner

### 📈 QoR Trends
- Unlimited run upload — track WNS, TNS, errors, warnings, cells, area
- WNS regression threshold line — dots turn red below threshold
- Area chart with metric selector
- 4-chart mini grid
- Runs table with sort controls

### 🛡 SDC Tools
- **Checker** — validates `.sdc` files against 8 errors, 15 warnings, 26 best-practice checks. Detects virtual clocks, half-cycle paths, missing hold fixes, and more
- **Generator** — builds a complete SDC from a form. Full `create_generated_clock` switch set (`-divide_by`, `-multiply_by`, `-duty_cycle`, `-invert`, `-preinvert`, `-combinational`, `-add`). Virtual clocks, case analysis, disable timing arcs, half-cycle paths, AOCV derate, power constraints
- Download generated `.sdc` directly

### ⚡ Fixes Advisor
- Per-error fix hints (OPT-001, OPT-110, ELAB-302, TIM-104, and more)
- General synthesis best-practice cards

---

## Supported tools

| Tool | Version |
|------|---------|
| Design Compiler | DC Shell R-2020+ |
| Genus | Genus Synthesis Solution |
| PrimeTime | PT Shell |
| IC Compiler II | ICC2 Shell |
| Innovus | Innovus Implementation System |

---

## Quick start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/vlsi-hub.git
cd vlsi-hub

# Install
npm install

# Run locally
npm run dev
```

Open `http://localhost:5173` — no backend needed, all parsing runs in the browser.

---

## Deploy to Vercel (free, 2 minutes)

### Option 1 — Vercel dashboard
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Leave all settings as default — Vercel auto-detects Vite
5. Click **Deploy**

Your live URL: `https://vlsi-hub.vercel.app`

### Option 2 — Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## Build for production

```bash
npm run build
```

Output goes to `dist/` — static files you can host anywhere (Nginx, S3, GitHub Pages, etc.)

---

## Project structure

```
vlsi-hub/
├── src/
│   ├── main.jsx        ← React entry point
│   └── App.jsx         ← Full application (single-file component)
├── public/
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## Related project

**SDC Tools** — standalone Streamlit app for SDC validation and generation
→ [github.com/YOUR_USERNAME/sdc-tools](https://github.com/YOUR_USERNAME/sdc-tools)

---

## Roadmap

- [ ] AI "Ask Your Run" — chat with your log using Claude API
- [ ] Backend API (FastAPI) for persistent run storage
- [ ] Regression alerts — Slack/email when WNS degrades
- [ ] SDC constraint checker integrated with log runs
- [ ] CLI uploader — `vlsi-hub upload ./logs/`
- [ ] Multi-user projects

---

## Contributing

Pull requests welcome. Please open an issue first to discuss major changes.

---

## License

MIT © VLSI Hub Contributors
