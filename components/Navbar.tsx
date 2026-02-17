import { supabase } from "@/lib/supabase";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { URL } from "url";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>('')

    const toggleMenu = () => {
        setIsOpen((prev) => !prev);
    };

    const userprofiledata = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user?.user_metadata)

    }
    //user profile
    useEffect(() => {
        userprofiledata()
    }, [])

    //this is continue with google btn
    const loginWithGoogle = async () => {
        const res = await supabase.auth.signInWithOAuth({
            provider: "google",
        })
        console.log(res, 'from google log..')
    }


    return (
        <nav className="flex items-center border mx-4 max-md:w-full max-md:justify-between border-slate-700 px-6 py-4 rounded-full text-white text-sm relative">

            <Image src={user.picture} className="rounded-full mx-2" alt="pic" height={25} width={25} />
            <a>{user.full_name}</a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6 ml-7">
                <a className="relative overflow-hidden h-6 group">
                    <span className="block group-hover:-translate-y-full transition-transform duration-300">welcome back !</span>
                    <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">welcome back !</span>
                </a>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden ml-14 md:flex items-center gap-4">
                <a href="https://my-port-folio-liard-psi.vercel.app" className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full">
                    My personal portfolio
                </a>
                <button onClick={loginWithGoogle} className="bg-white text-black px-4 py-2 rounded-full hover:shadow-[0px_0px_30px_14px] shadow-[0px_0px_30px_7px] hover:shadow-white/50 shadow-white/50 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition duration-300">
                    {user? ('log Out') : ('login with google') }
                </button>
            </div>

            {/* Mobile Toggle Button */}
            <button
                onClick={toggleMenu}
                className="md:hidden text-gray-600"
            >
                ☰
            </button>

            {/* Mobile Menu */}
            <div className={`absolute top-20 left-0 bg-black w-full flex-col items-center gap-4 md:hidden ${isOpen ? "flex" : "hidden"}`}>
                <a href="#">Products</a>
                <a href="#">Customer Stories</a>
                <a href="#">Pricing</a>
                <a href="#">Docs</a>
            </div>

        </nav>
    );
};

export default Navbar;
