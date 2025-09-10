import { UserProfile } from "@/app/profile/page";
import Image from "next/image";

export default function MatchCard({user}:{user:UserProfile}){
      function calculateAge(birthdate:string){
        const today=new Date();
        const birthDate=new Date(birthdate);
        let age=today.getFullYear()-birthDate.getFullYear();
        const monthDiff=today.getMonth()-birthDate.getMonth();
        if(monthDiff<0 || (monthDiff==0 &&today.getDate()<birthDate.getDate())){
            age--;
        }
        return age;
    }
    return (
        <div className="relative w-full max-w-sm mx-auto">
            <div className="card-swipe aspect-[3/4] overflow-hidden">
            <div className="relative w-full h-full">
                    <Image
                        src={user?.avatar_url && user.avatar_url.trim() !== "" ? user.avatar_url : "/user-image.jpg"}
                        alt={user?.full_name ??"Random Name"}
                        fill
                        className={`object-cover transition-opacity duration-300`}
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="flex items-end justify-between">
                            <div>
                            <h2 className="text-2xl font-bold mb-1">
                            {user.full_name}, {calculateAge(user.birthdate)}
                            </h2>
                            <p className="text-sm opacity-90 mb-2">@{user.username}</p>
                            <p className="text-sm leading-relaxed">{user.bio}</p>
                            </div>
                            </div>
                        </div>
            </div>
            </div>
        </div>
    )
}