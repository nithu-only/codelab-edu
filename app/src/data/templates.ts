import type { LanguageId } from "../types";

export interface Template {
  code: string;
  stdin: string;
}

export const TEMPLATES: Record<LanguageId, Template> = {
  c: {
    code: `#include <stdio.h>

int main(void) {
    int n;
    printf("Enter a number: ");
    scanf("%d", &n);
    printf("You entered %d\\n", n);
    return 0;
}
`,
    stdin: "42",
  },
  cpp: {
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    cout << "Enter your name: ";
    getline(cin, name);
    cout << "Hello, " << name << "!" << endl;
    return 0;
}
`,
    stdin: "Ada",
  },
  java: {
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println("Square of " + n + " is " + (n * n));
        sc.close();
    }
}
`,
    stdin: "7",
  },
  python: {
    code: `name = input()
print(f"Hello, {name}!")

total = sum(range(1, 11))
print("Sum 1..10 =", total)
`,
    stdin: "World",
  },
  javascript: {
    code: `// Runs locally in your browser (Web Worker).
// Read input with input() — returns everything from the stdin box.

const name = input().trim() || "student";
console.log("Hello, " + name + "!");

const nums = [5, 3, 8, 1];
const max = Math.max(...nums);
console.log("Max of", nums, "=", max);
`,
    stdin: "Alex",
  },
  sql: {
    code: `-- Runs locally against an in-memory practice database.
-- Tables: students(id, name, major, gpa)
--         courses(id, code, title, credits)
--         enrollments(student_id, course_id, grade)

SELECT name, major, gpa
FROM students
WHERE major = 'Computer Science'
ORDER BY gpa DESC;
`,
    stdin: "",
  },
};
