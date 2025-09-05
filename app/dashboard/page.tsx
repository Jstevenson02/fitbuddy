// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function Dashboard() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className='flex flex-col items-center min-h-screen p-4'>
      <h1 className='text-2xl mb-4'>Welcome, {user.email}!</h1>
      <Link href='/log' className='bg-green-500 text-white px-4 py-2 rounded mb-2'>
        Log a Workout
      </Link>
      <Link href='/history' className='bg-blue-500 text-white px-4 py-2 rounded'>
        View History
      </Link>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          redirect("/login");
        }}
        className='bg-red-500 text-white px-4 py-2 rounded mt-4'
      >
        Logout
      </button>
    </div>
  );
}
