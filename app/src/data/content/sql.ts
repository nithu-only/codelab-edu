import type { LearningPath } from "../../types";

export const sqlPath: LearningPath = {
  language: "sql",
  label: "SQL",
  blurb:
    "Query relational data: SELECT, filtering, joins, aggregation and subqueries against the sample school database.",
  topics: [
    {
      id: "variables",
      title: "Basic SELECT",
      difficulty: "beginner",
      lessons: [
        {
          id: "sql-select",
          title: "SELECT columns FROM a table",
          concept:
            "SELECT retrieves rows: SELECT col1, col2 FROM table; use SELECT * for every column. Semicolons end statements. The practice database contains students(id, name, major, gpa), courses(id, code, title, credits) and enrollments(student_id, course_id, grade).",
          syntax: "SELECT col1, col2 FROM table;\nSELECT * FROM students;",
          exampleCode: "SELECT name, gpa FROM students ORDER BY id;",
          exampleStdin: "",
          exampleOutput:
            "+---------------+-----+\n| name          | gpa |\n+---------------+-----+\n| Aisha Khan    | 3.8 |\n| Ben Carter    | 3.2 |\n| Chloe Nguyen  | 3.9 |\n| Diego Ramirez | 3.4 |\n| Emma O'Brien  | 3.6 |\n| Farah Patel   | 3.1 |\n+---------------+-----+\n6 row(s)",
        },
      ],
      problems: [
        {
          id: "sql-prog-select",
          title: "List every student",
          difficulty: "easy",
          prompt:
            "Print the id and name of every student, ordered by id. One result table with headers id and name.",
          starterCode: "-- print id and name of all students, ordered by id\n",
          samples: [
            {
              input: "",
              expectedOutput:
                "+----+---------------+\n| id | name          |\n+----+---------------+\n| 1  | Aisha Khan    |\n| 2  | Ben Carter    |\n| 3  | Chloe Nguyen  |\n| 4  | Diego Ramirez |\n| 5  | Emma O'Brien  |\n| 6  | Farah Patel   |\n+----+---------------+\n6 row(s)",
            },
          ],
          hints: ["SELECT id, name FROM students ORDER BY id;"],
          explanation: "Projection: name exactly the columns you want, in order, with ORDER BY for stable output.",
        },
      ],
    },
    {
      id: "operators",
      title: "WHERE & Comparison",
      difficulty: "beginner",
      lessons: [
        {
          id: "sql-where",
          title: "Filtering rows with WHERE",
          concept:
            "WHERE keeps only rows matching a condition. Comparison: = != <> > < >= <=. Combine with AND / OR / NOT. Pattern matching uses LIKE with % (any run of characters) and _ (exactly one). NULL needs IS NULL / IS NOT NULL — = NULL never matches anything.",
          syntax: "SELECT * FROM students WHERE gpa >= 3.5;\nSELECT * FROM students WHERE major LIKE 'Math%';",
          exampleCode: "SELECT name, gpa FROM students WHERE gpa >= 3.5 ORDER BY gpa DESC;",
          exampleStdin: "",
          exampleOutput:
            "+--------------+-----+\n| name         | gpa |\n+--------------+-----+\n| Chloe Nguyen | 3.9 |\n| Aisha Khan   | 3.8 |\n| Emma O'Brien | 3.6 |\n+--------------+-----+\n3 row(s)",
        },
      ],
      problems: [
        {
          id: "sql-prog-where",
          title: "Mathematics students",
          difficulty: "easy",
          prompt: "Print the names of all students whose major is 'Mathematics', ordered by name.",
          starterCode: "-- names of Mathematics students, ordered by name\n",
          samples: [
            {
              input: "",
              expectedOutput:
                "+-------------+\n| name        |\n+-------------+\n| Ben Carter  |\n| Farah Patel |\n+-------------+\n2 row(s)",
            },
          ],
          hints: ["WHERE major = 'Mathematics'", "String literals use single quotes in SQL."],
          explanation: "Exact text match on the major column, then alphabetical ordering.",
        },
      ],
    },
    {
      id: "conditions",
      title: "CASE, ORDER BY, LIMIT",
      difficulty: "beginner",
      lessons: [
        {
          id: "sql-case",
          title: "Conditional labels and sorting",
          concept:
            "CASE WHEN ... THEN ... ELSE ... END gives conditional values per row. ORDER BY col [ASC|DESC] sorts; LIMIT n caps the number of rows. Together they answer 'rank these rows and label them' questions.",
          syntax: "SELECT name, CASE WHEN gpa >= 3.8 THEN 'High' ELSE 'Low' END AS band FROM students;\nSELECT * FROM students ORDER BY gpa DESC LIMIT 1;",
          exampleCode: `SELECT name, gpa,
  CASE WHEN gpa >= 3.8 THEN 'High'
       WHEN gpa >= 3.4 THEN 'Medium'
       ELSE 'Low' END AS band
FROM students
ORDER BY gpa DESC;`,
          exampleStdin: "",
          exampleOutput:
            "+---------------+-----+--------+\n| name          | gpa | band   |\n+---------------+-----+--------+\n| Chloe Nguyen  | 3.9 | High   |\n| Aisha Khan    | 3.8 | High   |\n| Emma O'Brien  | 3.6 | Medium |\n| Diego Ramirez | 3.4 | Medium |\n| Ben Carter    | 3.2 | Low    |\n| Farah Patel   | 3.1 | Low    |\n+---------------+-----+--------+\n6 row(s)",
        },
      ],
      problems: [
        {
          id: "sql-prog-order",
          title: "Top student",
          difficulty: "easy",
          prompt: "Print the name of the student with the highest gpa (just one row).",
          starterCode: "-- name of the highest-gpa student\n",
          samples: [
            {
              input: "",
              expectedOutput:
                "+--------------+\n| name         |\n+--------------+\n| Chloe Nguyen |\n+--------------+\n1 row(s)",
            },
          ],
          hints: ["ORDER BY gpa DESC LIMIT 1"],
          explanation: "Sort descending by gpa and take the first row — Chloe Nguyen has 3.9.",
        },
      ],
    },
    {
      id: "loops",
      title: "Aggregate Functions",
      difficulty: "beginner",
      lessons: [
        {
          id: "sql-agg",
          title: "COUNT, SUM, AVG, MIN, MAX",
          concept:
            "Aggregates collapse many rows into one number: COUNT(*), SUM(col), AVG(col), MIN(col), MAX(col). They ignore NULL values. GROUP BY splits rows into groups so the aggregate runs once per group; HAVING filters the grouped results (WHERE filters before grouping).",
          syntax: "SELECT COUNT(*) AS n, AVG(gpa) FROM students;\nSELECT major, COUNT(*) FROM students GROUP BY major;",
          exampleCode:
            "SELECT COUNT(*) AS n, ROUND(AVG(gpa), 2) AS avg_gpa,\n       MIN(gpa) AS lowest, MAX(gpa) AS highest\nFROM students;",
          exampleStdin: "",
          exampleOutput:
            "+---+---------+--------+---------+\n| n | avg_gpa | lowest | highest |\n+---+---------+--------+---------+\n| 6 | 3.5     | 3.1    | 3.9     |\n+---+---------+--------+---------+\n1 row(s)",
        },
      ],
      problems: [
        {
          id: "sql-prog-agg",
          title: "Students per major",
          difficulty: "easy",
          prompt:
            "For each major, print the major and how many students are studying it (column n), ordered by major.",
          starterCode: "-- major and student count per major, ordered by major\n",
          samples: [
            {
              input: "",
              expectedOutput:
                "+------------------+---+\n| major            | n |\n+------------------+---+\n| Computer Science | 3 |\n| Mathematics      | 2 |\n| Physics          | 1 |\n+------------------+---+\n3 row(s)",
            },
          ],
          hints: ["GROUP BY major", "COUNT(*) becomes the column n via COUNT(*) AS n."],
          explanation: "Grouping partitions the rows by major; the aggregate counts each partition.",
        },
      ],
    },
    {
      id: "arrays",
      title: "JOINs",
      difficulty: "beginner",
      lessons: [
        {
          id: "sql-join",
          title: "Combining tables with INNER JOIN",
          concept:
            "A JOIN combines rows from two tables where a condition matches: FROM a INNER JOIN b ON a.id = b.foreign_key. INNER keeps only matched pairs; LEFT JOIN keeps every left row (NULL where unmatched). Join enrollments with students and courses to see who took what.",
          syntax: "SELECT s.name, c.code, e.grade\nFROM enrollments e\nJOIN students s ON s.id = e.student_id\nJOIN courses c ON c.id = e.course_id;",
          exampleCode: `SELECT s.name, c.code, e.grade
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id
ORDER BY s.id, c.id;`,
          exampleStdin: "",
          exampleOutput:
            "+---------------+-------+-------+\n| name          | code  | grade |\n+---------------+-------+-------+\n| Aisha Khan    | CS101 | A     |\n| Aisha Khan    | CS201 | B     |\n| Ben Carter    | CS101 | A     |\n| Ben Carter    | MA101 | A     |\n| Chloe Nguyen  | CS101 | A     |\n| Chloe Nguyen  | CS201 | A     |\n| Diego Ramirez | PH101 | B     |\n| Emma O'Brien  | CS101 | C     |\n| Emma O'Brien  | CS201 | B     |\n| Farah Patel   | MA101 | B     |\n+---------------+-------+-------+\n10 row(s)",
        },
      ],
      problems: [
        {
          id: "sql-prog-join",
          title: "Who takes CS101?",
          difficulty: "easy",
          prompt: "Print the names of the students enrolled in the course with code 'CS101', ordered by name.",
          starterCode: "-- names of students enrolled in CS101, ordered by name\n",
          samples: [
            {
              input: "",
              expectedOutput:
                "+--------------+\n| name         |\n+--------------+\n| Aisha Khan   |\n| Ben Carter   |\n| Chloe Nguyen |\n| Emma O'Brien |\n+--------------+\n4 row(s)",
            },
          ],
          hints: [
            "Join enrollments -> students -> courses.",
            "Filter with WHERE c.code = 'CS101'.",
          ],
          explanation:
            "Three-table join filtered on the course code; CS101 has enrolments from Aisha, Ben, Chloe and Emma.",
        },
      ],
    },
    {
      id: "functions",
      title: "String & Math Functions",
      difficulty: "beginner",
      lessons: [
        {
          id: "sql-fn",
          title: "Built-in functions in SELECT",
          concept:
            "SQLite (sql.js) provides string functions UPPER, LOWER, LENGTH, SUBSTR, REPLACE and || concatenation, plus numeric ROUND, ABS. They work anywhere you can write an expression: SELECT name, LENGTH(name), UPPER(major) FROM students;",
          syntax: "SELECT name, LENGTH(name) AS len, UPPER(major) FROM students;\nSELECT ROUND(AVG(gpa), 2) FROM students;",
          exampleCode: `SELECT name, LENGTH(name) AS len, UPPER(major) AS major_up
FROM students
ORDER BY id;`,
          exampleStdin: "",
          exampleOutput:
            "+---------------+-----+------------------+\n| name          | len | major_up         |\n+---------------+-----+------------------+\n| Aisha Khan    | 10  | COMPUTER SCIENCE |\n| Ben Carter    | 10  | MATHEMATICS      |\n| Chloe Nguyen  | 12  | COMPUTER SCIENCE |\n| Diego Ramirez | 13  | PHYSICS          |\n| Emma O'Brien  | 12  | COMPUTER SCIENCE |\n| Farah Patel   | 11  | MATHEMATICS      |\n+---------------+-----+------------------+\n6 row(s)",
        },
      ],
      problems: [
        {
          id: "sql-prog-fn",
          title: "Course title lengths",
          difficulty: "easy",
          prompt:
            "For every course print its code and the length of its title (column len), ordered by id.",
          starterCode: "-- course code and title length, ordered by id\n",
          samples: [
            {
              input: "",
              expectedOutput:
                "+-------+-----+\n| code  | len |\n+-------+-----+\n| CS101 | 20  |\n| CS201 | 15  |\n| MA101 | 10  |\n| PH101 | 9   |\n+-------+-----+\n4 row(s)",
            },
          ],
          hints: ["LENGTH(title) AS len", "ORDER BY id"],
          explanation: "LENGTH counts characters per row: 'Intro to Programming' is 20 characters.",
        },
      ],
    },
    {
      id: "strings",
      title: "LIKE Pattern Matching",
      difficulty: "beginner",
      lessons: [
        {
          id: "sql-like",
          title: "Searching text with LIKE",
          concept:
            "LIKE compares text against a pattern: % matches any number of characters, _ matches exactly one. In SQLite, LIKE is case-insensitive for ASCII letters by default. NOT LIKE gives the inverse. Patterns must be quoted like any string: major LIKE 'Math%'.",
          syntax: "SELECT name FROM students WHERE name LIKE 'A%';\nSELECT * FROM students WHERE major LIKE '%Science';",
          exampleCode: "SELECT name FROM students WHERE major LIKE '%Math%' ORDER BY name;",
          exampleStdin: "",
          exampleOutput:
            "+-------------+\n| name        |\n+-------------+\n| Ben Carter  |\n| Farah Patel |\n+-------------+\n2 row(s)",
        },
      ],
      problems: [
        {
          id: "sql-prog-like",
          title: "Computer Science majors",
          difficulty: "easy",
          prompt:
            "Using LIKE (not =), print the names of students whose major starts with 'C', ordered by name.",
          starterCode: "-- names with major starting with C, ordered by name (use LIKE)\n",
          samples: [
            {
              input: "",
              expectedOutput:
                "+--------------+\n| name         |\n+--------------+\n| Aisha Khan   |\n| Chloe Nguyen |\n| Emma O'Brien |\n+--------------+\n3 row(s)",
            },
          ],
          hints: ["major LIKE 'C%'", "The % wildcard matches everything after the C."],
          explanation: "Prefix pattern 'C%' selects Computer Science (the only major starting with C).",
        },
      ],
    },
    {
      id: "oop",
      title: "Subqueries & HAVING",
      difficulty: "intermediate",
      lessons: [
        {
          id: "sql-sub",
          title: "Nested queries",
          concept:
            "A subquery is a query inside another: scalar subqueries supply a single value — WHERE gpa > (SELECT AVG(gpa) FROM students) — while IN and EXISTS test membership. HAVING filters after GROUP BY, so 'groups whose count is large' needs HAVING, not WHERE.",
          syntax: "SELECT name FROM students WHERE gpa > (SELECT AVG(gpa) FROM students);\nSELECT student_id FROM enrollments GROUP BY student_id HAVING COUNT(*) > 1;",
          exampleCode: `SELECT name, gpa FROM students
WHERE gpa > (SELECT AVG(gpa) FROM students)
ORDER BY gpa DESC;`,
          exampleStdin: "",
          exampleOutput:
            "+--------------+-----+\n| name         | gpa |\n+--------------+-----+\n| Chloe Nguyen | 3.9 |\n| Aisha Khan   | 3.8 |\n| Emma O'Brien | 3.6 |\n+--------------+-----+\n3 row(s)",
        },
      ],
      problems: [
        {
          id: "sql-prog-sub",
          title: "Students in two or more courses",
          difficulty: "medium",
          prompt:
            "Print the names of students enrolled in more than one course, ordered by name.",
          starterCode: "-- names of students with more than one enrolment, ordered by name\n",
          samples: [
            {
              input: "",
              expectedOutput:
                "+--------------+\n| name         |\n+--------------+\n| Aisha Khan   |\n| Ben Carter   |\n| Chloe Nguyen |\n| Emma O'Brien |\n+--------------+\n4 row(s)",
            },
          ],
          hints: [
            "JOIN enrollments with students first.",
            "GROUP BY s.id ... HAVING COUNT(*) > 1 (not WHERE).",
          ],
          explanation:
            "Group enrolments by student, keep groups with more than one row: Aisha, Ben, Chloe and Emma each take two courses (Diego and Farah take one).",
        },
      ],
    },
    {
      id: "problem-solving",
      title: "Analytical Queries",
      difficulty: "intermediate",
      lessons: [
        {
          id: "sql-ps",
          title: "Thinking in relational steps",
          concept:
            "Break the question into relational steps: pick tables (FROM/JOIN), filter rows (WHERE), group (GROUP BY), aggregate (COUNT/AVG), filter groups (HAVING), compute expressions, order and limit (ORDER BY / LIMIT), project final columns (SELECT). Writing the query in that mental order keeps complex questions manageable.",
          syntax: "FROM ... JOIN ... WHERE ... GROUP BY ... HAVING ... SELECT ... ORDER BY ... LIMIT",
          exampleCode: `SELECT c.title, COUNT(*) AS n
FROM enrollments e
JOIN courses c ON c.id = e.course_id
GROUP BY c.id
ORDER BY n DESC, c.title;`,
          exampleStdin: "",
          exampleOutput:
            "+----------------------+---+\n| title                | n |\n+----------------------+---+\n| Intro to Programming | 4 |\n| Data Structures      | 3 |\n| Calculus I           | 2 |\n| Mechanics            | 1 |\n+----------------------+---+\n4 row(s)",
        },
      ],
      problems: [
        {
          id: "sql-prog-ps",
          title: "Average GPA per major",
          difficulty: "medium",
          prompt:
            "For each major print the major and its average gpa rounded to 2 decimals (column avg_gpa), ordered by major.",
          starterCode: "-- major and rounded average gpa per major, ordered by major\n",
          samples: [
            {
              input: "",
              expectedOutput:
                "+------------------+---------+\n| major            | avg_gpa |\n+------------------+---------+\n| Computer Science | 3.77    |\n| Mathematics      | 3.15    |\n| Physics          | 3.4     |\n+------------------+---------+\n3 row(s)",
            },
          ],
          hints: [
            "GROUP BY major.",
            "ROUND(AVG(gpa), 2) AS avg_gpa — the alias becomes the column header.",
          ],
          explanation:
            "Group by major, average the gpa column per group and round: Computer Science 3.77, Mathematics 3.15, Physics 3.40 (shown as 3.4).",
        },
      ],
    },
  ],
};
