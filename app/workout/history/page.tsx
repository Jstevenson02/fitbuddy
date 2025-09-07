"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Exercise {
  name: string;
  reps: number;
}

interface Workout {
  id: string;
  date: string;
  duration: number;
  exercises: Exercise[];
}

export default function WorkoutHistory() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User not authenticated:", userError?.message);
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("workouts")
        .select("id, date, duration, exercises")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching workouts:", error.message);
        setError("Failed to load workouts: " + error.message);
      } else {
        setWorkouts(data || []);
      }
      setLoading(false);
    };

    fetchWorkouts();
  }, [router]);

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

  if (error) {
    return (
      <div className='flex flex-col items-center min-h-screen p-4'>
        <h1 className='text-2xl font-bold mb-4'>Workout History</h1>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center min-h-screen p-4'>
      <div className='flex justify-between w-full max-w-2xl mb-4' id='navigation-buttons'>
        <button
          onClick={() => router.push("/workout/new")}
          className='mt-6 bg-blue-500 text-white text-lg px-4 py-2 rounded hover:bg-blue-600'
        >
          + New Workout
        </button>
        <button
          onClick={() => router.push("/")}
          className='mt-6 bg-gray-500 text-white text-lg px-4 py-2 rounded hover:bg-gray-400'
        >
          🏠︎
        </button>
      </div>
      <h1 className='text-2xl font-bold mb-4'>Workout History</h1>
      {workouts.length === 0 ? (
        <p className='text-gray-500'>No workouts found.</p>
      ) : (
        <div className='w-full max-w-2xl space-y-4'>
          {workouts.map((workout) => (
            <div key={workout.id} className='border rounded-lg p-4 bg-gray-800 shadow-sm'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                <p>
                  <strong className='font-semibold'>Date:</strong>{" "}
                  {new Date(workout.date).toLocaleDateString()}
                </p>
                <p>
                  <strong className='font-semibold'>Duration:</strong> {workout.duration} minutes
                </p>
              </div>
              <div className='mt-2'>
                <p className='font-semibold'>Exercises:</p>
                {workout.exercises.length === 0 ? (
                  <p className='text-gray-500'>No exercises recorded.</p>
                ) : (
                  <ul className='list-disc pl-5 mt-1'>
                    {workout.exercises.map((exercise, index) => (
                      <li key={index} className='text-white'>
                        {exercise.name} - {exercise.reps} reps
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <button
          onClick={() => {
            const el = document.getElementById("navigation-buttons");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className='mt-4 bg-gray-500 text-white px-2 py-1.5 rotate-270 rounded-full text-2xl  hover:bg-gray-400 border-2 border-white'
        >
          ➜
        </button>
      </div>
    </div>
  );
}
