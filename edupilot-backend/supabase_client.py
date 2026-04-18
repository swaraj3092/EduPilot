import os
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client, Client
import logging

# Initialize standard python logger
logger = logging.getLogger(__name__)

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

supabase: Client | None = None

def init_supabase():
    global supabase
    if url and key:
        try:
            supabase = create_client(url, key)
            logger.info("✅ Supabase client initialized.")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase: {e}")
            supabase = None
    else:
        logger.warning("⚠️ Supabase URL or KEY not found in .env. Running without DB cache.")

# Call once when module loads
init_supabase()

from datetime import datetime, timedelta, timezone

def get_cached_blueprint(field: str, country: str):
    """Attempt to fetch a cached blueprint based on field and country."""
    if not supabase:
        return None
    
    try:
        response = supabase.table('blueprints') \
            .select('content, created_at') \
            .eq('field', field) \
            .eq('country', country) \
            .order('created_at', desc=True) \
            .limit(1) \
            .execute()
            
        if response.data:
            return response.data[0]
    except Exception as e:
        logger.error(f"Supabase cache read error: {e}")
        
    return None

def is_stale(created_at_str: str, days: int = 7):
    """Check if the timestamp is older than X days."""
    try:
        # ISO format: 2024-04-18T10:00:00+00:00
        created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        return now - created_at > timedelta(days=days)
    except Exception as e:
        logger.error(f"Date parsing error: {e}")
        return True # Assume stale on error to be safe

def save_cached_blueprint(field: str, country: str, content: str):
    """Save a newly generated blueprint to Supabase for future use."""
    if not supabase:
        return False
        
    try:
        supabase.table('blueprints').insert({
            'field': field,
            'country': country,
            'content': content
        }).execute()
        return True
    except Exception as e:
        logger.error(f"Supabase cache save error: {e}")
        return False

def get_cached_data(cache_key: str):
    """Generic fetch from ai_cache table with timestamp."""
    if not supabase: return None
    try:
        res = supabase.table("ai_cache").select("content, created_at").eq("cache_key", cache_key).order('created_at', desc=True).limit(1).execute()
        if res.data: return res.data[0]
    except Exception as e:
        logger.error(f"Supabase GET error on ai_cache: {e}")
    return None

def save_cached_data(cache_key: str, content: str):
    """Generic insert into ai_cache table."""
    if not supabase: return False
    try:
        # Using upsert to update the content and timestamp if key exists
        supabase.table("ai_cache").upsert({
            "cache_key": cache_key, 
            "content": content,
            "created_at": datetime.now(timezone.utc).isoformat()
        }, on_conflict="cache_key").execute()
        return True
    except Exception as e:
        logger.error(f"Supabase SAVE error on ai_cache: {e}")
    return False
