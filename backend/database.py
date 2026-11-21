import sqlite3
import os
from pathlib import Path
from contextlib import contextmanager
from backend.config import settings

def get_db_path() -> str:
    db_env = os.getenv("DATABASE_PATH", settings.database_path)
    path = Path(db_env)
    if not path.is_absolute():
        path = Path(__file__).resolve().parent.parent / path
    path.parent.mkdir(parents=True, exist_ok=True)
    return str(path)

@contextmanager
def get_db_connection():
    db_path = get_db_path()
    conn = sqlite3.connect(db_path, timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # 1. Brand Profiles
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brand_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                tagline TEXT,
                description TEXT,
                industry TEXT,
                tone_attributes TEXT, -- JSON array of strings
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Brand Rules
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brand_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id INTEGER NOT NULL,
                rule_type TEXT NOT NULL, -- 'terminology', 'voice', 'prohibited_claim', 'mandatory_rule', 'preferred_wording'
                category TEXT NOT NULL,  -- 'Terminology', 'Tone & Style', 'Claims & Compliance', 'Legal'
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                pattern_or_term TEXT,    -- Term/phrase/regex to flag
                preferred_term TEXT,     -- Preferred wording/replacement
                severity TEXT NOT NULL,  -- 'critical', 'high', 'medium', 'low'
                rationale TEXT,          -- Why the rule matters
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brand_profiles(id) ON DELETE CASCADE
            );
        """)

        # 3. Brand Verified Facts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brand_facts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id INTEGER NOT NULL,
                fact_key TEXT NOT NULL,
                fact_statement TEXT NOT NULL,
                verified_value TEXT NOT NULL,
                evidence_source TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brand_profiles(id) ON DELETE CASCADE
            );
        """)

        # 4. Content Drafts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS content_drafts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                channel TEXT DEFAULT 'General',
                author TEXT NOT NULL,
                original_text TEXT NOT NULL,
                current_text TEXT NOT NULL,
                review_status TEXT NOT NULL DEFAULT 'Draft', -- 'Draft', 'In Review', 'Changes Requested', 'Approved', 'Rejected'
                reviewer_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brand_profiles(id) ON DELETE CASCADE
            );
        """)

        # 5. Analysis Findings
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analysis_findings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draft_id INTEGER NOT NULL,
                rule_id INTEGER,
                fact_id INTEGER,
                finding_source TEXT NOT NULL, -- 'rule_engine' or 'ai_assisted'
                rule_type TEXT NOT NULL,
                severity TEXT NOT NULL,       -- 'critical', 'high', 'medium', 'low'
                title TEXT NOT NULL,
                explanation TEXT NOT NULL,
                evidence TEXT NOT NULL,
                matched_text TEXT,
                start_char INTEGER,
                end_char INTEGER,
                suggested_correction TEXT,
                status TEXT NOT NULL DEFAULT 'open', -- 'open', 'accepted', 'rejected', 'edited'
                user_applied_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (draft_id) REFERENCES content_drafts(id) ON DELETE CASCADE,
                FOREIGN KEY (rule_id) REFERENCES brand_rules(id) ON DELETE SET NULL,
                FOREIGN KEY (fact_id) REFERENCES brand_facts(id) ON DELETE SET NULL
            );
        """)

        # 6. Review Status History
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draft_id INTEGER NOT NULL,
                from_status TEXT NOT NULL,
                to_status TEXT NOT NULL,
                changed_by TEXT NOT NULL,
                notes TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (draft_id) REFERENCES content_drafts(id) ON DELETE CASCADE
            );
        """)

        # 7. Brand Visual Profiles (Round 3 Improvement 1)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brand_visual_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id INTEGER NOT NULL UNIQUE,
                primary_colors TEXT NOT NULL DEFAULT '[]',   -- JSON array of {hex, name, role}
                secondary_colors TEXT NOT NULL DEFAULT '[]', -- JSON array of {hex, name, role}
                logo_rules TEXT NOT NULL DEFAULT '{}',       -- JSON {min_ratio, max_ratio, clearspace_ratio, min_res}
                typography_rules TEXT NOT NULL DEFAULT '{}', -- JSON {primary_font, secondary_font, max_scale}
                guidelines TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brand_profiles(id) ON DELETE CASCADE
            );
        """)

        # 8. Visual Assets & Visual Audit Reports (Round 3 Improvement 1)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS visual_assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id INTEGER NOT NULL,
                filename TEXT NOT NULL,
                original_name TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                file_path TEXT NOT NULL,
                width INTEGER DEFAULT 0,
                height INTEGER DEFAULT 0,
                asset_type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'pptx'
                audit_score REAL DEFAULT 100.0,
                audit_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'passed', 'flagged', 'failed'
                dominant_colors TEXT DEFAULT '[]',            -- JSON array of {hex, percentage}
                audit_results TEXT DEFAULT '{}',              -- JSON {violations, score, color_check, logo_check, slide_reports}
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brand_profiles(id) ON DELETE CASCADE
            );
        """)

        # 9. Brand Voice Historical Samples (Round 3 Improvement 3)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brand_voice_samples (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                source TEXT,
                sample_text TEXT NOT NULL,
                word_count INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brand_profiles(id) ON DELETE CASCADE
            );
        """)

        # 10. Brand Voice Learned Profiles (Round 3 Improvement 3)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brand_voice_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id INTEGER NOT NULL UNIQUE,
                sample_count INTEGER NOT NULL DEFAULT 0,
                total_words INTEGER NOT NULL DEFAULT 0,
                formality_score REAL NOT NULL DEFAULT 70.0,
                avg_sentence_length REAL NOT NULL DEFAULT 16.0,
                vocab_complexity REAL NOT NULL DEFAULT 65.0,
                active_voice_ratio REAL NOT NULL DEFAULT 85.0,
                tone_attributes TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
                preferred_terms TEXT NOT NULL DEFAULT '[]', -- JSON array of frequent brand terms
                style_guidelines TEXT NOT NULL DEFAULT '[]', -- JSON array of extracted guidelines
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brand_profiles(id) ON DELETE CASCADE
            );
        """)

        # 11. CMS Publication Webhook Logs (Round 3 Improvement 2)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cms_publication_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id INTEGER NOT NULL,
                cms_platform TEXT NOT NULL, -- 'WordPress', 'Contentful', 'Webflow', 'HubSpot', 'Custom'
                title TEXT NOT NULL,
                channel TEXT NOT NULL,
                external_id TEXT,
                author TEXT,
                decision TEXT NOT NULL, -- 'ALLOW' or 'BLOCK'
                allowed INTEGER NOT NULL DEFAULT 0,
                blockers TEXT NOT NULL DEFAULT '[]', -- JSON array of blocking reasons
                findings_summary TEXT NOT NULL DEFAULT '{}', -- JSON {critical, high, medium, low, total}
                payload_preview TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brand_profiles(id) ON DELETE CASCADE
            );
        """)
