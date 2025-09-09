'use server'
import { StreamChat } from "stream-chat";
import { createClient } from "../supabase/server";

export async function getStreamUserToken(){
    const supabase=await createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){
        throw new Error('User is not authenticated')
    }
    const {data:userData,error:ErrorType}=await supabase.from("users").select("full_name,avatar_url").eq("id",user.id).single()
    if(ErrorType){
        console.error(ErrorType)
        throw new Error("Failed to get user details,try again!")
    }
    const serverClient=StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        process.env.STREAM_PRIVATE_KEY!
    )
    const token=serverClient.createToken(user.id)
    await serverClient.upsertUser({
        id:user.id,
        name:userData.full_name,
        image:userData.avatar_url||undefined
    })
    return {
        token,
        userId:user.id,
        userName:userData.full_name,
        userImage:userData.avatar_url||undefined
    }
}
export async function createorGetChannel(otherUserId:string){
    const supabase=await createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){
        throw new Error('User is not authenticated')
    }
    const {data:matches,error:ErrorType}=await supabase.from("matches").select("*").or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`).eq('is_active',true).single()
    if(ErrorType||!matches){
        throw new Error("Users did not matched!")
    }
    const sortedids=[user.id,otherUserId].sort()
    const combinedIds=sortedids.join("_")

    let hash = 0;
    for (let i = 0; i < combinedIds.length; i++) {
        const char = combinedIds.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    const channelId=`match_${Math.abs(hash).toString(36)}`
    const serverClient=StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        process.env.STREAM_PRIVATE_KEY!
    )
    const {data:otherUserData,error:OtherError}=await supabase.from("users").select("*").eq("id",otherUserId).single()
    if(OtherError){
        console.error(OtherError)
        throw new Error("Failed to get other user details,try again!")
    }
    const channel=serverClient.channel('messaging',channelId,{
        members:[user.id,otherUserId],
        created_by_id:user.id
    })
    await serverClient.upsertUser({
        id:otherUserId,
        name:otherUserData.full_name,
        image:otherUserData.avatar_url||undefined
    })
    try {
        await channel.create()
        console.log("Channel creation success!")
    } catch (error) {
        console.log("Channel creation error",error)
        //what if already channel exists
        if(error instanceof Error&&!error.message.includes('already exists')){
            throw error;
        }
    }
    return {
        channelType:'messaging',
        channelId
    }
}
export async function createVideoCall(otherUserId:string){
    const supabase=await createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){
        throw new Error('User is not authenticated')
    }
    const {data:matches,error:ErrorType}=await supabase.from("matches").select("*").or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`).eq('is_active',true).single()
    if(ErrorType||!matches){
        throw new Error("Users did not matched!")
    }
    const sortedids=[user.id,otherUserId].sort()
    const combinedIds=sortedids.join("_")

    let hash = 0;
    for (let i = 0; i < combinedIds.length; i++) {
        const char = combinedIds.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    const callId=`call_${Math.abs(hash).toString(36)}`
    return {
        callId,
        callType:'default'
    }
}
export async function getStreamVideoCallToken(){
    const supabase=await createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){
        throw new Error('User is not authenticated')
    }
    const {data:userData,error:ErrorType}=await supabase.from("users").select("full_name,avatar_url").eq("id",user.id).single()
    if(ErrorType){
        console.error(ErrorType)
        throw new Error("Failed to get user details,try again!")
    }
    const serverClient=StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        process.env.STREAM_PRIVATE_KEY!
    )
    const token=serverClient.createToken(user.id)
   
    return {
        token,
        userId:user.id,
        userName:userData.full_name,
        userImage:userData.avatar_url||undefined
    }
}