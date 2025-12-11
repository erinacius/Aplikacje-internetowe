DROP TABLE IF EXISTS cat;

CREATE TABLE cat (
                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                     name TEXT NOT NULL,
                     breed TEXT NOT NULL,
                     age INTEGER NOT NULL,
                     description TEXT,
                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO cat (name, breed, age, description) VALUES
                                                    ('Whiskers', 'Persian', 3, 'Fluffy white cat with blue eyes'),
                                                    ('Shadow', 'British Shorthair', 5, 'Grey cat who loves to hide in dark corners');