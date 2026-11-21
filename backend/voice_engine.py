import re
import math
import logging
from typing import Dict, Any, List, Tuple, Optional
from collections import Counter

logger = logging.getLogger("brandproof.voice_engine")

PASSIVE_VOICE_REGEX = re.compile(
    r"\b(am|is|are|was|were|be|been|being)\s+([a-z]+ed|[a-z]+en|[a-z]+t)\b",
    re.IGNORECASE
)

FORMAL_MARKERS = [
    "furthermore", "consequently", "subsequently", "specifically", "therefore",
    "moreover", "demonstrates", "facilitates", "establishes", "enterprise",
    "infrastructure", "implementation", "comprehensive", "robust", "deterministic"
]

INFORMAL_MARKERS = [
    "gonna", "wanna", "kinda", "sorta", "awesome", "huge", "super", "crazy",
    "cool", "stuff", "lots of", "a bunch of", "totally", "pretty much"
]

CONTRACTION_REGEX = re.compile(r"\b(don't|can't|won't|it's|we're|they're|you're|shouldn't|wouldn't|isn't|aren't)\b", re.IGNORECASE)

def count_syllables(word: str) -> int:
    word = word.lower().strip(".:;?!'\"-")
    if not word:
        return 0
    if len(word) <= 3:
        return 1
    # Count vowel groups
    count = len(re.findall(r'[aeiouy]+', word))
    if word.endswith('e') and not word.endswith('le') and count > 1:
        count -= 1
    return max(1, count)

def segment_sentences(text: str) -> List[str]:
    # Split on sentence terminals while keeping punctuation
    raw = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in raw if len(s.strip()) > 3]

def tokenize_words(text: str) -> List[str]:
    tokens = re.findall(r"\b[A-Za-z0-9_-]+\b", text)
    return tokens

def analyze_text_style(text: str) -> Dict[str, Any]:
    """Calculate deep quantitative style metrics on any text sample."""
    sentences = segment_sentences(text)
    if not sentences:
        sentences = [text]
    words = tokenize_words(text)
    total_words = max(len(words), 1)
    
    # Sentence length
    sentence_lengths = [len(tokenize_words(s)) for s in sentences]
    avg_sentence_length = sum(sentence_lengths) / max(len(sentence_lengths), 1)
    
    # Passive voice count
    passive_matches = PASSIVE_VOICE_REGEX.findall(text)
    passive_count = len(passive_matches)
    active_sentences = max(len(sentences) - passive_count, 0)
    active_ratio = round((active_sentences / max(len(sentences), 1)) * 100.0, 1)
    
    # Vocabulary Complexity (Type-token ratio + polysyllable ratio)
    unique_words = set(w.lower() for w in words)
    ttr = len(unique_words) / total_words # lexical richness
    polysyllables = [w for w in words if count_syllables(w) >= 3]
    polysyllable_ratio = len(polysyllables) / total_words
    
    # Scale vocab complexity to 0-100
    vocab_complexity = min(100.0, max(10.0, round((ttr * 50.0) + (polysyllable_ratio * 250.0), 1)))
    
    # Formality calculation
    lower_text = text.lower()
    formal_hits = sum(1 for m in FORMAL_MARKERS if m in lower_text)
    informal_hits = sum(1 for m in INFORMAL_MARKERS if m in lower_text)
    contractions = len(CONTRACTION_REGEX.findall(text))
    
    # Baseline 65
    formality = 65.0 + (formal_hits * 3.5) - (informal_hits * 6.0) - (contractions * 2.5) + (polysyllable_ratio * 40.0)
    formality = min(100.0, max(15.0, round(formality, 1)))
    
    # Terminology frequency
    stopwords = {"the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with", "is", "are", "was", "were", "it", "this", "that", "we", "our", "you", "your", "by", "as", "be"}
    content_words = [w.lower() for w in words if w.lower() not in stopwords and len(w) > 3]
    freq_counter = Counter(content_words)
    top_terms = [term for term, count in freq_counter.most_common(12)]
    
    return {
        "word_count": total_words,
        "sentence_count": len(sentences),
        "avg_sentence_length": round(avg_sentence_length, 1),
        "formality_score": formality,
        "vocab_complexity": vocab_complexity,
        "active_voice_ratio": active_ratio,
        "passive_sentences_count": passive_count,
        "contractions_count": contractions,
        "preferred_terms": top_terms
    }

def generate_brand_voice_profile(samples: List[Dict[str, Any]], brand_name: str) -> Dict[str, Any]:
    """Aggregate multiple historical text samples into a learned persistent brand voice profile."""
    if not samples:
        # Default enterprise baseline
        return {
            "sample_count": 0,
            "total_words": 0,
            "formality_score": 75.0,
            "avg_sentence_length": 16.5,
            "vocab_complexity": 68.0,
            "active_voice_ratio": 88.0,
            "tone_attributes": ["Authoritative", "Enterprise Ready", "Technically Clear", "Direct"],
            "preferred_terms": ["governance", "enterprise", "deterministic", "compliance", "platform", "cloud"],
            "style_guidelines": [
                "Maintain concise active sentences averaging 14-18 words.",
                "Avoid colloquialisms and excessive contractions.",
                "Use deterministic, evidence-backed claims rather than hyperbolic adjectives."
            ]
        }
        
    all_metrics = [analyze_text_style(s["sample_text"]) for s in samples]
    total_words = sum(m["word_count"] for m in all_metrics)
    
    # Weighted averages
    avg_formality = sum(m["formality_score"] * m["word_count"] for m in all_metrics) / max(total_words, 1)
    avg_sentence_len = sum(m["avg_sentence_length"] * m["word_count"] for m in all_metrics) / max(total_words, 1)
    avg_vocab = sum(m["vocab_complexity"] * m["word_count"] for m in all_metrics) / max(total_words, 1)
    avg_active = sum(m["active_voice_ratio"] * m["word_count"] for m in all_metrics) / max(total_words, 1)
    
    # Aggregate top terms
    all_terms = Counter()
    for m in all_metrics:
        for t in m["preferred_terms"]:
            all_terms[t] += 1
    top_terms = [t for t, _ in all_terms.most_common(10)]
    
    # Infer tone attributes
    tone = []
    if avg_formality >= 75.0:
        tone.extend(["Executive", "Authoritative"])
    elif avg_formality >= 55.0:
        tone.extend(["Professional", "Approachable"])
    else:
        tone.extend(["Conversational", "Casual"])
        
    if avg_vocab >= 65.0:
        tone.append("Technically Sophisticated")
    else:
        tone.append("Direct & Accessible")
        
    if avg_active >= 85.0:
        tone.append("Action-Oriented")
        
    style_guidelines = [
        f"Keep target sentence length between {max(10, int(avg_sentence_len - 3))} and {int(avg_sentence_len + 4)} words.",
        f"Target formality benchmark is {round(avg_formality, 0)}/100 ({'avoid contractions' if avg_formality > 70 else 'measured conversational tone'}).",
        f"Aim for > {max(75, int(avg_active))}% active voice constructions.",
        f"Approved strategic terminology includes: {', '.join(top_terms[:5])}."
    ]
    
    return {
        "sample_count": len(samples),
        "total_words": total_words,
        "formality_score": round(avg_formality, 1),
        "avg_sentence_length": round(avg_sentence_len, 1),
        "vocab_complexity": round(avg_vocab, 1),
        "active_voice_ratio": round(avg_active, 1),
        "tone_attributes": tone,
        "preferred_terms": top_terms,
        "style_guidelines": style_guidelines
    }

def compare_draft_to_voice_profile(draft_text: str, profile: Dict[str, Any]) -> Dict[str, Any]:
    """Compare a new marketing draft against the brand's learned style profile and quantify deviations."""
    draft_metrics = analyze_text_style(draft_text)
    deviations: List[Dict[str, Any]] = []
    recommendations: List[str] = []
    
    target_formality = profile.get("formality_score", 75.0)
    target_sentence_len = profile.get("avg_sentence_length", 16.5)
    target_vocab = profile.get("vocab_complexity", 68.0)
    target_active = profile.get("active_voice_ratio", 88.0)
    
    # 1. Formality Check
    formality_diff = draft_metrics["formality_score"] - target_formality
    if abs(formality_diff) > 15.0:
        severity = "high" if abs(formality_diff) > 25.0 else "medium"
        direction = "too casual / colloquial" if formality_diff < 0 else "overly dense and academic"
        deviations.append({
            "metric": "Brand Formality Index",
            "severity": severity,
            "current_value": f"{draft_metrics['formality_score']}/100",
            "target_value": f"{target_formality}/100",
            "explanation": f"Draft tone is {direction} compared to the brand voice profile standard ({target_formality}).",
            "recommendation": "Elevate language precision by replacing casual idioms and eliminating informal contractions." if formality_diff < 0 else "Simplify sentence structures and adopt direct, clearer phrasing."
        })
        recommendations.append("Align formality with brand tone benchmarks.")
        
    # 2. Sentence Length Check
    len_diff = draft_metrics["avg_sentence_length"] - target_sentence_len
    if abs(len_diff) > 6.0:
        severity = "high" if abs(len_diff) > 10.0 else "medium"
        deviations.append({
            "metric": "Sentence Length & Rhythm",
            "severity": severity,
            "current_value": f"{draft_metrics['avg_sentence_length']} words/sentence",
            "target_value": f"{target_sentence_len} words/sentence",
            "explanation": f"Average sentence length deviates by {abs(round(len_diff, 1))} words from the brand rhythm guideline ({target_sentence_len} words).",
            "recommendation": "Break run-on sentences into punchier, digestible statements." if len_diff > 0 else "Combine choppy clauses to create better narrative flow."
        })
        recommendations.append("Adjust sentence length and rhythm.")

    # 3. Active Voice Check
    if draft_metrics["active_voice_ratio"] < (target_active - 12.0):
        severity = "medium" if draft_metrics["active_voice_ratio"] > 60.0 else "high"
        deviations.append({
            "metric": "Active vs. Passive Voice",
            "severity": severity,
            "current_value": f"{draft_metrics['active_voice_ratio']}% active",
            "target_value": f"≥ {target_active}% active",
            "explanation": f"Draft contains {draft_metrics['passive_sentences_count']} passive constructions, reducing direct brand engagement.",
            "recommendation": "Convert passive verbs into direct subject-action statements (e.g. 'BrandRoute delivers security' instead of 'Security is delivered by BrandRoute')."
        })
        recommendations.append("Convert passive constructions to direct active voice.")
        
    # 4. Vocabulary Complexity Check
    vocab_diff = draft_metrics["vocab_complexity"] - target_vocab
    if abs(vocab_diff) > 20.0:
        deviations.append({
            "metric": "Vocabulary Complexity",
            "severity": "low",
            "current_value": f"{draft_metrics['vocab_complexity']}/100",
            "target_value": f"{target_vocab}/100",
            "explanation": "Lexical richness deviates from learned historical publications.",
            "recommendation": "Calibrate technical vocabulary to match audience expectations."
        })
        
    # Calculate Overall Consistency Score (0-100)
    deductions = sum(22.0 if d["severity"] == "high" else (12.0 if d["severity"] == "medium" else 5.0) for d in deviations)
    consistency_score = max(0.0, round(100.0 - deductions, 1))
    
    if not recommendations:
        recommendations.append("Draft closely matches learned brand voice guidelines across all stylistic dimensions.")
        
    return {
        "consistency_score": consistency_score,
        "formality_score": draft_metrics["formality_score"],
        "avg_sentence_length": draft_metrics["avg_sentence_length"],
        "vocab_complexity": draft_metrics["vocab_complexity"],
        "active_voice_ratio": draft_metrics["active_voice_ratio"],
        "benchmark_profile": {
            "formality_score": target_formality,
            "avg_sentence_length": target_sentence_len,
            "vocab_complexity": target_vocab,
            "active_voice_ratio": target_active,
            "tone_attributes": profile.get("tone_attributes", [])
        },
        "deviations": deviations,
        "top_recommendations": recommendations
    }
