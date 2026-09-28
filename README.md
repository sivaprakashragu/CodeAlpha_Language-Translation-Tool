# CodeAlpha_LanguageTranslator (Flask version)

A full-stack Language Translation Tool built for the **CodeAlpha Artificial Intelligence Internship — Task 1**, powered by the [Lara Translate API](https://laratranslate.com/).

- **Frontend:** plain HTML + CSS + JS (`templates/index.html`, `static/style.css`, `static/script.js`) — text input, source/target language dropdowns, swap button, copy button, and text-to-speech playback.
- **Backend:** Python + Flask (`app.py`) calling Lara through the official `lara-sdk` package. Your API credentials stay on the server and are **never** sent to the browser.

## 1. Prerequisites

- [Python](https://www.python.org/) 3.8 or later
- [VS Code](https://code.visualstudio.com/) (or any editor) with the Python extension
- A free Lara Translate account and API credentials — see below

## 2. Get your Lara API credentials

1. Go to [laratranslate.com](https://laratranslate.com/) and sign up (a free plan is available).
2. Open the **API** section of your account and generate a new **Access Key ID** and **Access Key Secret**.
3. Save both immediately — if lost, you'll need to generate a new pair.

## 3. Open the project in VS Code

Unzip this project and open the folder (`File → Open Folder…`), then open a terminal (`` Ctrl+` ``/`` Cmd+` ``).

## 4. Create a virtual environment and install dependencies

```bash
python -m venv .venv

# macOS / Linux
source .venv/bin/activate
# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

VS Code will usually prompt you to select `.venv` as the workspace's Python interpreter — accept that, or set it manually via `Ctrl+Shift+P → Python: Select Interpreter`.

## 5. Add your credentials

```bash
cp .env.example .env
```

Edit `.env`:

```
LARA_ACCESS_KEY_ID=your-access-key-id
LARA_ACCESS_KEY_SECRET=your-access-key-secret
PORT=5000
```

`.env` is already in `.gitignore` — **never commit it to GitHub.**

## 6. Run it

```bash
python app.py
```

Open **http://localhost:5000**. Type text, pick a source and target language (or leave source on "Auto-detect"), and click **Translate**.

The app runs with `debug=True`, so it auto-reloads when you edit `app.py`, `templates/`, or `static/`.

## Project structure

```
CodeAlpha_LanguageTranslator_Flask/
├── app.py               # Flask app + Lara API integration
├── requirements.txt
├── .env.example          # copy to .env and fill in your keys
├── .gitignore
├── templates/
│   └── index.html        # page markup
├── static/
│   ├── style.css         # all styling
│   └── script.js         # frontend logic (calls /api/translate)
└── README.md
```

## How the translation call works

The frontend posts `{ text, source, target }` to `POST /api/translate`. Flask passes that to Lara through the SDK:

```python
result = lara.translate(text, source=source_lang, target=target)
```

Language codes follow the `language-REGION` format Lara expects, e.g. `en-US`, `fr-FR`, `hi-IN`. If `source` is left on "Auto-detect", the server passes `None` and Lara detects the source language automatically.

## Troubleshooting

- **"Lara API credentials are not set on the server"** — you haven't created `.env` yet, or the keys are wrong. Re-check step 5 and restart `python app.py`.
- **502 / translation failed** — usually an invalid key pair, an exhausted free-plan quota, or no internet access from the machine running the server.
- **Port already in use** — change `PORT` in `.env` to something else, e.g. `5001`.
- **`ModuleNotFoundError`** — make sure your virtual environment is activated (you should see `(.venv)` in the terminal prompt) before running `pip install` or `python app.py`.

## Submission checklist (CodeAlpha)

- [ ] Push this folder to a GitHub repo named `CodeAlpha_LanguageTranslator` (keep `.env` and `.venv/` out of the repo — `.gitignore` already handles this)
- [ ] Record a short video walking through the project and post it on LinkedIn with the repo link, tagging @CodeAlpha
- [ ] Submit via the CodeAlpha submission form
