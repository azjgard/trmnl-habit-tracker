"use client";
import React from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";

import style from "./Habit.module.css";
import { getInstancePasswordHeaders } from "./lib";

import type {
  Habit as HabitType,
  HabitsWithDaysAccomplished,
} from "./backend/services/habit";
import { getDayMarkup } from "./shared/services/habit";

type HabitState = Omit<HabitType, "weekly_goal"> & { weekly_goal: number | "" };

export default function Habit(props: {
  habit: HabitType;
  today: number;
  onRemove: (id: number) => void;
  onUpdate: (habits: HabitType[]) => void;
}) {
  const habitStateInitial = useRef<HabitState>(props.habit);
  const habitFromProps = props.habit;
  const [habitState, setHabitState] = useState<HabitState>(props.habit);

  // this is gross but doesn't matter rn
  useEffect(() => {
    habitStateInitial.current = habitFromProps;
    setHabitState(habitFromProps);
  }, [habitFromProps, setHabitState]);

  const [metaState, setMetaState] = useState({
    loading: false,
    file: null as File | null,
    error: null as string | null,
  });

  const hasChanges = useMemo(() => {
    return (
      habitState.name !== habitStateInitial.current.name ||
      habitState.image !== habitStateInitial.current.image ||
      habitState.weekly_goal !== habitStateInitial.current.weekly_goal
    );
  }, [habitState]);

  const onWeeklyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const valueInt = parseInt(value);

    const weeklyGoal = isNaN(valueInt)
      ? ""
      : Math.min(7, Math.max(1, valueInt));

    setHabitState((prev) => ({
      ...prev,
      weekly_goal: weeklyGoal,
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
      const image = e.target?.result;
      setHabitState((prev) => ({
        ...prev,
        image: image as string,
      }));
      setMetaState((s) => ({ ...s, file }));
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

    if (habitFromProps.id > 0) {
      body.id = habitFromProps.id;
    }

    if (metaState.file) {
      const imageFormData = new FormData();
      imageFormData.append("image", metaState.file);
      const imageResponse = await fetch("/api/habit_image", {
        method: "PUT",
        body: imageFormData,
        headers: getInstancePasswordHeaders(),
      });
      body.image = await imageResponse.text();
      setMetaState((s) => ({ ...s, file: null }));
    }

    const response = await fetch("/api/habit", {
      method: "PUT",
      body: JSON.stringify(body),
      headers: getInstancePasswordHeaders(),
    });

    const { habits: newHabits }: HabitsWithDaysAccomplished =
      await response.json();

    props.onUpdate(newHabits);

    setMetaState((s) => ({ ...s, loading: false }));
  };

  const onDeleteClick = async () => {
    if (!confirm("Are you sure you want to delete this habit?")) return;

    setMetaState((s) => ({ ...s, loading: true }));

    const response = await fetch("/api/habit", {
      method: "DELETE",
      body: JSON.stringify({ id: habitFromProps.id }),
      headers: getInstancePasswordHeaders(),
    });

    if (response.ok) {
      props.onRemove(habitFromProps.id);
      return;
    }

    setMetaState((s) => ({
      ...s,
      loading: false,
      error: "Failed to delete habit",
    }));
  };

  return (
    <>
      <div className={style.habitContainer}>
        <button className={style.habitRemoveButton} onClick={onDeleteClick}>
          ❌
        </button>
        <div className={style.row}>
          <div className={style.habitImage}>
            {habitState.image && (
              <>
                <img src={habitState.image} />
                <button
                  className={style.habitImageRemoveButton}
                  onClick={onImageRemoval}
                >
                  ❌
                </button>
              </>
            )}
            {!habitState.image && (
              <div className={style.habitImageUpload}>
                <input type="file" onChange={onImageUpload} />
              </div>
            )}
          </div>
          <div className={style.habitInfo}>
            <h1 className={style.habitName}>
              <input
                type="text"
                value={habitState.name}
                onChange={onNameChange}
                placeholder="Do something cool"
              />
            </h1>
            <h3 className={style.habitWeeklyTarget}>
              Targeting
              <input
                type="text"
                className={style.bold}
                value={habitState.weekly_goal}
                onChange={onWeeklyGoalChange}
              />{" "}
              day{habitState.weekly_goal === 1 ? "" : "s"} per week
            </h3>
          </div>
        </div>
        <div className={style.row}>
          <ul className={style.habitDayList}>
            {habitState.days.map((day, i) => {
              const isAccomplished = day;
              const isToday = props.today === i;
              const isFailed = props.today > i;

              return (
                <li
                  key={i}
                  className={classNames(style.habitDay, {
                    [style.accomplished]: isAccomplished,
                    [style.today]: isToday,
                    [style.failed]: isFailed,
                  })}
                >
                  {getDayMarkup(i, isAccomplished, isFailed)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className={style.saveChangesContainer}>
        {metaState.error && <p className={style.error}>{metaState.error}</p>}
        {hasChanges && (
          <button
            onClick={onSaveChanges}
            disabled={Boolean(metaState.loading || metaState.error)}
          >
            {metaState.loading ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </>
  );
}
