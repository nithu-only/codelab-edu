import type { LearningPath } from "../../types";

export const cPath: LearningPath = {
  language: "c",
  label: "C",
  blurb:
    "Learn the foundations of imperative programming: types, pointers-to-arrays, control flow and functions in C.",
  topics: [
    {
      id: "variables",
      title: "Variables & Data Types",
      difficulty: "beginner",
      lessons: [
        {
          id: "c-var",
          title: "Declaring variables in C",
          concept:
            "Every C variable has a fixed type declared before use: int (integers), double/float (decimals), char (single character), plus size_t and long variants. Variables must be declared before they are used; assigning a value is called initialisation.",
          syntax: "int count = 10;\ndouble price = 9.99;\nchar grade = 'A';",
          exampleCode: `#include <stdio.h>

int main(void) {
    int count = 10;
    double price = 9.99;
    char grade = 'A';
    printf("%d %.2f %c\\n", count, price, grade);
    printf("size of int: %zu bytes\\n", sizeof(int));
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "10 9.99 A\nsize of int: 4 bytes",
        },
      ],
      problems: [
        {
          id: "c-prog-vars",
          title: "Feet to metres",
          difficulty: "easy",
          prompt:
            "Read one double (length in feet) and print the length in metres rounded to 3 decimal places. 1 foot = 0.3048 metres.",
          starterCode: `#include <stdio.h>

int main(void) {
    double feet;
    scanf("%lf", &feet);
    /* print metres, 3 decimal places */
    return 0;
}
`,
          samples: [{ input: "10", expectedOutput: "3.048" }],
          hints: ["Multiply by 0.3048.", "printf(\"%.3f\\n\", value) prints 3 decimals."],
          explanation: "Read with %lf (double), multiply by 0.3048, print with %.3f.",
        },
      ],
    },
    {
      id: "operators",
      title: "Operators",
      difficulty: "beginner",
      lessons: [
        {
          id: "c-ops",
          title: "Arithmetic, comparison and logical operators",
          concept:
            "C uses + - * / % (modulo, integers only) and comparisons == != < > <= >=. Logical and/or/not combine conditions. Integer division truncates: 7/2 is 3. % works only on integers.",
          syntax: "a + b; a / b; a % b;\na == b; a < b;\ncond1 && cond2; cond1 || cond2; !cond",
          exampleCode: `#include <stdio.h>

int main(void) {
    int a = 17, b = 5;
    printf("%d %d %d\\n", a / b, a % b, a * b);
    printf("%d\\n", a > b && b > 0);
    printf("%.1f\\n", (double)a / b);
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "3 2 85\n1\n3.4",
        },
      ],
      problems: [
        {
          id: "c-prog-ops",
          title: "Seconds to minutes and seconds",
          difficulty: "easy",
          prompt:
            "Read an integer number of seconds. Print how many whole minutes it contains, then the remaining seconds — one per line.",
          starterCode: `#include <stdio.h>

int main(void) {
    int seconds;
    scanf("%d", &seconds);
    /* print minutes, then remaining seconds */
    return 0;
}
`,
          samples: [{ input: "125", expectedOutput: "2\n5" }],
          hints: ["minutes = seconds / 60 (integer division)", "remaining = seconds % 60"],
          explanation:
            "Integer division by 60 gives whole minutes (125/60 = 2); modulo 60 gives the remainder (5).",
        },
      ],
    },
    {
      id: "conditions",
      title: "Conditions (if / else)",
      difficulty: "beginner",
      lessons: [
        {
          id: "c-if",
          title: "if, else if, else",
          concept:
            "if (condition) { ... } runs a block only when the condition is non-zero. Chain alternatives with else if and finish with else. Blocks use braces; a single statement does not strictly need them, but always use braces to avoid bugs.",
          syntax: "if (cond) { ... } else if (other) { ... } else { ... }",
          exampleCode: `#include <stdio.h>

int main(void) {
    int score;
    scanf("%d", &score);
    if (score >= 90) {
        printf("A\\n");
    } else if (score >= 80) {
        printf("B\\n");
    } else {
        printf("F\\n");
    }
    return 0;
}`,
          exampleStdin: "85",
          exampleOutput: "B",
        },
      ],
      problems: [
        {
          id: "c-prog-if",
          title: "Positive, negative or zero",
          difficulty: "easy",
          prompt: "Read an integer and print \"positive\", \"negative\" or \"zero\" accordingly.",
          starterCode: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    /* print positive / negative / zero */
    return 0;
}
`,
          samples: [
            { input: "42", expectedOutput: "positive" },
            { input: "-7", expectedOutput: "negative" },
            { input: "0", expectedOutput: "zero" },
          ],
          hints: ["Compare n > 0, n < 0, else equal to zero."],
          explanation: "Three-way branch on the sign of n.",
        },
      ],
    },
    {
      id: "loops",
      title: "Loops",
      difficulty: "beginner",
      lessons: [
        {
          id: "c-loop",
          title: "for and while loops",
          concept:
            "for (init; condition; update) counts a loop variable — usually `for (int i = 0; i < n; i++)`. while repeats while its condition holds. break exits early; continue skips to the next update.",
          syntax: "for (int i = 0; i < n; i++) { ... }\nwhile (cond) { ... }",
          exampleCode: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    printf("%d\\n", sum);
    return 0;
}`,
          exampleStdin: "100",
          exampleOutput: "5050",
        },
      ],
      problems: [
        {
          id: "c-prog-loop",
          title: "Print a multiplication row",
          difficulty: "easy",
          prompt:
            "Read an integer n and print the products n×1 through n×5, separated by spaces, on one line.",
          starterCode: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    /* print n*1 ... n*5 separated by spaces, then newline */
    return 0;
}
`,
          samples: [{ input: "7", expectedOutput: "7 14 21 28 35" }],
          hints: ["Loop i from 1 to 5, print n * i with a trailing space."],
          explanation: "for (int i = 1; i <= 5; i++) prints the five products space-separated.",
        },
      ],
    },
    {
      id: "arrays",
      title: "Arrays",
      difficulty: "beginner",
      lessons: [
        {
          id: "c-arr",
          title: "Fixed-size arrays",
          concept:
            "int a[5]; declares 5 ints indexed 0..4. Arrays are contiguous memory — the name is a pointer to the first element. C does not check bounds. Common idiom: read n (≤ capacity) values in a loop.",
          syntax: "int a[100];\nfor (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);",
          exampleCode: `#include <stdio.h>

int main(void) {
    int a[5] = {5, 2, 9, 1, 7};
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += a[i];
    }
    printf("sum=%d first=%d last=%d\\n", sum, a[0], a[4]);
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "sum=24 first=5 last=7",
        },
      ],
      problems: [
        {
          id: "c-prog-arr",
          title: "Largest element",
          difficulty: "easy",
          prompt:
            "Read n (1 ≤ n ≤ 100), then n integers. Print the largest value.",
          starterCode: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int a[100];
    /* read n values, find and print the maximum */
    return 0;
}
`,
          samples: [{ input: "5\n3 7 2 9 4", expectedOutput: "9" }],
          hints: ["Start max = a[0], then keep updating while scanning."],
          explanation: "Linear scan keeping the best value seen so far — O(n).",
        },
      ],
    },
    {
      id: "functions",
      title: "Functions",
      difficulty: "beginner",
      lessons: [
        {
          id: "c-fn",
          title: "Defining and calling functions",
          concept:
            "A function has a return type, name and parameter list: int add(int a, int b) { return a + b; }. Declare prototypes above main so the compiler knows signatures. Arguments are passed by value — a copy, not the original.",
          syntax: "int add(int a, int b);\n...\nint add(int a, int b) { return a + b; }",
          exampleCode: `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

double average(int a, int b) {
    return (a + b) / 2.0;
}

int main(void) {
    printf("%d\\n", add(3, 4));
    printf("%.1f\\n", average(3, 4));
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "7\n3.5",
        },
      ],
      problems: [
        {
          id: "c-prog-fn",
          title: "Power function",
          difficulty: "easy",
          prompt:
            "Implement int power(int base, int exp) that returns base^exp (exp ≥ 0). The template's main already reads base and exp and prints your result.",
          starterCode: `#include <stdio.h>

int power(int base, int exp) {
    /* return base raised to exp */
    return 1;
}

int main(void) {
    int base, exp;
    scanf("%d %d", &base, &exp);
    printf("%d\\n", power(base, exp));
    return 0;
}
`,
          samples: [
            { input: "2 10", expectedOutput: "1024" },
            { input: "5 0", expectedOutput: "1" },
          ],
          hints: ["Loop exp times multiplying the result.", "exp = 0 means the answer is 1."],
          explanation: "Multiply in a loop exp times; the loop body never runs when exp is 0, so initialise to 1.",
        },
      ],
    },
    {
      id: "strings",
      title: "Strings (char arrays)",
      difficulty: "intermediate",
      lessons: [
        {
          id: "c-str",
          title: "Strings as null-terminated char arrays",
          concept:
            "A C string is a char array ending with '\\0'. Use #include <string.h>: strlen, strcpy, strcmp, strcat. printf uses %s. Always reserve room for the terminator: char s[10] holds at most 9 characters.",
          syntax: 'char s[100];\nscanf("%99s", s);\nstrlen(s); strcmp(a, b);',
          exampleCode: `#include <stdio.h>
#include <string.h>

int main(void) {
    char name[50] = "Ada";
    printf("%s %zu\\n", name, strlen(name));
    strcat(name, " Lovelace");
    printf("%s\\n", name);
    printf("%d\\n", strcmp("abc", "abd") < 0);
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "Ada 3\nAda Lovelace\n1",
        },
      ],
      problems: [
        {
          id: "c-prog-str",
          title: "Reverse a word",
          difficulty: "easy",
          prompt: "Read one word (≤ 99 characters) and print it reversed.",
          starterCode: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[100];
    scanf("%99s", s);
    /* print s reversed */
    return 0;
}
`,
          samples: [
            { input: "codelab", expectedOutput: "baledoc" },
            { input: "a", expectedOutput: "a" },
          ],
          hints: ["Loop i from strlen(s)-1 down to 0, printing s[i]."],
          explanation: "Index backwards from the last character (before the '\\0') to 0.",
        },
      ],
    },
    {
      id: "pointers",
      title: "Pointers (C essentials)",
      difficulty: "intermediate",
      lessons: [
        {
          id: "c-ptr",
          title: "Pointers and addresses",
          concept:
            "A pointer stores the address of a value: int *p = &x; dereference with *p to read or write the pointed value. Arrays and pointers are closely related: arr[i] is *(arr + i). Functions can modify caller variables through pointer parameters.",
          syntax: "int x = 5;\nint *p = &x;\n*p = 10;   // x is now 10\nvoid twice(int *n) { *n *= 2; }",
          exampleCode: `#include <stdio.h>

void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int main(void) {
    int x = 3, y = 9;
    swap(&x, &y);
    printf("%d %d\\n", x, y);
    int arr[3] = {10, 20, 30};
    int *p = arr;
    printf("%d %d\\n", *p, *(p + 2));
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "9 3\n10 30",
        },
      ],
      problems: [
        {
          id: "c-prog-ptr",
          title: "In-place doubling",
          difficulty: "medium",
          prompt:
            "Fill void double_all(int *a, int n) so that it multiplies every one of the n array elements by 2. main already reads the array and prints it.",
          starterCode: `#include <stdio.h>

void double_all(int *a, int n) {
    /* multiply each of the n elements by 2 */
}

int main(void) {
    int n;
    scanf("%d", &n);
    int a[100];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    double_all(a, n);
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\\n");
    return 0;
}
`,
          samples: [
            { input: "3\n1 2 3", expectedOutput: "2 4 6 " },
            { input: "1\n-5", expectedOutput: "-10 " },
          ],
          hints: ["a[i] is the same as *(a + i).", "Loop i from 0 to n-1 updating through the pointer."],
          explanation:
            "Writing through the pointer modifies the caller's array in place: a[i] *= 2 for each index.",
        },
      ],
    },
    {
      id: "problem-solving",
      title: "Basic Problem Solving",
      difficulty: "intermediate",
      lessons: [
        {
          id: "c-ps",
          title: "Breaking a problem into steps",
          concept:
            "For each problem: restate it, try a tiny example on paper, list the steps in English, then implement step by step. Keep arrays at a fixed safe capacity (e.g. 100) and validate n against it. Test the empty/minimum case too.",
          syntax: "// restate -> example -> steps -> code -> test",
          exampleCode: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int a[100];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] % 2 == 0) count++;
    }
    printf("%d\\n", count);
    return 0;
}`,
          exampleStdin: "6\n1 2 3 4 5 6",
          exampleOutput: "3",
        },
      ],
      problems: [
        {
          id: "c-prog-ps",
          title: "Frequency of each value",
          difficulty: "medium",
          prompt:
            "Read n and n integers (all between 1 and 100). Print how many times the value 1 occurs, then 2, then ... up to the maximum value present — one count per line in increasing value order, skipping values that never occur.",
          starterCode: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int a[100];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    /* count frequencies and print non-zero counts in value order */
    return 0;
}
`,
          samples: [{ input: "7\n3 1 3 2 1 3 1", expectedOutput: "3\n1\n3" }],
          hints: [
            "Use a counting array freq[101] initialised to 0.",
            "freq[value]++ for each element, then loop values 1..100 printing freq > 0.",
          ],
          explanation:
            "Classic counting-sort histogram: increment freq of each value, then print non-zero buckets in order — 1 appears 3 times, 2 once, 3 three times.",
        },
      ],
    },
  ],
};
