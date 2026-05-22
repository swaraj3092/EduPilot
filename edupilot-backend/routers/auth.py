from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import bcrypt
import asyncio
from supabase_client import supabase

router = APIRouter()

# Password Helpers
def hash_password(password: str) -> str:
    # Store plain text for speed (hackathon mode)
    return password

def _verify_password_sync(password: str, hashed: str) -> bool:
    """Sync check — call via run_in_executor so it never blocks the event loop."""
    if password == hashed:
        return True
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

async def verify_password_async(password: str, hashed: str) -> bool:
    """Non-blocking password verification — runs bcrypt in a thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _verify_password_sync, password, hashed)

# Models
class UserAuth(BaseModel):
    email: str # Can be email or phone based on UI
    password: str
    referrer_code: Optional[str] = None

class ProfileUpdate(BaseModel):
    user_id: str
    full_name: str
    phone: Optional[str] = None
    target_country: Optional[str] = None
    target_field: Optional[str] = None
    degree_level: Optional[str] = None
    xp: Optional[int] = None
    streak: Optional[int] = None
    referral_code: Optional[str] = None
    referrals_count: Optional[int] = None
    profile_picture: Optional[str] = None
    last_login_date: Optional[str] = None

@router.post("/register")
async def register(auth: UserAuth):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # Check if user exists
    existing = supabase.table("users").select("*").eq("email", auth.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User already registered")
    
    # Hash and Save
    hashed = hash_password(auth.password)
    new_user = supabase.table("users").insert({
        "email": auth.email,
        "password": hashed
    }).execute()
    
    if not new_user.data:
        raise HTTPException(status_code=500, detail="Failed to create user")
        
    user_id = new_user.data[0]["id"]
    
    # Create empty profile
    supabase.table("profiles").insert({"user_id": user_id}).execute()
    
    # Handle Referral Logic
    if auth.referrer_code:
        # 1. Try to find the referrer
        # We check referral_code first, then full_name slugs
        referrer_ref = supabase.table("profiles").select("*").eq("referral_code", auth.referrer_code).execute()
        
        if not referrer_ref.data:
            # Fallback: Check if it's a sluggified name match
            all_profiles = supabase.table("profiles").select("user_id, full_name, referrals_count, xp").execute()
            for p in all_profiles.data:
                slug = p["full_name"].lower().replace(' ', '') if p.get("full_name") else ""
                if slug == auth.referrer_code:
                    referrer_ref.data = [p]
                    break
        
        if referrer_ref.data:
            ref = referrer_ref.data[0]
            new_count = (ref.get("referrals_count") or 0) + 1
            new_xp = (ref.get("xp") or 0) + 100 # Reward referrer with 100 XP
            
            supabase.table("profiles").update({
                "referrals_count": new_count,
                "xp": new_xp
            }).eq("user_id", ref["user_id"]).execute()
            print(f"SUCCESS: Incremented referrals for {ref['user_id']} to {new_count}")

    return {"status": "success", "user_id": user_id, "message": "Account created successfully"}

@router.post("/login")
async def login(auth: UserAuth):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Single joined query — fetch user + lean profile (no profile_picture to keep payload tiny)
    res = supabase.table("users").select(
        "id, email, password, profiles(user_id, full_name, xp, streak, target_country, target_field, degree_level, referral_code, referrals_count, quests_completed, last_login_date)"
    ).eq("email", auth.email).limit(1).execute()

    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    db_user = res.data[0]

    # Non-blocking password check — won't freeze the server even for bcrypt hashes
    if not await verify_password_async(auth.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Extract lean profile (profile_picture excluded to cut payload ~95%)
    profile_data = db_user.get("profiles")
    profile = profile_data[0] if profile_data else {
        "full_name": "New User",
        "xp": 0,
        "streak": 1
    }

    return {
        "status": "success",
        "user": {
            "id": db_user["id"],
            "email": db_user["email"]
        },
        "profile": profile
    }

@router.post("/update-profile")
async def update_profile(profile: ProfileUpdate):
    print(f"DEBUG: update_profile called for user {profile.user_id}")
    try:
        from supabase_client import supabase
        if not supabase:
             return {"status": "error", "message": "Supabase not initialized"}
             
        update_data = {
            "full_name": profile.full_name,
            "target_country": profile.target_country,
            "target_field": profile.target_field,
            "degree_level": profile.degree_level,
            "phone": profile.phone
        }
        
        if profile.xp is not None:
            update_data["xp"] = profile.xp
        if profile.streak is not None:
            update_data["streak"] = profile.streak
        if profile.referral_code is not None:
            update_data["referral_code"] = profile.referral_code
        if profile.referrals_count is not None:
            update_data["referrals_count"] = profile.referrals_count
        if profile.last_login_date is not None:
            update_data["last_login_date"] = profile.last_login_date
        if profile.profile_picture is not None:
            update_data["profile_picture"] = profile.profile_picture
            
        res = supabase.table("profiles").update(update_data).eq("user_id", profile.user_id).execute()
        
        if not res.data:
            return {"status": "error", "message": f"Profile for {profile.user_id} not found."}
            
        return {"status": "success", "profile": res.data[0]}
    except Exception as e:
        print(f"CRITICAL ERROR IN update_profile: {e}")
        return {"status": "error", "message": str(e)}

class XPReward(BaseModel):
    user_id: str
    amount: int
    reason: str

@router.post("/award-xp")
async def award_xp(reward: XPReward):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # Get current XP
    current = supabase.table("profiles").select("xp").eq("user_id", reward.user_id).execute()
    current_xp = 0
    if current.data:
        current_xp = current.data[0].get("xp", 0) or 0
    
    new_xp = current_xp + reward.amount
    
    res = supabase.table("profiles").update({"xp": new_xp}).eq("user_id", reward.user_id).execute()
    return {"status": "success", "new_xp": new_xp, "reason": reward.reason}

@router.post("/reset-password")
async def reset_password(auth: UserAuth):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # Check if user exists
    user = supabase.table("users").select("id").eq("email", auth.email).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="Email not found")
    
    # Hash new password and update
    hashed = hash_password(auth.password)
    supabase.table("users").update({"password": hashed}).eq("email", auth.email).execute()
    
    return {"status": "success", "message": "Password updated successfully"}

@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    res = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return {"status": "success", "profile": res.data[0]}

@router.get("/leaderboard")
async def get_leaderboard():
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        # Get all real users (excluding heavy profile_picture for ultra-fast loading)
        res = supabase.table("profiles").select("full_name, xp, target_country, referral_code").order("xp", desc=True).limit(50).execute()
        users = res.data or []
        return {"status": "success", "leaderboard": users}
    except Exception as e:
        print(f"Leaderboard Error: {e}")
        return {"status": "error", "message": str(e), "leaderboard": []}

class QuestComplete(BaseModel):
    user_id: str
    quest_id: str
    xp_reward: int

@router.post("/complete-quest")
async def complete_quest(data: QuestComplete):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # Get current profile
    profile = supabase.table("profiles").select("*").eq("user_id", data.user_id).execute()
    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    p = profile.data[0]
    completed = p.get("quests_completed") or []
    if not isinstance(completed, list):
        completed = []
        
    if data.quest_id not in completed:
        completed.append(data.quest_id)
        new_xp = (p.get("xp") or 0) + data.xp_reward
        
        supabase.table("profiles").update({
            "quests_completed": completed,
            "xp": new_xp
        }).eq("user_id", data.user_id).execute()
        
        return {"status": "success", "message": "Quest completed!", "new_xp": new_xp}
    
    return {"status": "already_completed", "message": "Quest already finished"}
    
@router.get("/health")
async def auth_health():
    return {"status": "Auth router is live and synchronized 🔐"}

@router.get("/public-profile/{referral_code}")
async def get_public_profile(referral_code: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    print(f"DEBUG: get_public_profile looking for '{referral_code}'")
    
    # 1. Direct referral_code match (Case Insensitive)
    res = supabase.table("profiles").select("*").ilike("referral_code", referral_code.strip()).execute()
    
    if not res.data:
        print(f"DEBUG: No direct match. Trying fuzzy slug match...")
        search_slug = "".join(filter(str.isalnum, referral_code.lower()))
        
        # Use get() for everyone to handle missing columns gracefully
        all_profiles = supabase.table("profiles").select("*").limit(2000).execute()
        target_id = None
        
        if all_profiles.data:
            for p in all_profiles.data:
                name = (p.get("full_name") or "").lower()
                ref = (p.get("referral_code") or "").lower()
                
                # Match against names without spaces
                name_no_space = name.replace(" ", "")
                ref_no_space = ref.replace(" ", "")
                
                # Deep cleaning
                name_clean = "".join(filter(str.isalnum, name))
                ref_clean = "".join(filter(str.isalnum, ref))
                
                if search_slug in [name_no_space, ref_no_space, name_clean, ref_clean]:
                    print(f"DEBUG: MATCH IN LIST! Name: {name}, Slug: {search_slug}")
                    target_id = p.get("user_id")
                    break
        
        if target_id:
            res = supabase.table("profiles").select("*").eq("user_id", target_id).execute()
        else:
            # 3. Last ditch: try sub-string ilike search for name
            res = supabase.table("profiles").select("*").ilike("full_name", f"%{referral_code}%").execute()
            
        if not res.data:
             raise HTTPException(status_code=404, detail=f"Navigator '{referral_code}' not found in the manifest.")
        
    p = res.data[0]
    # Return redacted profile for public view
    return {
        "status": "success",
        "profile": {
            "full_name": p.get("full_name", "Explorer"),
            "xp": p.get("xp", 0),
            "streak": p.get("streak", 0),
            "referrals_count": p.get("referrals_count", 0),
            "quests_completed": p.get("quests_completed", []),
            "badges": p.get("badges", []),
            "target_country": p.get("target_country"),
            "target_field": p.get("target_field"),
            "profile_picture": p.get("profile_picture")
        }
    }
