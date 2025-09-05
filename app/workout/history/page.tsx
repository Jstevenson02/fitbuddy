"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Workout {
  id: string;
  date: string;
  exercise: string;
  duration: number;
  calories?: number;
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
        .select("id, date, exercise, duration, calories")
        .eq("user_id", user.id)
        .order("id", { ascending: true });

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

  if (loading) {
    return (
      <div className='flex flex-col items-center min-h-screen p-4'>
        <h1 className='text-2xl mb-4'>Workout History</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center min-h-screen p-4'>
        <h1 className='text-2xl mb-4'>Workout History</h1>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center min-h-screen p-4'>
      <h1 className='text-2xl mb-4'>Workout History</h1>
      {workouts.length === 0 ? (
        <p>No workouts found.</p>
      ) : (
        <ul className='w-full max-w-md'>
          {workouts.map((workout) => (
            <li key={workout.id} className='border p-4 mb-2 rounded'>
              <p>
                <strong>ID:</strong> {workout.id}
              </p>
              <p>
                <strong>Date:</strong> {new Date(workout.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Exercise:</strong> {workout.exercise}
              </p>
              <p>
                <strong>Duration:</strong> {workout.duration} minutes
              </p>
              {workout.calories && (
                <p>
                  <strong>Calories:</strong> {workout.calories}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => router.push("/workout/new")}
        className='mt-4 bg-blue-500 text-white px-4 py-2 rounded'
      >
        Log New Workout
      </button>
    </div>
  );
}
