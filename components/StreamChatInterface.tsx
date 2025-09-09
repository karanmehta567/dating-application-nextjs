import { UserProfile } from "@/app/profile/page";
import { createorGetChannel, createVideoCall, getStreamUserToken } from "@/lib/actions/stream";
import { useRouter } from "next/navigation";
import { RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Channel, Event, StreamChat } from "stream-chat";
import VideoCall from "./VideoCall";

interface Message{
    id:string,
    text:string|null,
    sender:"me"|"other",
    timestamp:Date;
    user_id:string
}
interface StreamChatInterfaceProps {
    otherUser: UserProfile;
    ref: RefObject<{ handleVideoCall: () => void } | null>;
}

export default function StreamChatInterface({ otherUser, ref }: StreamChatInterfaceProps) {
    const [loading,setLoading]=useState<boolean>(true)
    const [error,setError]=useState<string|null>(null)
    const [currentUserId,setCurrentUserId]=useState<string>("")
    const [messages,SetMessages]=useState<Message[]>()
    const [client,setClient]=useState<StreamChat|null>(null);
    const [channel,setChannel]=useState<Channel|null>(null)
    const [scrollButton,showScrollButton]=useState<boolean>(false)
    const [currentUserName, setCurrentUserName] = useState<string>("")
    const [newMessage,setnewMessage]=useState<string>("")
    const messageEndRef=useRef<HTMLDivElement>(null)
    const messageContainerRef=useRef<HTMLDivElement>(null)
    const [videoCallId,setVideoCallId]=useState<string>("");
    const [incomingCall,setIncomingCall]=useState<string>("")
    const [callername,setCallerName]=useState<string>("")
    const [showincomingcall,setshowincomingcall]=useState(false)
    const [isTyping,setTyping]=useState<boolean>(false)
    const [showVideoCall,setShowVideoCall]=useState(false);
    const [isVideoInitiator,setVideoInitiator]=useState(false)
    const router=useRouter()

    function scroll2Down(){
        messageEndRef.current?.scrollIntoView({behavior:'smooth'})
        showScrollButton(false)
    }
    function handleScroll(){
        if (messageContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =messageContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        showScrollButton(!isNearBottom);
    }
    }
    useEffect(()=>{
        scroll2Down()
    },[messages])
    useEffect(()=>{
        const current=messageContainerRef.current
        if(current){
            current.addEventListener('scroll',handleScroll)
            return ()=>current.removeEventListener('scroll',handleScroll)
        }
    },[handleScroll])
    useEffect(()=>{
        setShowVideoCall(false)
        setshowincomingcall(false)
        setCallerName("")
        setIncomingCall("")
        setVideoInitiator(false)
        setVideoCallId("")
        async function InitiliazeChat(){
            try {
                setError(null)
                const {token,userName,userId,userImage}=await getStreamUserToken()
                setCurrentUserId(userId!)
                setCurrentUserName(userName)
                const ChatClient=StreamChat.getInstance(
                    process.env.NEXT_PUBLIC_STREAM_API_KEY!
                )
                await ChatClient.connectUser({
                    id:userId!,
                    name:userName,
                    image:userImage
                },token)
                const {channelType,channelId}=await createorGetChannel(otherUser.id)
                //get the channel now!
                const chatChannel=ChatClient.channel(channelType,channelId)
                await chatChannel.watch()
                //load existing messages
                const state=await chatChannel.query({messages:{limit:50}})
                //you'll get msgs in a stream format we need to convert it to my type
                const convertedMessages:Message[]=state.messages.map((msg)=>({
                    id:msg.id,
                    text:msg.text || "",
                    sender:msg.user?.id===userId?'me':'other',
                    timestamp:new Date(msg.created_at||new Date()),
                    user_id:msg.user?.id||""
                }))
                SetMessages(convertedMessages)
                chatChannel.on('message.new',(event:Event)=>{
                    if(event.message){
                        if(event.message.text?.includes('You have been invited for a video call!📹')){
                            const customData=event.message as any
                            if(customData.caller_id!==userId){
                                setIncomingCall(customData.call_id)
                                setCallerName(customData.caller_name||"Someone")
                                setshowincomingcall(true)
                            }
                            return;
                        }
                        if(event.message.user?.id!==userId){
                            const newMsg:Message={
                                id:event.message.id,
                                text:event.message.text||"",
                                sender:event.message.user?.id === userId ? "me" : "other",
                                timestamp:new Date(event.message.created_at||new Date()),
                                user_id:event.message.user?.id||""
                            }
                            SetMessages((prev)=>{
                                    const ifPreviousExist=prev?.some((msg)=>msg.id===newMsg.id)
                                    if(!ifPreviousExist){
                                        return [...(prev ?? []), newMsg]
                                    }
                                    return prev;
                            })
                        }
                    }
                })
                chatChannel.on('typing.start',(event:Event)=>{
                    if(event.user?.id!=userId){
                        setTyping(true)
                    }
                })
                chatChannel.on('typing.stop',(event:Event)=>{
                    if(event.user?.id!=userId){
                        setTyping(false)
                    }
                })
                setChannel(chatChannel)
                setClient(ChatClient)
            } catch (error) {
                router.push('/chat')
            }finally{
                setLoading(false)
            }
        }
        if(otherUser){
            InitiliazeChat()
        }
        return ()=>{
            if(client){
                client.disconnectUser()
            }
        }
    },[otherUser])

    async function handleVideoCall(){
        try {
            const {callId}=await createVideoCall(otherUser.id)
            setVideoCallId(callId!)
            setShowVideoCall(true)
            setVideoInitiator(true)

            if(channel){
                const message={
                    text:'You have been invited for a video call!📹',
                    call_id:callId,
                    caller_id:currentUserId,
                    caller_name:currentUserName||"Someone"
                }
                await channel.sendMessage(message)
            }
        } catch (error) {
            console.log(error)
        }
    }
    function handleDeclineCall(){
        setshowincomingcall(false)
        setCallerName("")
        setVideoCallId("")
    }
    function handleAcceptCall(){
        setVideoCallId(incomingCall)
        setShowVideoCall(true)
        setIncomingCall("")
        setVideoInitiator(false)
        setshowincomingcall(false)
    }
    useImperativeHandle(ref,()=>({
        handleVideoCall
    }))
        if (!client || !channel) {
        return (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
                Setting up chat...
            </p>
            </div>
        </div>
        );
    }
    async function handleSubmit(e:React.FormEvent){
        e.preventDefault()
        if(newMessage.trim()&&channel){
            try{
                const response=await channel.sendMessage({
                    text:newMessage.trim()
                })
                const message:Message={
                    id:response.message.id,
                    text:newMessage.trim(),
                    sender:'me',
                    timestamp:new Date(),
                    user_id:currentUserId
                }
                SetMessages((prev)=>{
                    const ifPreviousExist=prev?.some((msg)=>msg.id===message.id)
                    if(!ifPreviousExist){
                        return [...(prev ?? []), message]
                    }
                    return prev;
            })
            setnewMessage("")
            }catch(error){
                console.log("Error sending message",error)
            }
        }
    }
    function formatTime(date:Date){
        return date.toLocaleDateString([],{hour:'2-digit',minute:'2-digit'})
    }
    return(
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth chat-scrollbar relative"
        style={{ scrollBehavior: "smooth" }}
    >
        {messages?.map((msg,key)=>(
            <div key={key} className={`flex ${msg.sender==="me"?"justify-end":'justify-start'}`}>
                <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.sender === "me"
                    ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
                >
                    <p className="text-sm">{msg.text}</p>
                    <p
                    className={`text-xs mt-1 ${
                    msg.sender === "me"
                        ? "text-pink-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                    {formatTime(msg.timestamp)}
                </p>
                </div>
            </div>
        ))}
            {isTyping && (
            <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                    ></div>
                </div>
                </div>
            </div>
            )}
        <div ref={messageEndRef}/>
        </div>
        {
            scrollButton&&(
                <div className="absolute bottom-20 right-6 z-10">
          <button
            onClick={scroll2Down}
            className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Scroll to bottom"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
            )
        }
        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <form action="" className="flex space-x-2" onSubmit={handleSubmit}>
                <input
                type="text"
                value={newMessage}
                onChange={(e)=>{
                    setnewMessage(e.target.value)
                    if(channel&&e.target.value.length>0){
                         channel.keystroke() 
                    }
                }}
                placeholder="Type a message"
                disabled={!channel}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-800 dark:text-white"/>
                <button
                type="submit"
                disabled={!newMessage.trim() || !channel}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
                <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14m-7-7l7 7-7 7"
            />
            </svg>
        </button>
            </form>
        </div>
            {showincomingcall && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm mx-4 shadow-2xl">
                <div className="text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-pink-500">
                    <img
                    src={otherUser.avatar_url}
                    alt={otherUser.full_name}
                    className="w-full h-full object-cover"
                    />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Incoming Video Call
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {callername} is calling you
                </p>
                <div className="flex space-x-4">
                    <button
                    onClick={handleDeclineCall}
                    className="flex-1 bg-red-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-red-600 transition-colors duration-200"
                    >
                    Decline
                    </button>
                    <button
                    onClick={handleAcceptCall}
                    className="flex-1 bg-green-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-green-600 transition-colors duration-200"
                    >
                    Accept
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}
        {
            showVideoCall&&videoCallId&&
             <VideoCall onCallEnd={()=>console.log("call ended")} callId={videoCallId} isIncomimg={!isVideoInitiator}/>
        }
        </div>
    )
}