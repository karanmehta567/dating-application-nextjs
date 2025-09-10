'use server'
import { UserProfile } from "@/app/profile/page";
import { createClient } from "../supabase/server"

export async function getUserProfileDetails(){
    const supabase=await createClient()
    const {data:{user}}=await supabase.auth.getUser()
    if(!user){
        return null;
    }
    const {data:profile,error}=await supabase.from("users").select("*").eq("id",user.id).single()
    if(error){
        console.log('Error while discovering user',error)
        return null;
    }
    return profile
}
export async function UpdateUserProfile(formData:Partial<UserProfile>){
    const supabase=await createClient();
    const {data:{user}}=await supabase.auth.getUser()
    if(!user){
        return {success:false,error:'User is not authenticated'};
    }
    const {error}=await supabase
        .from("users")
        .update({
            full_name: formData.full_name,
            username: formData.username,
            bio: formData.bio,
            gender: formData.gender?.toLowerCase(),
            birthdate: formData.birthdate,
            avatar_url: formData.avatar_url,
            updated_at:new Date().toISOString()
        })
        .eq("id", user.id);
        if(error){
            console.log('Errroro',error)
            return {success:false,error:error.message}
        }
        return {success:true}
}
export async function uploadprofilePhoto(file:File){
    const supabase=await createClient();
    const {data:{user}}=await supabase.auth.getUser()
    if(!user){
        return {success:false,error:'User is not authenticated'};
    }
    const fileExtension=file.type.split('.').pop()
    const fileName=`${user.id}-${Date.now()}-${fileExtension}`
    const {error}=await supabase.storage.from('profile-images').upload(fileName,file,{
        upsert:false,
        cacheControl:'3500'
    })
    if(error){
        return {success:false,error:error.message}
    }
    const {data:{publicUrl}}=supabase.storage.from('profile-images').getPublicUrl(fileName)
    return {success:true,url:publicUrl}
}
