"use client";

import { useState } from "react";
import Habit from "./Habit";
import { Inter } from "next/font/google";
import type {
  HabitsWithDaysAccomplished,
  Habit as HabitType,
} from "./backend/services/habit";

import style from "./HabitContainer.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function HabitContainer(props: {
  initialData: HabitsWithDaysAccomplished;
}) {
  const { today } = props.initialData;
  const [habits, setHabits] = useState(props.initialData.habits);

  const onRemoveHabit = (id: number) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const onUpdateHabit = (habits: HabitType[]) => {
    setHabits(habits);
  };

  const onCreateHabit = () => {
    setHabits((prev) => [
      ...prev,
      {
        // hack for unique ids since used as keys, breaks down with multiple new habits at once
        // but idc right now
        id: habits.length * -1,
        name: "",
        image: null,
        weekly_goal: 0,
        days: [false, false, false, false, false, false, false],
      },
    ]);
  };

  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <button onClick={onCreateHabit}>+ New habit</button>
      <div className={style.habits}>
        {habits.map((habit) => (
          <Habit
            key={habit.id}
            habit={habit}
            today={today}
            onRemove={onRemoveHabit}
            onUpdate={onUpdateHabit}
          />
        ))}
      </div>
    </>
  );
}
