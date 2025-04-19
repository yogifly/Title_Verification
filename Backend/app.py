from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz.distance import Levenshtein
from metaphone import doublemetaphone
import traceback
import os
import numpy as np
import faiss
import pickle
from indic_transliteration.sanscript import SCHEMES, transliterate

import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore

from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get the API key securely
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise EnvironmentError("GOOGLE_API_KEY not found in .env")

# Configure the Gemini API client
genai.configure(api_key=api_key)
client = genai.GenerativeModel()

# Initialize Firebase
cred = credentials.Certificate("firebase-adminsdk.json")  # <-- update with your path
firebase_admin.initialize_app(cred)
db = firestore.client()

from restricted_words import restricted_words
from forbidden_prefix_suffix import forbidden_prefix_suffix
from title_verification_utils import preprocess_title

app = Flask(__name__)
CORS(app)

model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# Load preprocessed titles
with open('preprocessed/preprocessed_titles.pkl', 'rb') as f:
    data = pickle.load(f)
    if isinstance(data, tuple):
        processed_titles, original_titles = data
    else:
        processed_titles = data
        original_titles = [""] * len(processed_titles)

title_embeddings = np.load('preprocessed/embeddings.npy').astype('float32')
index = faiss.read_index('preprocessed/faiss_index.index')

def cosine_sim(a, b):
    return cosine_similarity([a], [b])[0][0]

def jaccard_sim(a, b):
    set_a, set_b = set(a.split()), set(b.split())
    return len(set_a & set_b) / len(set_a | set_b) if set_a | set_b else 0.0

def levenshtein_sim(a, b):
    return 1 - Levenshtein.normalized_distance(a, b)

def phonetic_encoding(text):
    return doublemetaphone(text)

def contains_restricted_words(title):
    return any(word.lower() in title.lower() for word in restricted_words)

def has_forbidden_prefix_suffix(title):
    words = title.strip().split()
    if not words:
        return False
    return (words[0] in forbidden_prefix_suffix or words[-1] in forbidden_prefix_suffix)

def romanize_title(title):
    return transliterate(title, SCHEMES['devanagari'], SCHEMES['iast']).lower()

def check_firebase_similarity(new_title_proc):
    from firebase_admin import firestore

    threshold_cosine = 0.7
    threshold_jaccard = 0.5
    threshold_levenshtein = 0.8

    db = firestore.client()
    firebase_titles = []
    docs = db.collection('titles').stream()
    for doc in docs:
        firebase_title = doc.to_dict().get('title', '')
        if firebase_title:
            firebase_titles.append(firebase_title)

    similar_titles = []
    max_score = 0.0
    matched_title = None

    for existing_title_raw in firebase_titles:
        existing_title_proc = preprocess_title(existing_title_raw)

        cosine_score = float(cosine_sim(model.encode([new_title_proc])[0], model.encode([existing_title_proc])[0]))
        jaccard_score = float(jaccard_sim(new_title_proc, existing_title_proc))
        levenshtein_score = float(levenshtein_sim(new_title_proc, existing_title_proc))

        phonetic_new = phonetic_encoding(new_title_proc)
        phonetic_existing = phonetic_encoding(existing_title_proc)
        phonetic_match = any(pn and pn in phonetic_existing for pn in phonetic_new)

        final_score = (cosine_score + jaccard_score + levenshtein_score) / 3
        if phonetic_match:
            final_score += 0.1
        final_score = min(final_score, 1.0)

        final_score = float(round(final_score, 3))
        similar_titles.append((existing_title_raw, final_score))

        if final_score > max_score:
            max_score = final_score
            matched_title = existing_title_raw

    return max_score, matched_title, similar_titles


@app.route('/verify', methods=['POST'])
def verify_title():
    data = request.get_json()
    new_title = data.get('title', '')
    new_title_proc = preprocess_title(new_title)

    constraints_status = {
        "guideline_check": not contains_restricted_words(new_title_proc),
        "prefix_suffix_check": not has_forbidden_prefix_suffix(new_title_proc),
        "similarity_check": True  # updated below
    }

    if not constraints_status["guideline_check"]:
        return jsonify({
            "status": "Rejected",
            "reason": "Contains restricted words",
            "constraint_status": constraints_status,
            "verification_probability": 0
        })

    if not constraints_status["prefix_suffix_check"]:
        return jsonify({
            "status": "Rejected",
            "reason": "Contains forbidden prefix/suffix",
            "constraint_status": constraints_status,
            "verification_probability": 0
        })

    new_embedding = model.encode([new_title_proc]).astype('float32')
    D, I = index.search(new_embedding, 10)

    max_similarity = 0.0
    matched_title = None
    similar_titles = []

    for idx, dist in zip(I[0], D[0]):
        if idx == -1:
            continue

        existing_title_raw = original_titles[idx]
        existing_title_proc = processed_titles[idx]

        cosine_score = float(cosine_sim(new_embedding[0], title_embeddings[idx]))
        jaccard_score = float(jaccard_sim(new_title_proc, existing_title_proc))
        levenshtein_score = float(levenshtein_sim(new_title_proc, existing_title_proc))

        phonetic_new = phonetic_encoding(new_title_proc)
        phonetic_existing = phonetic_encoding(existing_title_proc)
        phonetic_match = any(pn and pn in phonetic_existing for pn in phonetic_new)

        final_score = (cosine_score + jaccard_score + levenshtein_score) / 3
        if phonetic_match:
            final_score += 0.1
        final_score = min(final_score, 1.0)

        final_score = float(round(final_score, 3))
        similar_titles.append((existing_title_raw, final_score))

        if final_score > max_similarity:
            max_similarity = final_score
            matched_title = existing_title_raw

    verification_probability = round(float(max_similarity) * 100, 2)

    # Check local similarity rejection
    if max_similarity >= 0.70:
        constraints_status["similarity_check"] = False
        return jsonify({
            "status": "Rejected",
            "reason": f"Too similar to existing title '{matched_title}'",
            "similarity_score": float(round(max_similarity, 3)),
            "verification_probability": verification_probability,
            "top_matches": similar_titles,
            "constraint_status": constraints_status
        })

    # ✅ Now check similarity with Firebase titles
    firebase_max, firebase_match, firebase_similars = check_firebase_similarity(new_title_proc)
    firebase_verification_probability = round(float(firebase_max) * 100, 2)

    if firebase_max >= 0.70:
        constraints_status["similarity_check"] = False
        return jsonify({
            "status": "Rejected",
            "reason": f"Too similar to a registered title '{firebase_match}'",
            "similarity_score": float(round(firebase_max, 3)),
            "verification_probability": firebase_verification_probability,
            "top_matches": firebase_similars,
            "constraint_status": constraints_status
        })

    # ✅ All checks passed
    return jsonify({
        "status": "Accepted",
        "verification_probability": verification_probability,
        "top_matches": similar_titles + firebase_similars,
        "constraint_status": constraints_status
    })

@app.route('/suggest-title', methods=['POST'])
def suggest_title():
    data = request.get_json()
    abstract = data.get('abstract')
    
    # Modify prompt to ask for clean and structured title suggestions
    prompt = f"Suggest a list of concise, catchy, and professional publication titles based on the following abstract:\n\n{abstract}\n\nProvide only the titles without extra explanations or commentary."

    try:
        gemini_response = client.generate_content(
            contents=prompt
        )

        # Clean up the response to return only titles
        # Strip out any commentary or unnecessary information
        titles = gemini_response.text.strip().split("\n")

        # Ensure only valid titles are returned (removes empty strings or unwanted text)
        titles = [title.strip() for title in titles if title.strip()]

        # Return the cleaned list of titles
        return jsonify({"titles": titles})

    except Exception as e:
        print("Error occurred:", e)
        print("Traceback:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
