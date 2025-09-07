"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("User");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error fetching user:", error);
        setLoading(false);
        return;
      }

      const fullName = user.user_metadata?.name || "User";
      const firstName = fullName.split(" ")[0]; // Extract first name
      setFirstName(firstName);
      setLoading(false);
    }

    fetchUser();
  }, []);

  if (loading)
    return (
      <div className='h-screen text-center flex flex-col items-center justify-center'>
        <div
          className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white'
          role='status'
        >
          <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
            Loading...
          </span>
        </div>
      </div>
    );

  return (
    <div className='flex flex-col items-center min-h-screen p-4'>
      <div className='flex justify-between w-full max-w-2xl mb-4'>
        <button
          onClick={() => router.push("/workout/new")}
          className='mt-6 bg-blue-500 text-white  px-4 py-2 rounded hover:bg-blue-600'
        >
          +
        </button>
        <button
          onClick={() => router.push("/workout/history")}
          className='mt-6 bg-gray-500 text-white  px-4 py-2 rounded hover:bg-gray-400'
        >
          History
        </button>
        <button
          onClick={() => router.push("/")}
          className='mt-6 bg-gray-500 text-white  px-4 py-2 rounded hover:bg-gray-400'
        >
          🏠︎
        </button>
      </div>
      <h1 className='text-xl font-bold mb-4'>Welcome, {firstName} </h1>
      <p className='text-gray-500'>Your personal workout tracker</p>
    </div>
  );
}
