import pandas as pd
import numpy as np
import faiss
import pickle
import os
from sentence_transformers import SentenceTransformer
from utils.preprocessing import preprocess_title

# Paths
CSV_PATH = 'data/Titles.csv'
PICKLE_PATH = 'preprocessed/preprocessed_titles.pkl'
FAISS_INDEX_PATH = 'preprocessed/faiss_index.index'
EMBEDDINGS_PATH = 'preprocessed/embeddings.npy'

def preprocess_and_index(csv_path):
    print("[INFO] Loading CSV file...")
    df = pd.read_csv(csv_path)

    if 'Title Name' not in df.columns:
        raise ValueError("'Title Name' column not found in the CSV file")

    original_titles = df['Title Name'].dropna().astype(str).tolist()
    print(f"[INFO] Total titles loaded: {len(original_titles)}")

    # Preprocess
    print("[INFO] Preprocessing titles...")
    processed_titles = [preprocess_title(title) for title in original_titles]

    # Embed titles
    print("[INFO] Loading SentenceTransformer model...")
    model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

    print("[INFO] Generating embeddings...")
    embeddings = model.encode(processed_titles).astype('float32')

    # Save embeddings separately (optional but useful)
    print("[INFO] Saving embeddings as .npy file...")
    os.makedirs(os.path.dirname(EMBEDDINGS_PATH), exist_ok=True)
    np.save(EMBEDDINGS_PATH, embeddings)

    # Build FAISS index
    print("[INFO] Creating FAISS index...")
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    # Save FAISS index
    print("[INFO] Saving FAISS index...")
    faiss.write_index(index, FAISS_INDEX_PATH)

    # Save processed titles and original titles
    print("[INFO] Saving preprocessed titles...")
    with open(PICKLE_PATH, 'wb') as f:
        pickle.dump((processed_titles, original_titles), f)

    print("[✅] Preprocessing, indexing, and saving complete!")

if __name__ == '__main__':
    preprocess_and_index(CSV_PATH)
