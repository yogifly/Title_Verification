import re
from indic_transliteration.sanscript import transliterate, DEVANAGARI, ITRANS

def transliterate_to_roman(text):
    """
    Convert Devanagari (Hindi/Marathi) text to Roman script.
    If text already in Roman, return as is.
    """
    if re.search("[\u0900-\u097F]", text):  # Devanagari unicode block
        return transliterate(text, DEVANAGARI, ITRANS).lower()
    return text.lower()

def preprocess_title(title):
    """
    Normalize, transliterate (if needed), remove special characters.
    """
    title = transliterate_to_roman(title)
    title = re.sub(r'[^a-zA-Z0-9\s]', '', title)
    title = re.sub(r'\s+', ' ', title).strip()
    return title
