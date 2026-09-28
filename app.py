import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from lara_sdk import Credentials, Translator

load_dotenv()

app = Flask(__name__)

# ---- Lara Translate credentials (kept server-side, never sent to the browser) ----
LARA_ACCESS_KEY_ID = os.environ.get("LARA_ACCESS_KEY_ID")
LARA_ACCESS_KEY_SECRET = os.environ.get("LARA_ACCESS_KEY_SECRET")

lara = None
if LARA_ACCESS_KEY_ID and LARA_ACCESS_KEY_SECRET:
    credentials = Credentials(
        access_key_id=LARA_ACCESS_KEY_ID,
        access_key_secret=LARA_ACCESS_KEY_SECRET,
    )
    lara = Translator(credentials)
else:
    print(
        "Warning: LARA_ACCESS_KEY_ID / LARA_ACCESS_KEY_SECRET are not set. "
        "Copy .env.example to .env and add your Lara credentials before translating."
    )


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/health")
def health():
    return jsonify({"ok": True, "laraConfigured": lara is not None})


@app.route("/api/translate", methods=["POST"])
def translate():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    source = data.get("source")
    target = data.get("target")

    if not text:
        return jsonify({"error": 'Field "text" is required.'}), 400
    if not target:
        return jsonify({"error": 'Field "target" (target language code) is required.'}), 400
    if lara is None:
        return jsonify({
            "error": "Lara API is not configured on the server. Add LARA_ACCESS_KEY_ID and "
                     "LARA_ACCESS_KEY_SECRET to your .env file and restart the app."
        }), 500

    # "auto" or empty -> let Lara auto-detect the source language
    source_lang = None if (not source or source == "auto") else source

    try:
        result = lara.translate(text, source=source_lang, target=target)
        translation = result.translation
        if isinstance(translation, list):
            translation = translation[0]
        return jsonify({"translation": translation})
    except Exception as err:  # noqa: BLE001 - surface any SDK/network error as a clean 502
        print("Lara translation error:", err)
        return jsonify({
            "error": "Translation request failed. Check your Lara API credentials, plan limits, "
                     "and network connection."
        }), 502


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)
