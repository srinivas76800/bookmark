'use client'
import Navbar from "@/components/Navbar"
import { supabase } from "@/lib/supabase"
import { useCallback, useEffect, useState } from "react"

type Bookmark = {
  id: string
  user_id: string
  title: string
  url: string
  created_at: string
}

export default function Home() {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [user, setUser] = useState<any>(null)

  //getting all bookmarks from this funtion.
  const getUserBookmarks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setUser(null)
      setBookmarks([])
      return
    }
    setUser(user)
    const { data, error } = await supabase.from('bookmarks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

    if (!error && data) {
      setBookmarks(data)
    }
  }, [])

  //getting all bookmarks whenever new one added without refreash
  useEffect(() => {
    getUserBookmarks()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUserBookmarks()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [getUserBookmarks])

  useEffect(() => {
    if (!user) return

    const channel = supabase.channel(`bookmarks-${user.id}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bookmarks',
      filter: `user_id=eq.${user.id}`,
    },
      () => {
        getUserBookmarks()
      }
    ).subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, getUserBookmarks])

  //submit function
  const submitHandler = async (e: any) => {
    e.preventDefault()
    if (!title || !url) { alert('fill all details'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("Please login first")
      return
    }

    const { error } = await supabase.from("bookmarks").insert([{
      user_id: user.id,
      title,
      url,
    },
    ])

    if (error) {
      console.log(error)
    } else {
      setTitle("")
      setUrl("")
      getUserBookmarks()
    }
  }

  //delete btn logic
  const delectHandler = async (id: any) => {
    console.log('coming')
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    if (error) { console.log('got error', error); return }
    getUserBookmarks()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Navbar />
      <main className="flex w-full max-w-3xl items-center justify-center gap-2 bg-white px-16 py-32 dark:bg-black sm:items-start">
        {/* <button className="rounded-2xl border bg-white p-2 text-black" onClick={loginWithGoogle}>login with google</button> */}
        <form className="flex gap-4" onSubmit={(e) => submitHandler(e)}>
          <div className="flex items-center w-full border gap-2 bg-white text-white/90 border-gray-500/30 h-12 rounded-full overflow-hidden">
            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="title" className="h-full bg-transparent w-full pl-6 text-sm placeholder-gray-400 text-black outline-none" />
          </div>
          <div className="flex items-center w-full border gap-2 bg-white text-white/90 border-gray-500/30 h-12 rounded-full overflow-hidden">
            <input value={url} onChange={(e) => setUrl(e.target.value)} type="text" placeholder="url" className="h-full bg-transparent w-full pl-6 text-sm placeholder-gray-400 text-black outline-none" />
          </div>
          <button className="mr-1 h-12 w-56 rounded-full bg-indigo-500 text-sm text-white transition active:scale-95">Add</button>
        </form>
      </main>
      <div className="flex w-screen">

        <div className="m-5 h-full w-full rounded-2xl p-4">
          {bookmarks.map((item) => (
            <div key={item.id} className="flex items-center justify-center">
               <div className="bg-indigo-500/5 border overflow-hidden border-gray-500/20 text-sm text-gray-500 flex flex-col items-center w-[60%] rounded-lg my-2">
                <div className="flex bg-black  items-center justify-between w-full px-4 py-2">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-lg text-white">{item.title}</p>
                    </div>
                    <button className="hover:cursor-pointer" type="button" aria-label="more" onClick={()=>delectHandler(item.id)}>
                        <p className="bg-red-500/20 px-3 py-0.5 rounded border border-red-500/30 text-red-600">delete</p> 
                    </button>
                </div>
                <div className="flex flex-col items-center gap-2 w-full p-4 pb-2 rounded-b-lg bg-white border-t border-gray-500/20">
                    <div className="flex items-center w-full justify-between">
                        <p>BookMark</p>
                        <div className="flex items-center gap-2">
                            <p>{item.url}</p>
                            {/**/}
                        </div>
                    </div>
                    <div className="w-full h-px bg-gray-300/60"></div>
                    <div className="flex items-center w-full justify-between">
                        <p>created at</p>
                        <p>{item.created_at}</p>
                    </div>
                </div>
            </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
