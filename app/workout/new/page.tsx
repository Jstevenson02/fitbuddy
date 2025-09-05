"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Workout {
  date: string;
  exercise: string;
  duration: number;
  calories?: number;
}

export default function NewWorkout() {
  const router = useRouter();
  const [formData, setFormData] = useState<Workout>({ date: "", exercise: "", duration: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Check for authenticated user
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("User not authenticated:", error?.message);
        router.push("/login");
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanedData = {
      date: formData.date,
      exercise: formData.exercise,
      duration: isNaN(formData.duration) ? 0 : formData.duration,
      calories: formData.calories && !isNaN(formData.calories) ? formData.calories : null,
    };

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated:", userError?.message);
      alert("Please log in to save a workout.");
      router.push("/login");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from("workouts")
      .insert([{ ...cleanedData, user_id: user.id }]);
    if (error) {
      console.error("Error inserting workout:", error.message);
      alert("Failed to save workout: " + error.message);
    } else {
      router.push("/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <div className='flex flex-col items-center min-h-screen p-4'>
      <h1 className='text-2xl mb-4'>Log a Workout</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
        <input
          type='date'
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <input
          type='text'
          placeholder='Exercise (e.g., Running)'
          value={formData.exercise}
          onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
          required
        />
        <input
          type='number'
          placeholder='Duration (minutes)'
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
          required
        />
        <input
          type='number'
          placeholder='Calories (optional)'
          value={formData.calories ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              calories: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
        />
        <button
          type='submit'
          className='bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400'
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
