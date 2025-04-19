# utils/preprocessing.py

import pandas as pd
import re
import pickle
import faiss
import numpy as np
from langdetect import detect
from indic_transliteration.sanscript import transliterate, DEVANAGARI, ITRANS
from sentence_transformers import SentenceTransformer

# SBERT model (load only once)
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

def clean_text(text):
    text = text.strip().lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text

def transliterate_if_needed(text):
    try:
        lang = detect(text)
        if lang in ['hi', 'mr', 'bn']:
            return transliterate(text, DEVANAGARI, ITRANS)
    except:
        pass
    return text

def preprocess_title(title):
    cleaned = clean_text(title)
    transliterated = transliterate_if_needed(cleaned)
    final = clean_text(transliterated)
    return final

def preprocess_and_index(csv_path, out_dir='preprocessed'):
    # Step 1: Read and preprocess titles
    df = pd.read_csv(csv_path)
    titles = df['Title Name'].dropna().unique().tolist()
    preprocessed_titles = [preprocess_title(title) for title in titles]

    # Step 2: Generate embeddings
    embeddings = model.encode(preprocessed_titles, convert_to_numpy=True)

    # Step 3: Create FAISS index
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings))

    # Step 4: Save data
    with open(f'{out_dir}/preprocessed_titles.pkl', 'wb') as f:
        pickle.dump(preprocessed_titles, f)

    with open(f'{out_dir}/embeddings.npy', 'wb') as f:
        np.save(f, embeddings)

    faiss.write_index(index, f'{out_dir}/faiss_index.index')

    print(f"[✅] Saved {len(preprocessed_titles)} preprocessed titles and FAISS index to '{out_dir}'")

    return preprocessed_titles, embeddings, index
