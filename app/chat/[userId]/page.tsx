'use client'
import { UserProfile } from "@/app/profile/page"
import ChatHeader from "@/components/ChatHeader"
import StreamChatInterface from "@/components/StreamChatInterface"
import { useAuth } from "@/context/auth-context"
import { getUsersMatches } from "@/lib/actions/matches"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useRef } from "react"

export default function ChatConversationPage(){
    const params=useParams()
    const [otherUser,setUser]=React.useState<UserProfile|null>(null)
    const [loading,setLOading]=React.useState<boolean>(true)
    const userId=params.userId as string
    const {user}=useAuth()
    const router=useRouter()
    const chatInterfaceRef=useRef<{handleVideoCall:()=>void}|null>(null)
    useEffect(()=>{
                async function loadUserData(){
                    try {
                        const userMtaches=await getUsersMatches();
                        const findUser=userMtaches.find((match)=>match.id===userId)
                        if(findUser){
                            setUser(findUser)
                        }else{
                            router.push('/chat')
                        }
                        console.log(userMtaches)
                    } catch (error) {
                        console.log(error)
                        router.push('/chat')
                    }finally{
                        setLOading(false)
                    }
                }
                if(user){
                    loadUserData()
                }
                loadUserData()
            },[userId,router,user])
        if (loading) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading your profile..
            </p>
            </div>
        </div>
        );
}
if (!otherUser) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
            <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                User not found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                The user you're looking for doesn't exist or you don't have
                permission to chat with them.
            </p>
            <button
                onClick={() => router.push("/chat")}
                className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
            >
                Back to Messages
            </button>
        </div>
    </div>
    );
}
    return (
        <div className="h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto h-full flex flex-col">
                <ChatHeader
                    user={otherUser}
                    onVideoCall={()=>{
                        chatInterfaceRef.current?.handleVideoCall()
                    }}
                />
                <div className="flex-1 min-h-0">
                    <StreamChatInterface otherUser={otherUser} ref={chatInterfaceRef}/>
                </div>
            </div>
        </div>
    )
}