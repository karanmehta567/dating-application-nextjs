'use server'

import { UserProfile } from "@/app/profile/page";
import { createClient } from "../supabase/server"

export async function getPotentialMatches():Promise<UserProfile[]>{
    const supabase=await createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){
        throw new Error('User is not authenticated')
    }
    const {data:potentialMatches,error}=await supabase.from('users').select("*").neq("id",user.id).limit(40)
    if(error){
        throw new Error('Failed to fetched potential matches')
    }
    const {data:prefData,error:prefError}=await supabase.from('users').select("preferences,gender").eq('id',user.id).single()
    if(prefError){
        throw new Error('Failed to fetch preferences of the user')
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentUserPrefs=prefData.preferences as any;
    let genderPrefs=currentUserPrefs?.gender_preference || []
    if (!genderPrefs.length) {
        if (prefData.gender === "male") {
            genderPrefs = ["female"];
        } else if (prefData.gender === "female") {
            genderPrefs = ["male"];
        } else {
            genderPrefs = []; // for "other" cases
        }
}
    const fileteredMatches=potentialMatches.filter((match)=>{
        if(!genderPrefs|| genderPrefs.length===0){
            return true;
        }
        return genderPrefs.includes(match.gender)
    }).map((match)=>({
        id: match.id,
        full_name: match.full_name,
        username: match.username,
        email: "",
        gender: match.gender,
        birthdate: match.birthdate,
        bio: match.bio,
        avatar_url: match.avatar_url,
        preferences: match.preferences,
        location_lat: undefined,
        location_lng: undefined,
        last_active: new Date().toISOString(),
        is_verified: true,
        is_online: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }))||[]
    return fileteredMatches 
}
export async function toLikes(userId:string){
    const supabase=await createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){
        throw new Error('User is not authenticated')
    }
    const {error:ErrorLikes}=await supabase.from('likes').insert({
        from_user_id:user.id,
        to_user_id:userId,
        created_at:new Date().toISOString()
    })
    if(ErrorLikes){
        throw new Error('Failed to create Like')
    }
    const {data:existingLike,error:checkError}=await supabase.from('likes').select('*').eq('from_user_id',userId).eq('to_user_id',user.id).single()
    if(checkError&&checkError.code!=='PGRST116'){
        throw new Error("Failed to get data")
    }
    if(existingLike){
        const {data:matchedUser,error:UError}=await supabase.from('users').select('*').eq('id',userId).single()
        if(UError){
            throw new Error('Failed to fetch user')
        }
        return {success:true,isMatch:true,matchedUser:matchedUser as UserProfile}
    }
    return {success:true,isMatch:false}
}
export async function getUsersMatches(){
    const supabase=await createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){
        throw new Error('User is not authenticated')
    }
    const {data:userMatches,error:ErrorType}=await supabase.from('matches').select("*").or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`).eq('is_active',true)
    if(ErrorType){
        throw new Error("No matches found")
    }
    const matchedUsers:UserProfile[]=[]
    for(const match of userMatches||[]){
        const otherUserId=match.user1_id===user.id?match.user2_id:match.user1_id
        const {data:otherUser,error:ErrorType}=await supabase.from("users").select("*").eq("id",otherUserId).single()
        if(ErrorType){
            continue
        }
        matchedUsers.push({
        id: otherUser.id,
        full_name: otherUser.full_name,
        username: otherUser.username,
        email: otherUser.email,
        gender: otherUser.gender,
        birthdate: otherUser.birthdate,
        bio: otherUser.bio,
        avatar_url: otherUser.avatar_url,
        preferences: otherUser.preferences,
        location_lat: undefined,
        location_lng: undefined,
        last_active: new Date().toISOString(),
        is_verified: true,
        is_online: false,
        created_at: match.created_at,
        updated_at: match.created_at,
    });
    }
    return matchedUsers;
}