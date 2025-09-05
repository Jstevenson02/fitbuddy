"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Exercise {
  name: string;
  reps: number;
}

interface Workout {
  date: string;
  duration: number;
  exercises: Exercise[];
}

export default function NewWorkout() {
  const router = useRouter();
  const [formData, setFormData] = useState<Workout>({ date: "", duration: 0, exercises: [] });
  const [currentExercise, setCurrentExercise] = useState({ name: "", reps: 0 });
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

  const addExercise = () => {
    if (currentExercise.name && currentExercise.reps > 0) {
      setFormData({
        ...formData,
        exercises: [...formData.exercises, currentExercise],
      });
      setCurrentExercise({ name: "", reps: 0 }); // Reset input fields
    } else {
      alert("Please enter a valid exercise name and reps.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanedData = {
      date: formData.date,
      duration: isNaN(formData.duration) ? 0 : formData.duration,
      exercises: formData.exercises,
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
      <div className='w-full max-w-2xl mb-4'>
        <button
          onClick={() => router.push("/workout/history")}
          className='mt-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
        >
          Back to History
        </button>
      </div>
      <h1 className='text-2xl mb-4'>Log a Workout</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-2 w-full max-w-md'>
        <input
          type='date'
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className='border p-2 rounded'
        />
        <input
          type='number'
          placeholder='Duration (minutes)'
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
          required
          className='border p-2 rounded'
        />
        <div className='flex flex-col gap-2'>
          <input
            type='text'
            placeholder='Exercise (e.g., Running)'
            value={currentExercise.name}
            onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
            className='border p-2 rounded'
          />
          <input
            type='number'
            placeholder='Reps'
            value={currentExercise.reps || ""}
            onChange={(e) =>
              setCurrentExercise({ ...currentExercise, reps: parseInt(e.target.value) || 0 })
            }
            className='border p-2 rounded'
          />
          <button
            type='button'
            onClick={addExercise}
            className='bg-blue-500 text-white px-4 py-2 rounded'
          >
            Add Exercise
          </button>
        </div>
        {formData.exercises.length > 0 && (
          <div className='mt-4'>
            <h2 className='text-lg font-semibold'>Added Exercises:</h2>
            <ul className='list-disc pl-5'>
              {formData.exercises.map((exercise, index) => (
                <li key={index}>
                  {exercise.name} - {exercise.reps} reps
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          type='submit'
          className='bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400'
          disabled={isLoading || formData.exercises.length === 0}
        >
          {isLoading ? "Saving..." : "Save Workout"}
        </button>
      </form>
    </div>
  );
}
