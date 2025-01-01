"use client";

import { useEffect, useState } from "react";
import Habit, { Habit as HabitType } from "./Habit";

export default function HabitContainer(props: { initialHabits: HabitType[] }) {
  const [habits, setHabits] = useState(props.initialHabits);
  const [validated, setValidated] = useState(false);

  const onRemoveHabit = (id: number) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const onUpdateHabit = (habit: HabitType) => {
    setHabits((prev) =>
      prev.map((prevHabit) => (prevHabit.id === habit.id ? habit : prevHabit))
    );
  };

  const onCreateHabit = () => {
    setHabits((prev) => [
      ...prev,
      {
        id: habits.length * -1,
        name: "",
        image: null,
        weekly_goal: 0,
      },
    ]);
  };

  return (
    <>
      <button onClick={onCreateHabit}>+ New habit</button>
      {habits.map((habit) => (
        <Habit
          key={habit.id}
          habit={habit}
          onRemove={onRemoveHabit}
          onUpdate={onUpdateHabit}
        />
      ))}
    </>
  );
}
