'use client'
import { getPotentialMatches, toLikes } from "@/lib/actions/matches";
import { useEffect, useState } from "react"
import { UserProfile } from "../profile/page";
import { useRouter } from "next/navigation";
import MatchCard from "@/components/MatchCard";
import MatchButtons from "@/components/MatchButtons";
import HandleMatchNotification from "@/components/MatchNotification";

export default function MatchesPage(){
    const [potentialMatches,setPotentialMatches]=useState<UserProfile[]>([]);
    const [loading,setLoading]=useState<boolean>(true);
    const [currentIndex,setCurrentIndex]=useState(0);
    const [showMatchedNotification,setShowMatchedNotification]=useState(false);
    const [matchedUser,setShowMatchedUser]=useState<UserProfile|null>(null)
    const router=useRouter()
    useEffect(()=>{
        async function loadUser(){
            try {
                const potentialMatchesofTheUser=await getPotentialMatches();
                setPotentialMatches(potentialMatchesofTheUser)
                // console.log('The potential match',potentialMatchesofTheUser)
            } catch (error) {
                console.error(error)
            }finally{
                setLoading(false)
            }
        }
        loadUser()
    },[])
    async function handleLike(){
        //check if within the count
        if(currentIndex<potentialMatches.length){
            const likedUser=potentialMatches[currentIndex]
            try {
                const result=await toLikes(likedUser.id)
                if(result.isMatch){
                    setShowMatchedUser(result.matchedUser||null)
                    setShowMatchedNotification(true)
                }
                setCurrentIndex((prev)=>prev+1)
            } catch (error) {
                console.log(error)
            }
        }
    }
    function handlePass(){
        if(currentIndex<potentialMatches.length-1){
            setCurrentIndex((prev)=>prev+1)
        }
    }
    function handleCloseMatchNotifi(){

    }
    function handleStartChat(){
         
    }
    const currentMatchIndex=potentialMatches[currentIndex]
    // if(!currentMatchIndex){
    //     return;
    // }
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
    if (currentIndex >= potentialMatches.length) {
    return (
      <div className="h-full bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No more profiles to show
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Check back later for new matches, or try adjusting your preferences!
          </p>
          <button
            onClick={() => setCurrentIndex(0)}
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
          >
            Refresh
          </button>
        </div>
        {showMatchedNotification && matchedUser && (
          <HandleMatchNotification
            match={matchedUser}
            onClose={handleCloseMatchNotifi}
            onStartChat={handleStartChat}
          />
        )}
      </div>
    );
  }
    return (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                <div className="flex items-center justify-between mb-4">
                <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors duration-200"
                title="Go back"
                >
                <svg
                    className="w-6 h-6 text-gray-700 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                </button>
                <div className="flex-1">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Discover Matches
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                    {currentIndex + 1} of {potentialMatches.length} profiles
                    </p>
                </div>
                </div>
                </div>
                </header>
                <div className="max-w-md mx-auto">
                    <MatchCard user={currentMatchIndex}/>
                    <div className="mt-8">
                        <MatchButtons onLike={handleLike} onPass={handlePass}/>
                    </div>
                </div>
                {
                    showMatchedNotification&&matchedUser&&(
                        <HandleMatchNotification match={matchedUser} onClose={handleCloseMatchNotifi} onStartChat={handleStartChat}/>
                    )
                }
            </div>
        </div>
    )
}