# Deployment Guide — VLSI Hub + SDC Tools

Step-by-step to go from zero to two live URLs, completely free.

---

## Step 1 — Create GitHub repos

1. Go to [github.com](https://github.com) → sign in (or create free account)
2. Click the **+** icon → **New repository**
3. Create **two repos**:

| Repo name   | Visibility | Description |
|-------------|-----------|-------------|
| `vlsi-hub`  | Public    | Open source EDA intelligence platform |
| `sdc-tools` | Public    | SDC constraint checker and generator  |

Leave them empty (no README, no .gitignore) — you'll push from your machine.

---

## Step 2 — Push VLSI Hub to GitHub

Unzip `vlsi-hub.zip` and run:

```bash
cd vlsi-hub

# Initialize git
git init
git add .
git commit -m "Initial release: VLSI Hub v0.7.0"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/vlsi-hub.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Push SDC Tools to GitHub

Unzip `sdc-tools.zip` and run:

```bash
cd sdc-tools

git init
git add .
git commit -m "Initial release: SDC Tools v1.0"

git remote add origin https://github.com/YOUR_USERNAME/sdc-tools.git
git branch -M main
git push -u origin main
```

---

## Step 4 — Deploy VLSI Hub to Vercel (free)

1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Click **Add New → Project**
3. Find `vlsi-hub` in the list → **Import**
4. Vercel auto-detects it as a Vite project — leave all settings as default
5. Click **Deploy**

✅ Done — your live URL: `https://vlsi-hub.vercel.app`

Every time you `git push` to GitHub, Vercel auto-deploys.

---

## Step 5 — Deploy SDC Tools to Streamlit Cloud (free)

1. Go to [share.streamlit.io](https://share.streamlit.io) → **Sign in with GitHub**
2. Click **New app**
3. Select:
   - Repository: `YOUR_USERNAME/sdc-tools`
   - Branch: `main`
   - Main file path: `app.py`
4. Click **Deploy**

✅ Done — your live URL: `https://YOUR_USERNAME-sdc-tools-app-xxxxx.streamlit.app`

---

## Step 6 — Update README links

Once both are live, update the README files with your actual URLs:

In `vlsi-hub/README.md`:
```markdown
🔗 [vlsi-hub.vercel.app](https://vlsi-hub.vercel.app)
```

In `sdc-tools/README.md`:
```markdown
🔗 [your-sdc-tools-url.streamlit.app](https://your-url.streamlit.app)
```

Then push again:
```bash
git add README.md
git commit -m "Add live demo links"
git push
```

---

## Summary

| Project    | GitHub                          | Live URL                        | Platform        |
|------------|---------------------------------|---------------------------------|-----------------|
| VLSI Hub   | github.com/YOU/vlsi-hub         | vlsi-hub.vercel.app             | Vercel (free)   |
| SDC Tools  | github.com/YOU/sdc-tools        | YOU-sdc-tools.streamlit.app     | Streamlit (free)|

**Total cost: $0/month**

---

## Running locally (optional)

**VLSI Hub:**
```bash
cd vlsi-hub
npm install
npm run dev
# → http://localhost:5173
```

**SDC Tools:**
```bash
cd sdc-tools
pip install -r requirements.txt
streamlit run app.py
# → http://localhost:8501
```
