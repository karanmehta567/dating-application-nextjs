'use client'
import { uploadprofilePhoto } from "@/lib/actions/profile";
import React from "react";

export default function PhotoUpload({onPhotoUploaded}:{onPhotoUploaded:(url:string)=>void}){
    const [error,setError]=React.useState<string|null>(null)
    const [loading,setLoading]=React.useState<boolean>(false)
    const fileInputRef=React.useRef<HTMLInputElement>(null)
    async function handleFile(event:React.ChangeEvent<HTMLInputElement>){
        const file = event.target.files ? event.target.files[0] : null;
        if(!file){
            return;
        }
        if(!file.type.startsWith('image/')){
            setError('Please select an appropriate image type');
            return;
        }
        if(file.size>10*1024*1024){
            setError('The File Size should be less than 10 MB')
            return;
        }
        setLoading(true)
        setError(null)
        try {
            const result=await uploadprofilePhoto(file)
            if(result.success&&result.url){
                onPhotoUploaded(result.url)
                setError(null)
            }else{
                setError('Failed to upload photo')
            }
        } catch (error) {
            setError("Failed to change photo,try again") 
        }finally{
            setLoading(false)
        }
    }
    function buttonClick(){
        fileInputRef.current?.click()
    }
    return (
        <div className="absolute bottom-0 right-0">
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} ref={fileInputRef} />
            <button type="button" onClick={buttonClick} disabled={loading} title="Change Photo" className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
             {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
            </button>
        </div>
    )
}