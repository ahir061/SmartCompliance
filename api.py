from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from openai import OpenAI
import json
import re

app = Flask(__name__)
CORS(app)

# ========= LLM CONFIG =========
LLM_API_URL = ""
LLM_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
client = OpenAI(api_key="EMPTY", base_url=LLM_API_URL)

# ========= DB CONFIG =========
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "rbi_data"
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# =====================================================
# 📌 Chat Endpoint (FinArthGPT)
# =====================================================
@app.post("/chat")
def chat_llm():
    data = request.get_json(force=True)
    user_query = data.get("message", "").strip()

    if not user_query:
        return jsonify({"reply": "Please enter a valid question."}), 400

    system_prompt = """
You are BankLLM — an expert AI trained on RBI, SEBI, FEMA, NBFC and Indian financial compliance.
Rules:
- Give clear, accurate regulatory answers.
- Never generate laws or circulars that don't exist.
- Keep responses concise unless asked for depth.
- Avoid markdown unless necessary.
- Tone: professional.
"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            temperature=0.2,
            max_tokens=900
        )
        reply = response.choices[0].message.content.strip()
        reply = re.sub(r"[*_•#\-]+", "", reply).strip()

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({
            "reply": "FinArthGPT is currently unavailable.",
            "details": str(e)
        }), 500

# =====================================================
# 📌 RBI Circular List (existing logic untouched)
# =====================================================
@app.get("/circulars")
def get_circulars():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, circular_number, date_of_issue,
                   department, subject, meant_for
            FROM circulars
            ORDER BY date_of_issue DESC;
        """)

        return jsonify(cursor.fetchall())

    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# =====================================================
# 📌 NEW — SEBI Circular List (does NOT affect RBI)
# =====================================================
@app.get("/sebi-circulars")
def get_sebi_circulars():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, circular_date AS date_of_issue,
                   title AS subject,
                   link AS circular_url,
                   department
            FROM sebi_circulars
            ORDER BY circular_date DESC;
        """)

        return jsonify(cursor.fetchall())

    except Exception as e:
        return jsonify({"error": "DB error", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# =====================================================
# 📌 Reference List
# =====================================================
@app.get("/circulars/<int:circ_id>/references")
def get_references(circ_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, reference_text, reference_url,
                   link_type, is_pdf
            FROM circular_references
            WHERE circular_id = %s
        """, (circ_id,))

        refs = cursor.fetchall()

    except Exception as e:
        return jsonify({"error": "DB error", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

    external, internal = [], []

    for r in refs:
        text = (r["reference_text"] or "").lower()
        url  = (r["reference_url"] or "").lower()
        link = (r["link_type"] or "").lower()

        if "rbi.org" in url or "fema" in text or link in ("master direction", "notification"):
            external.append(r)
        else:
            internal.append(r)

    return jsonify({
        "external": external,
        "internal": internal,
        "count": len(refs)
    })

# =====================================================
# 📌 Reference Details
# =====================================================
@app.get("/circulars/<int:circ_id>/references/<int:ref_id>")
def get_single_reference(circ_id, ref_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, circular_id, reference_text, reference_url,
                   link_type, is_pdf, pdf_text, created_at
            FROM circular_references
            WHERE id = %s AND circular_id = %s
        """, (ref_id, circ_id))

        ref = cursor.fetchone()

        if not ref:
            return jsonify({"error": "Reference not found"}), 404

        ref["is_pdf"] = True if ref["is_pdf"] == 1 else False

        return jsonify(ref)

    finally:
        cursor.close()
        conn.close()

# =====================================================
# 🧠 Reference Summary (LLM)
# =====================================================
@app.get("/circulars/<int:circ_id>/references/<int:ref_id>/summary-live")
def summarize_reference(circ_id, ref_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT reference_text, pdf_text
            FROM circular_references
            WHERE id = %s AND circular_id = %s
        """, (ref_id, circ_id))

        ref = cursor.fetchone()

    finally:
        cursor.close()
        conn.close()

    if not ref:
        return jsonify({"summary": "Reference not found"}), 404

    pdf_text = ref["pdf_text"]
    title = ref["reference_text"]

    if not pdf_text:
        return jsonify({"summary": "No extracted PDF text available."})

    text_slice = pdf_text[:20000]

    prompt = f"""
You are a senior RBI compliance expert.
Write a clean plain-text summary (NO markdown).

Reference: {title}

Text:
{text_slice}
"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.25,
            max_tokens=700
        )

        summary = response.choices[0].message.content.strip()
        summary = re.sub(r"[*_#•\-]+", "", summary).strip()

        return jsonify({"summary": summary})

    except Exception as e:
        return jsonify({"summary": "LLM summarization failed", "details": str(e)}), 503

# =====================================================
# 🧩 CHAPTER GENERATION (LLM)
# =====================================================
@app.get("/references/<int:ref_id>/chapters-live")
def generate_reference_chapters(ref_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT reference_text, pdf_text
            FROM circular_references
            WHERE id = %s
        """, (ref_id,))
        
        ref = cursor.fetchone()

    finally:
        cursor.close()
        conn.close()

    if not ref:
        return jsonify({"chapters": []})

    text = ref["pdf_text"] or ref["reference_text"] or ""
    text_slice = text[:7000]

    prompt = f"""
You are an RBI compliance analyst.
Generate 4–6 chapters.
Short titles only (3–7 words).
Return ONLY this JSON:
[
  {{ "title": "..." }}
]

Text:
{text_slice}
"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=350
        )

        raw = response.choices[0].message.content.strip()
        json_payload = raw[raw.find("["): raw.rfind("]")+1]
        chapters = json.loads(json_payload)

        for i, ch in enumerate(chapters):
            ch["id"] = f"{i+1}.0"

        return jsonify({"chapters": chapters})

    except Exception as e:
        return jsonify({"chapters": [], "details": str(e)}), 503

# =====================================================
# 📝 CHAPTER SUMMARY (LLM)
# =====================================================
@app.get("/references/<int:ref_id>/chapter-summary")
def chapter_summary(ref_id):
    chapter_title = request.args.get("title", "")

    if not chapter_title:
        return jsonify({"summary": "Invalid chapter title"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT pdf_text, reference_text FROM circular_references WHERE id=%s", (ref_id,))
        ref = cursor.fetchone()

    finally:
        cursor.close()
        conn.close()

    if not ref:
        return jsonify({"summary": "Reference not found"}), 404

    text = ref["pdf_text"] or ref["reference_text"]
    text_slice = text[:9000]

    prompt = f"""
You are an RBI compliance expert.
Write a concise 3–4 sentence summary for:
\"{chapter_title}\"

Context:
{text_slice}
"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=300
        )

        summary = response.choices[0].message.content.strip()
        summary = re.sub(r"[#*_•\-]+", "", summary).strip()

        return jsonify({"summary": summary})

    except Exception as e:
        return jsonify({"summary": "Failed to load summary.", "details": str(e)})

# =====================================================
# 📄 Circular Summary
# =====================================================
@app.get("/circulars/<int:circ_id>/summary-live")
def summarize_live(circ_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT subject, pdf_text FROM circulars WHERE id=%s", (circ_id,))
        row = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not row:
        return jsonify({"error": "Circular not found"}), 404

    subject, pdf_text = row
    if not pdf_text:
        return jsonify({"summary": "No PDF text available."})

    text_slice = pdf_text[:20000]

    prompt = f"""
You are an RBI regulatory expert.
Write a short plain-text summary.

Circular: {subject}

Text:
{text_slice}
"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.25,
            max_tokens=900
        )

        summary = response.choices[0].message.content.strip()
        summary = re.sub(r"[#*_•\-]+", "", summary).strip()

        return jsonify({"summary": summary})

    except Exception:
        return jsonify({"summary": "LLM summarization failed"}), 503

# =====================================================
# 🧠 CLAUSES
# =====================================================
@app.get("/circulars/<int:circ_id>/clauses-live")
def extract_clauses_live(circ_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT subject, pdf_text FROM circulars WHERE id=%s", (circ_id,))
        row = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not row:
        return jsonify({"error": "Circular not found"}), 404

    subject, pdf_text = row
    if not pdf_text:
        return jsonify({"clauses": []})

    text_slice = pdf_text[:25000]

    prompt = f"""
Extract compliance clauses only.

Return ONLY JSON:
[
  {{ "clause": "", "impact": "", "penalty": "" }}
]

Text:
{text_slice}
"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1500
        )

        raw = response.choices[0].message.content
        cleaned = raw[raw.find("["): raw.rfind("]")+1]
        clauses = json.loads(cleaned)

        for i, c in enumerate(clauses):
            c["number"] = i + 1

        return jsonify({"clauses": clauses})

    except:
        return jsonify({"clauses": []})

# =====================================================
# 🧠 INSIGHTS
# =====================================================
@app.get("/circulars/<int:circ_id>/insights-live")
def insights_live(circ_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT subject, pdf_text FROM circulars WHERE id=%s", (circ_id,))
        row = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not row:
        return jsonify({"error": "Circular not found"}), 404

    subject, pdf_text = row
    if not pdf_text:
        return jsonify({
            "organizationImpact": "",
            "technicalChanges": "",
            "operationalChanges": "",
            "disclosureAreas": ""
        })

    text_slice = pdf_text[:18000]

    prompt = f"""
Return JSON ONLY:

{{
  "organizationImpact": "",
  "technicalChanges": "",
  "operationalChanges": "",
  "disclosureAreas": ""
}}

Text:
{text_slice}
"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=900
        )

        raw = response.choices[0].message.content
        cleaned = raw[raw.find("{"): raw.rfind("}")+1]
        data = json.loads(cleaned)

        return jsonify(data)

    except:
        return jsonify({
            "organizationImpact": "",
            "technicalChanges": "",
            "operationalChanges": "",
            "disclosureAreas": ""
        })

# =====================================================
# 🧠 GENERATE ACTIONABLES FOR A CLAUSE
# =====================================================
@app.post("/generate-actionables")
def generate_actionables():
    data = request.get_json(force=True)
    clause_text = data.get("clause", "").strip()

    if not clause_text:
        return jsonify({"actionables": [], "error": "Clause text missing"}), 400

    prompt = f"""
Convert the following regulatory clause into 3 structured actionables.
Use JSON ONLY in this format:

[
  {{
    "title": "",
    "description": "",
    "departments": ["Compliance", "Accounts"]
  }}
]

Clause:
{clause_text}
"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=600
        )

        raw = response.choices[0].message.content.strip()

        json_data = raw[raw.find("["): raw.rfind("]")+1]
        actionables = json.loads(json_data)

        return jsonify({ "actionables": actionables })

    except Exception as e:
        print("ERROR:", e)  
        return jsonify({ "actionables": [] })


# =====================================================
# RUN SERVER
# =====================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
