CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,           
    name TEXT NOT NULL,              
    image TEXT,
    weekly_goal SMALLINT NOT NULL
);

CREATE TABLE IF NOT EXISTS habit_logs (
    id SERIAL PRIMARY KEY,              
    habit_id INT NOT NULL,              
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    timestamp timestamp default current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);