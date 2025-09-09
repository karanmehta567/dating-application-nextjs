import { getStreamVideoCallToken } from "@/lib/actions/stream"
import { Call, CallControls, SpeakerLayout, StreamCall, StreamTheme, StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk"
import { useEffect, useState } from "react"
import "@stream-io/video-react-sdk/dist/css/styles.css";
interface VideoCallProps{
    callId:string,
    onCallEnd:()=>void,
    isIncomimg?:boolean
}

export default function VideoCall({callId,isIncomimg=false,onCallEnd}:VideoCallProps){
    const [client,setClient]=useState<StreamVideoClient|null>(null)
    const [error,setError]=useState<string|null>(null)
    const [call,setCall]=useState<Call|null>(null);
    const [hasJoined,SetJoined]=useState(false)
    const [loading,setloading]=useState(true)
    useEffect(()=>{
        let isMounted=true
        async function InitializVideocALL(){
            if(hasJoined){
          return; 
        }
            try {
                setError(null)
                const {token,userImage,userId,userName}=await getStreamVideoCallToken()
                if(!isMounted){
                  return;
                }
                const videoClient=new StreamVideoClient({
                    apiKey:process.env.NEXT_PUBLIC_STREAM_API_KEY!,
                    user:{
                        id:userId!,
                        name:userName,
                        image:userImage
                    },token
                })
                if(!isMounted){
                  return;
                }
                const videoCall=videoClient.call('default',callId)
                if(isIncomimg){
                    await videoCall.join()
                }else{
                    await videoCall.join({create:true})
                }
                if(!isMounted){
                  return;
                }
                setClient(videoClient)
                setCall(videoCall)
                SetJoined(true)
            } catch (error) {
                setError("Failed to initiate the call")
            }finally{
                setloading(false)
            }
        }
        InitializVideocALL()
        return ()=>{
            isMounted=false
            if(call&&hasJoined){
                call.leave()
            }
            if(client){
                client.disconnectUser()
            }
        }
    },[callId,isIncomimg,hasJoined])
     if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">
            {isIncomimg ? "Joining call..." : "Starting call..."}
          </p>
        </div>
      </div>
    );
  }
   if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Call Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={onCallEnd}
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  if (!client || !call) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Setting up call...</p>
        </div>
      </div>
    );
  }
    return (
         <div className="fixed inset-0 bg-black z-50">
            <StreamVideo client={client}>
                <StreamCall call={call}>
                    <StreamTheme>
                        <SpeakerLayout />
                        <CallControls onLeave={onCallEnd} />
                    </StreamTheme>
                    </StreamCall>
            </StreamVideo>
         </div>
    )
}