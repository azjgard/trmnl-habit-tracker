"use client";

import { useMemo, useRef, useState } from "react";

import style from "./Habit.module.css";

export type Habit = {
  id: number;
  name: string;
  image: string | null;
  weekly_goal: number;
};

type HabitState = Omit<Habit, "weekly_goal"> & { weekly_goal: number | "" };

export default function Habit(props: {
  habit: Habit;
  onRemove: (id: number) => void;
  onUpdate: (habit: Habit) => void;
}) {
  const habitStateInitial = useRef<HabitState>(props.habit);
  const [habitState, setHabitState] = useState<HabitState>(props.habit);

  const [metaState, setMetaState] = useState({
    loading: false,
    error: null as string | null,
  });

  const { habit: habit } = props;

  const hasChanges = useMemo(() => {
    return (
      habitState.name !== habitStateInitial.current.name ||
      habitState.image !== habitStateInitial.current.image ||
      habitState.weekly_goal !== habitStateInitial.current.weekly_goal
    );
  }, [habitState]);

  const onWeeklyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHabitState((prev) => ({
      ...prev,
      weekly_goal: value ? parseInt(value) : "",
    }));

    setMetaState((s) => ({ ...s, error: null }));
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHabitState((prev) => ({
      ...prev,
      name: value,
    }));
  };

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log(e.target);
      const image = e.target?.result;
      setHabitState((prev) => ({
        ...prev,
        image: image as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const onImageRemoval = (e: React.MouseEvent) => {
    e.preventDefault();
    setHabitState((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const onSaveChanges = async () => {
    setMetaState((s) => ({ ...s, loading: true }));

    if (
      !(
        habitState.weekly_goal &&
        habitState.weekly_goal >= 1 &&
        habitState.weekly_goal <= 7
      )
    ) {
      setMetaState((s) => ({
        ...s,
        loading: false,
        error: "Weekly goal must be between 1 and 7",
      }));
      return;
    }

    const body: Record<string, string | number | null | undefined> = {
      name: habitState.name,
      image: habitState.image,
      weekly_goal: habitState.weekly_goal,
    };

    if (habit.id > 0) {
      body.id = habit.id;
    }

    const response = await fetch("/api/habit", {
      method: "PUT",
      body: JSON.stringify(body),
    });

    const newHabit = await response.json();
    habitStateInitial.current = newHabit;
    setHabitState(newHabit);
    setMetaState((s) => ({ ...s, loading: false }));
    props.onUpdate(newHabit);
  };

  const onDeleteClick = async () => {
    if (!confirm("Are you sure you want to delete this habit?")) return;

    setMetaState((s) => ({ ...s, loading: true }));

    const response = await fetch("/api/habit", {
      method: "DELETE",
      body: JSON.stringify({ id: habit.id }),
    });

    if (response.ok) {
      props.onRemove(habit.id);
      return;
    }

    setMetaState((s) => ({
      ...s,
      loading: false,
      error: "Failed to delete habit",
    }));
  };

  return (
    <div className={style.habit}>
      <button className={style.delete} onClick={onDeleteClick}>
        X
      </button>
      <fieldset>
        <label>
          Name:{" "}
          <input type="text" value={habitState.name} onChange={onNameChange} />
        </label>
      </fieldset>
      <fieldset>
        <label>
          Weekly Goal:{" "}
          <input
            type="number"
            value={habitState.weekly_goal}
            onChange={onWeeklyGoalChange}
          />{" "}
        </label>
      </fieldset>
      <fieldset>
        <label>
          {habitState.image && (
            <>
              <img src={habitState.image} />
              <button onClick={onImageRemoval}>Remove image</button>
            </>
          )}
          {!habitState.image && (
            <>
              <p>No image uploaded</p>
              <input type="file" onChange={onImageUpload} />
            </>
          )}
        </label>
      </fieldset>
      <fieldset>
        {hasChanges && (
          <button
            onClick={onSaveChanges}
            disabled={Boolean(metaState.loading || metaState.error)}
          >
            {metaState.loading ? "Saving..." : "Save Changes"}
          </button>
        )}
        {metaState.error && <p>{metaState.error}</p>}
      </fieldset>
    </div>
  );
}
