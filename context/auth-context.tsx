'use client'
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType{
    user:User|null;
    loading:boolean,
    signOut:()=>Promise<void>
}

const AuthContext=createContext<AuthContextType|undefined>(undefined)

export function AuthProvider({children}:{children:React.ReactNode}){
    const [user,setUser]=useState<User|null>(null)
    const [loading,setloading]=useState<boolean>(false);
    useEffect(()=>{
    async function checkUser(){
        setloading(true)
        try {
            const {data:{session}}=await supabase.auth.getSession()
            setUser(session?.user ??null)
            console.log(session?.user)
            const {data:{subscription}}=await supabase.auth.onAuthStateChange(async(event,session)=>{
                setUser(session?.user||null)
            })
            return ()=>
            subscription.unsubscribe()
        } catch (error) {
            console.log(error)
        }finally{
            setloading(false)
        }
    }
    checkUser()
},[])
async function signOut(){
    try {
        await supabase.auth.signOut()
    } catch (error) {
        console.log('Error loging out:',error)
    }
}
    return (
        <AuthContext.Provider value={{user,loading,signOut}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    const conetxt=useContext(AuthContext)
    if(conetxt==undefined){
         throw new Error("useAuth must be used within an AuthProvider");
    }
    return conetxt;
}