from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import bcrypt
from supabase_client import supabase

router = APIRouter()

# Password Hashing Helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# Models
class UserAuth(BaseModel):
    email: str # Can be email or phone based on UI
    password: str

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
    
    return {"status": "success", "user_id": user_id, "message": "Account created successfully"}

@router.post("/login")
async def login(auth: UserAuth):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    user = supabase.table("users").select("*").eq("email", auth.email).execute()
    if not user.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    db_user = user.data[0]
    if not verify_password(auth.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Get Profile with XP and Streak
    profile = supabase.table("profiles").select("*").eq("user_id", db_user["id"]).execute()
    
    return {
        "status": "success", 
        "user": {
            "id": db_user["id"],
            "email": db_user["email"]
        },
        "profile": profile.data[0] if profile.data else {
            "full_name": "New User",
            "xp": 0,
            "streak": 1
        }
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
        # Get all real users
        res = supabase.table("profiles").select("full_name, xp, target_country, profile_picture, referral_code").order("xp", desc=True).limit(50).execute()
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
    
@router.get("/public-profile/{referral_code}")
async def get_public_profile(referral_code: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    print(f"DEBUG: get_public_profile called with code: '{referral_code}'")
    
    # Strategy 1: Direct referral_code match (Case Insensitive)
    res = supabase.table("profiles").select("*").ilike("referral_code", referral_code.strip()).execute()
    
    if not res.data:
        print(f"DEBUG: No direct match for '{referral_code}', trying slugs...")
        # Strategy 2: Clean Alphanumeric Slug Match
        search_slug = "".join(filter(str.isalnum, referral_code.lower()))
        print(f"DEBUG: Search slug generated: '{search_slug}'")
        
        # We fetch profiles that have any name set - increase limit to 1000
        all_profiles = supabase.table("profiles").select("user_id, full_name, referral_code").limit(1000).execute()
        target_id = None
        
        for p in all_profiles.data:
            name = p.get("full_name") or ""
            ref = p.get("referral_code") or ""
            
            # Check if cleaned name matches search_slug
            name_slug = "".join(filter(str.isalnum, name.lower()))
            ref_slug = "".join(filter(str.isalnum, ref.lower()))
            
            if (name_slug and name_slug == search_slug) or (ref_slug and ref_slug == search_slug):
                print(f"DEBUG: Match found! User: {name}, Slug: {name_slug}")
                target_id = p["user_id"]
                break
        
        if target_id:
            res = supabase.table("profiles").select("*").eq("user_id", target_id).execute()
        else:
            print(f"DEBUG: No slug match, trying exact name match...")
            # Final attempt: Exact name match without symbols
            name_query = referral_code.replace("-", " ").replace("_", " ")
            res = supabase.table("profiles").select("*").ilike("full_name", name_query).execute()
            
        if not res.data:
            print(f"DEBUG: FAILED to find profile for '{referral_code}'")
            raise HTTPException(status_code=404, detail=f"Profile '{referral_code}' not found")
        
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
