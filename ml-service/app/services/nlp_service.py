import re

def summarize_clinical_report(text: str) -> str:
    """
    Parses and extracts key diagnostic observations and clinical impressions from raw report text.
    """
    if not text or len(text.strip()) == 0:
        return "No diagnostic text provided."

    # Look for impression/conclusion keywords
    keywords = ["IMPRESSION:", "CONCLUSION:", "FINDINGS:", "SUMMARY:"]
    found_lines = []

    lines = text.split("\n")
    capturing = False

    for line in lines:
        upper_line = line.upper().strip()
        if any(kw in upper_line for kw in keywords):
            capturing = True
            found_lines.append(line.strip())
            continue

        if capturing:
            if upper_line.endswith(":") and len(upper_line) < 30:
                break
            if line.strip():
                found_lines.append(line.strip())

    if found_lines:
        return " ".join(found_lines[:4])

    # Fallback to key sentence extraction
    sentences = re.split(r'\. |\n', text)
    important_sentences = [s.strip() for s in sentences if any(w in s.lower() for w in ['normal', 'abnormal', 'elevated', 'severe', 'acute', 'chronic', 'ischemia', 'edema', 'stenosis'])]

    if important_sentences:
        return ". ".join(important_sentences[:3]) + "."

    return text[:250] + "..." if len(text) > 250 else text
