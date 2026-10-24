import type { Topic } from "../../../types";
import { L, P } from "./helpers";

export const sections4: Topic[] = [
  {
    id: "c-structures",
    title: "C Structures & Unions",
    difficulty: "intermediate",
    section: "C Structures & Unions",
    lessons: [
      L(
        "c-structures-intro",
        "Introduction to Structures",
        "A struct groups related variables of different types under one name. Each variable inside is a member, accessed with the dot operator. Structures are how C models records such as a student or a point.",
        "struct Name {\n    type member1;\n    type member2;\n};",
        `#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main() {
    struct Point p = {2, 3};
    printf("%d,%d\\n", p.x, p.y);
    return 0;
}`,
        "2,3",
        {
          objectives: ["Define a struct", "Access members"],
          explanation:
            "Point has two int members. The initialiser fills x with 2 and y with 3 in declaration order.",
          tips: ["End the struct definition with a semicolon."],
          mistakes: ["Forgetting the semicolon after the closing brace."],
        },
      ),
      L(
        "c-struct-init",
        "Initialising Structures",
        "You can initialise a struct with a brace list in member order, or assign members individually. A char array member can be initialised with a string literal. Designated initialisers such as .y = 3 are also supported in C99.",
        "struct Student s = {\"Ada\", 20};\ns.age = 21;",
        `#include <stdio.h>

struct Student {
    char name[20];
    int age;
};

int main() {
    struct Student s = {"Ada", 20};
    printf("%s is %d\\n", s.name, s.age);
    return 0;
}`,
        "Ada is 20",
        {
          objectives: ["Initialise struct members", "Update a member"],
          explanation:
            "The string literal initialises the char array and 20 initialises age.",
          tips: ["Use designated initialisers to avoid order mistakes."],
          mistakes: ["Assigning a string with = after initialisation - use strcpy instead."],
        },
      ),
      L(
        "c-typedef-struct",
        "typedef with Structures",
        "Writing struct Point every time is noisy. A typedef creates a shorter alias so you can declare variables as Point p. This is the most common style in modern C.",
        "typedef struct { int x; int y; } Point;\nPoint p = {1, 2};",
        `#include <stdio.h>

typedef struct {
    int width;
    int height;
} Rect;

int main() {
    Rect r = {4, 5};
    printf("area = %d\\n", r.width * r.height);
    return 0;
}`,
        "area = 20",
        {
          objectives: ["Create a struct typedef", "Use the alias"],
          explanation:
            "Rect is an alias for an anonymous struct type, so Rect r declares a structure variable directly.",
          tips: ["Name typedefs with a capital letter to distinguish them from variables."],
          mistakes: ["Adding struct before a typedef name: struct Rect r is wrong unless Rect is also a tag."],
        },
      ),
      L(
        "c-nested-structs",
        "Nested Structures",
        "A struct can contain another struct as a member. Access nested members by chaining the dot operator from the outer object to the inner one.",
        "outer.inner.member",
        `#include <stdio.h>

struct Date {
    int day;
    int month;
    int year;
};

struct Event {
    char name[20];
    struct Date when;
};

int main() {
    struct Event e = {"Launch", {1, 5, 2026}};
    printf("%s on %02d/%02d/%04d\\n", e.name, e.when.day, e.when.month, e.when.year);
    return 0;
}`,
        "Launch on 01/05/2026",
        {
          objectives: ["Nest structures", "Access chained members"],
          explanation:
            "e.when is a Date, so e.when.day reaches the day member. %02d pads single digits with a zero.",
          tips: ["Keep deeply nested structures shallow for readability."],
          mistakes: ["Writing e.when.day instead of e.when.day with the correct name."],
        },
      ),
      L(
        "c-struct-pointers",
        "Pointers to Structures",
        "A pointer to a struct is common because it avoids copying large objects. Use the arrow operator -> to access a member through a pointer: p->x is shorthand for (*p).x.",
        "struct Point *p = &pt;\np->x = 10;   /* same as (*p).x */",
        `#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main() {
    struct Point p = {7, 9};
    struct Point *ptr = &p;
    printf("%d %d\\n", ptr->x, ptr->y);
    ptr->x = 70;
    printf("%d\\n", p.x);
    return 0;
}`,
        "7 9\n70",
        {
          objectives: ["Use a struct pointer", "Apply the arrow operator"],
          explanation:
            "ptr points at p, so ptr->x reads the same member as p.x. Writing through ptr updates p.",
          tips: ["Use -> whenever you have a pointer to a struct."],
          mistakes: ["Writing p->x when p is a struct rather than a pointer."],
        },
      ),
      L(
        "c-unions",
        "Unions",
        "A union looks like a struct but all members share the same memory. Only one member is valid at a time. Unions save space and are used for variant types and low-level bit representation.",
        "union Value {\n    int i;\n    float f;\n};",
        `#include <stdio.h>

union Value {
    int i;
    float f;
};

int main() {
    union Value v;
    v.i = 65;
    printf("%d\\n", v.i);
    return 0;
}`,
        "65",
        {
          objectives: ["Declare a union", "Explain shared storage"],
          explanation:
            "v.i and v.f occupy the same bytes, so writing i and then reading f would reinterpret the bits. This example reads back the member that was written.",
          tips: ["Use a struct with a tag to track which union member is active."],
          mistakes: ["Reading a different union member than the one last written."],
        },
      ),
      L(
        "c-enums-struct",
        "Enums in Practice",
        "Enums give names to integer constants and make states readable. They pair well with structs and switch statements, for example storing a status field in a record.",
        "enum Status { PENDING, ACTIVE, DONE };",
        `#include <stdio.h>

enum Status { PENDING, ACTIVE, DONE };

int main() {
    enum Status s = ACTIVE;
    if (s == ACTIVE) {
        printf("Task is active\\n");
    }
    printf("numeric value: %d\\n", s);
    return 0;
}`,
        "Task is active\nnumeric value: 1",
        {
          objectives: ["Use enums for states", "Compare enum values"],
          explanation:
            "ACTIVE is the second name, so its value is 1. Comparing s to ACTIVE is clearer than comparing to 1.",
          tips: ["Use enums instead of magic numbers in switch statements."],
          mistakes: ["Printing an enum with %s - it is an integer, not a string."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-struct-area",
        "Rectangle Area",
        "medium",
        "Define a struct Rect with width and height, read both values, and print the area.",
        `#include <stdio.h>

struct Rect {
    int width;
    int height;
};

int main() {
    struct Rect r;
    scanf("%d %d", &r.width, &r.height);
    // Print the area
    
    return 0;
}
`,
        "20",
        ["Multiply r.width by r.height.", "Print with %d."],
        "Members are accessed with the dot operator.",
        "4 5\n",
      ),
      P(
        "c-prob-struct-ptr",
        "Update Through a Pointer",
        "hard",
        "Using the given pointer, set the point's x to 100 and print x and y.",
        `#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main() {
    struct Point p = {1, 2};
    struct Point *ptr = &p;
    // Update x through ptr and print both
    
    return 0;
}
`,
        "100 2",
        ["Use ptr->x = 100;", "Print ptr->x and ptr->y."],
        "The arrow operator accesses members through a pointer.",
      ),
    ],
  },
  {
    id: "c-dynamic-memory",
    title: "C Dynamic Memory",
    difficulty: "advanced",
    section: "C Dynamic Memory",
    lessons: [
      L(
        "c-malloc",
        "Allocating Memory with malloc",
        "malloc reserves a block of bytes on the heap and returns a pointer to it, or NULL on failure. It does not initialise the memory. Always check for NULL and free the block when you are done.",
        "void *p = malloc(n * sizeof(int));\nif (p == NULL) { /* handle */ }\nfree(p);",
        `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(3 * sizeof(int));
    if (p == NULL) {
        printf("allocation failed\\n");
        return 1;
    }
    p[0] = 10;
    p[1] = 20;
    p[2] = 30;
    printf("%d\\n", p[0] + p[1] + p[2]);
    free(p);
    return 0;
}`,
        "60",
        {
          objectives: ["Allocate heap memory", "Check for allocation failure"],
          explanation:
            "malloc returns a block large enough for three ints. The elements are assigned and summed, then the block is released.",
          tips: ["Use sizeof(*p) instead of sizeof(int) so the code survives a type change."],
          mistakes: ["Using malloc without checking for NULL."],
        },
      ),
      L(
        "c-calloc",
        "calloc",
        "calloc allocates memory for an array and sets every byte to zero. It takes the number of elements and the size of each, so it is convenient for arrays that must start empty.",
        "int *p = calloc(count, sizeof(int));",
        `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = calloc(3, sizeof(int));
    if (p == NULL) {
        printf("allocation failed\\n");
        return 1;
    }
    printf("%d %d %d\\n", p[0], p[1], p[2]);
    free(p);
    return 0;
}`,
        "0 0 0",
        {
          objectives: ["Use calloc", "Know the difference from malloc"],
          explanation:
            "calloc zeroes the block, so all three elements print as 0 without being assigned.",
          tips: ["calloc is slightly slower than malloc because it clears memory."],
          mistakes: ["Assuming calloc returns uninitialised memory - it always zeroes it."],
        },
      ),
      L(
        "c-realloc",
        "realloc",
        "realloc changes the size of an existing block. It may move the block, so always assign the result back to your pointer. If it fails it returns NULL and the original block is still valid.",
        "p = realloc(p, new_count * sizeof(int));",
        `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(2 * sizeof(int));
    if (p == NULL) {
        return 1;
    }
    p[0] = 1;
    p[1] = 2;
    int *bigger = realloc(p, 4 * sizeof(int));
    if (bigger == NULL) {
        free(p);
        return 1;
    }
    p = bigger;
    p[2] = 3;
    p[3] = 4;
    printf("%d\\n", p[3]);
    free(p);
    return 0;
}`,
        "4",
        {
          objectives: ["Resize a block", "Handle realloc failure safely"],
          explanation:
            "The block grows to four ints. Using a temporary pointer avoids losing the original block if realloc fails.",
          tips: ["Never assign realloc directly to p before checking for NULL."],
          mistakes: ["Calling free on the old pointer after a successful realloc, which is a double free."],
        },
      ),
      L(
        "c-free",
        "free and Dangling Pointers",
        "free releases a heap block. After freeing, the pointer still holds the old address, so it becomes a dangling pointer. Set it to NULL and never free the same block twice.",
        "free(p);\np = NULL;",
        `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(sizeof(int));
    if (p == NULL) {
        return 1;
    }
    *p = 5;
    printf("%d\\n", *p);
    free(p);
    p = NULL;
    if (p == NULL) {
        printf("freed\\n");
    }
    return 0;
}`,
        "5\nfreed",
        {
          objectives: ["Free memory", "Avoid dangling pointers"],
          explanation:
            "The value is read before free. Setting p to NULL makes it obvious that the block is no longer available.",
          tips: ["Every successful malloc needs exactly one free."],
          mistakes: ["Using a pointer after free.", "Freeing the same pointer twice."],
        },
      ),
      L(
        "c-memory-leaks",
        "Memory Leaks",
        "A memory leak happens when allocated memory is no longer reachable but was never freed. Long-running programs gradually consume all available memory. Match every allocation with a free on every code path, including error paths.",
        "allocate -> use -> free (on all paths)",
        `#include <stdio.h>
#include <stdlib.h>

int main() {
    for (int i = 0; i < 3; i++) {
        int *tmp = malloc(sizeof(int));
        if (tmp == NULL) {
            return 1;
        }
        *tmp = i;
        free(tmp);
    }
    printf("no leaks\\n");
    return 0;
}`,
        "no leaks",
        {
          objectives: ["Recognise leaks", "Free on every path"],
          explanation:
            "Each iteration allocates one int and frees it immediately, so memory use stays constant.",
          tips: ["Use tools such as valgrind on desktop to detect leaks."],
          mistakes: ["Returning early on an error without freeing earlier allocations."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-malloc-sum",
        "Dynamic Array Sum",
        "hard",
        "Read n, allocate an int array with malloc, read n values, print their sum, then free the array.",
        `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    scanf("%d", &n);
    int *a = malloc(n * sizeof(int));
    if (a == NULL) {
        return 1;
    }
    // Read values, sum them, print the sum, free the array
    
    return 0;
}
`,
        "15",
        ["Loop i from 0 to n-1 and scanf into &a[i].", "Add to a sum, print it, then call free(a)."],
        "The heap block behaves like an array but must be freed manually.",
        "5\n1 2 3 4 5\n",
      ),
    ],
  },
  {
    id: "c-file-handling",
    title: "C File Handling",
    difficulty: "advanced",
    section: "C File Handling",
    lessons: [
      L(
        "c-files-intro",
        "Introduction to File Handling",
        "Files let a program store data beyond one run. C uses a FILE pointer and functions from stdio.h: fopen to open, fprintf and fputs to write, fgets and fscanf to read, and fclose to close. The browser runner provides a temporary in-memory filesystem, so a program can write and read files during a single run, but the files disappear when it ends.",
        "FILE *fp = fopen(\"data.txt\", \"w\");\nif (fp != NULL) { /* use */ fclose(fp); }",
        `#include <stdio.h>

int main() {
    FILE *fp = fopen("demo.txt", "w");
    if (fp == NULL) {
        printf("Could not open demo.txt\\n");
        return 0;
    }
    fputs("Hello file\\n", fp);
    fclose(fp);
    printf("File written\\n");
    return 0;
}`,
        "File written",
        {
          objectives: ["Explain why files need fopen and fclose", "Check fopen for NULL"],
          explanation:
            "The runner provides an in-memory filesystem for each run. demo.txt is created, written and closed successfully, but it does not persist after the program exits.",
          tips: ["Always check fopen's result before using the FILE pointer.", "Files created in one run are gone in the next run."],
          mistakes: ["Using a FILE pointer without checking for NULL."],
        },
      ),
      L(
        "c-fopen-fclose",
        "Opening and Closing Files",
        "fopen takes a path and a mode and returns a FILE pointer. Modes include \"r\" read, \"w\" write (truncate), \"a\" append, and \"r+\" read and write. fclose flushes buffers and releases the handle. Always close what you open.",
        "FILE *fp = fopen(path, mode);\nfclose(fp);",
        `#include <stdio.h>

int main() {
    FILE *fp = fopen("notes.txt", "r");
    if (fp == NULL) {
        printf("Could not open notes.txt\\n");
        return 0;
    }
    printf("File opened\\n");
    fclose(fp);
    return 0;
}`,
        "Could not open notes.txt",
        {
          objectives: ["Use fopen modes", "Close files"],
          explanation:
            "Opening for reading a file that does not exist returns NULL. Each run starts with an empty temporary filesystem, so notes.txt is missing unless the same program creates it first.",
          tips: ["Use \"a\" to add to a file without erasing it."],
          mistakes: ["Forgetting fclose, which can lose buffered writes."],
        },
      ),
      L(
        "c-write-file",
        "Writing to a File",
        "fprintf writes formatted text to a file, and fputs writes a plain string. In write mode the file is created or truncated. Check that each write succeeded and close the file so buffers are flushed.",
        "fprintf(fp, \"%d\\n\", value);\nfputs(\"text\\n\", fp);",
        `#include <stdio.h>

int main() {
    FILE *fp = fopen("scores.txt", "w");
    if (fp == NULL) {
        printf("Could not open scores.txt for writing\\n");
        return 0;
    }
    fprintf(fp, "%d\\n", 95);
    fputs("done\\n", fp);
    fclose(fp);
    printf("Saved scores.txt\\n");
    return 0;
}`,
        "Saved scores.txt",
        {
          objectives: ["Write formatted data", "Flush with fclose"],
          explanation:
            "The program creates scores.txt in the run's temporary filesystem, writes two lines and closes it. The file disappears when the run ends.",
          tips: ["Check fprintf's return value for negative values on write errors."],
          mistakes: ["Assuming data is on disk before fclose or fflush."],
        },
      ),
      L(
        "c-read-file",
        "Reading from a File",
        "fgets reads one line at a time into a buffer, stopping at newline or buffer full. fscanf reads formatted values. Both return EOF or NULL when the file ends, so loop while the read succeeds.",
        "while (fgets(buf, sizeof buf, fp) != NULL) { ... }",
        `#include <stdio.h>

int main() {
    char line[64];
    FILE *fp = fopen("data.txt", "r");
    if (fp == NULL) {
        printf("Could not open data.txt\\n");
        return 0;
    }
    while (fgets(line, sizeof line, fp) != NULL) {
        printf("%s", line);
    }
    fclose(fp);
    return 0;
}`,
        "Could not open data.txt",
        {
          objectives: ["Read lines in a loop", "Detect end of file"],
          explanation:
            "fgets returns NULL at end of file, which ends the loop. data.txt was not created in this run, so fopen returns NULL and the guard prints a message before the loop starts.",
          tips: ["Use sizeof line so the buffer bound is obvious."],
          mistakes: ["Looping with feof before a read, which processes the last line twice."],
        },
      ),
      L(
        "c-file-modes",
        "File Modes Reference",
        "Each mode defines what operations are allowed and what happens to existing content. \"r\" reads an existing file, \"w\" creates or truncates, \"a\" appends, and the plus forms allow both reading and writing. Binary modes add b for platforms that distinguish text and binary.",
        "\"r\"  \"w\"  \"a\"  \"r+\"  \"w+\"  \"a+\"  \"rb\"  \"wb\"",
        `#include <stdio.h>

int main() {
    printf("r  - read, file must exist\\n");
    printf("w  - write, creates or truncates\\n");
    printf("a  - append, creates if missing\\n");
    printf("r+ - read and write, file must exist\\n");
    printf("w+ - read and write, truncates\\n");
    printf("a+ - read and append\\n");
    return 0;
}`,
        "r  - read, file must exist\nw  - write, creates or truncates\na  - append, creates if missing\nr+ - read and write, file must exist\nw+ - read and write, truncates\na+ - read and append",
        {
          objectives: ["Choose the right mode", "Avoid accidental truncation"],
          explanation:
            "Choosing w on an existing file erases it. Use a or r+ when you need to keep the original content.",
          tips: ["Use b modes when the data is not plain text."],
          mistakes: ["Using w when you meant a and losing existing data."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-file-modes",
        "Print File Modes",
        "easy",
        "Print three lines describing the r, w and a modes, using the exact text shown in the expected output.",
        `#include <stdio.h>

int main() {
    // Print the three mode descriptions
    
    return 0;
}
`,
        "r reads\nw writes\na appends",
        ["Use one printf per line.", "End each line with \\n."],
        "This problem checks output formatting, which is the part that works in every environment.",
      ),
    ],
  },
  {
    id: "c-preprocessor",
    title: "C Preprocessor",
    difficulty: "advanced",
    section: "C Preprocessor",
    lessons: [
      L(
        "c-preprocessor-intro",
        "The Preprocessor",
        "Before compilation, the preprocessor handles lines starting with #: it includes headers, expands macros and selects code with conditional compilation. It performs text substitution only; it does not understand C types.",
        "#include <stdio.h>\n#define NAME value\n#if / #else / #endif",
        `#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("Headers are processed before compilation\\n");
    return 0;
}`,
        "Headers are processed before compilation",
        {
          objectives: ["Explain what the preprocessor does", "Recognise directive lines"],
          explanation:
            "#include literally inserts the contents of the header into your file before the compiler sees it.",
          tips: ["Preprocessor directives do not end with semicolons."],
          mistakes: ["Putting a semicolon after #include."],
        },
      ),
      L(
        "c-define",
        "Constants and Macros with #define",
        "Object-like macros replace a name with a value. Function-like macros take arguments. Wrap parameters in parentheses to avoid precedence bugs, and prefer const for typed constants.",
        "#define PI 3.14159\n#define SQUARE(x) ((x) * (x))",
        `#include <stdio.h>

#define PI 3.14159
#define SQUARE(x) ((x) * (x))

int main() {
    printf("%.2f\\n", PI);
    printf("%d\\n", SQUARE(5));
    return 0;
}`,
        "3.14\n25",
        {
          objectives: ["Define constants and macros", "Parenthesise macro parameters"],
          explanation:
            "PI is replaced by its value and SQUARE(5) expands to ((5) * (5)). The double parentheses prevent precedence surprises.",
          tips: ["Use UPPERCASE names for macros by convention."],
          mistakes: ["Defining SQUARE(x) x*x, which breaks for expressions such as 2+3."],
        },
      ),
      L(
        "c-macro-pitfalls",
        "Macro Pitfalls",
        "Because macros are textual substitutions, missing parentheses change the meaning of an expression. This example shows the classic bug: the macro is correct only when every parameter and the whole body are parenthesised.",
        "#define BAD(x) x * x\nBAD(2 + 3)  ->  2 + 3 * 2 + 3  ->  11",
        `#include <stdio.h>

#define BAD_SQUARE(x) x * x
#define GOOD_SQUARE(x) ((x) * (x))

int main() {
    printf("bad: %d\\n", BAD_SQUARE(2 + 3));
    printf("good: %d\\n", GOOD_SQUARE(2 + 3));
    return 0;
}`,
        "bad: 11\ngood: 25",
        {
          objectives: ["See why macro parentheses matter", "Write safe macros"],
          explanation:
            "BAD_SQUARE(2 + 3) expands to 2 + 3 * 2 + 3, which is 11. GOOD_SQUARE gives 25 because each use is grouped.",
          tips: ["Prefer inline functions or const over function-like macros."],
          mistakes: ["Using a macro argument with side effects twice, such as GOOD_SQUARE(i++)."],
        },
      ),
      L(
        "c-conditional-compilation",
        "Conditional Compilation",
        "#if, #ifdef, #ifndef, #else, #elif and #endif include or exclude code at preprocessing time. This is used for debug builds, platform differences and header guards.",
        "#if defined(DEBUG)\n    /* debug code */\n#endif",
        `#include <stdio.h>

#define DEBUG 1

int main() {
#if DEBUG
    printf("Debug build\\n");
#else
    printf("Release build\\n");
#endif
    return 0;
}`,
        "Debug build",
        {
          objectives: ["Use #if", "Build debug and release variants"],
          explanation:
            "Because DEBUG is 1, the preprocessor keeps the first printf and removes the other before compilation.",
          tips: ["Define flags with -DDEBUG on the compiler command line instead of editing source."],
          mistakes: ["Forgetting #endif, which causes confusing errors."],
        },
      ),
      L(
        "c-command-line-args",
        "Command-Line Arguments",
        "main can accept int argc and char *argv[]. argc is the number of arguments and argv is an array of strings, with argv[0] holding the program name. In the browser runner no extra arguments are passed, so argc is 1.",
        "int main(int argc, char *argv[]) { ... }",
        `#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("argc = %d\\n", argc);
    printf("argv[0] holds the program name\\n");
    (void) argv;
    return 0;
}`,
        "argc = 1\nargv[0] holds the program name",
        {
          objectives: ["Read argc and argv", "Explain argv[0]"],
          explanation:
            "The runner launches the program without extra arguments, so argc is 1 and argv[0] is the compiled program's name. Printing argv[0] directly would show test.wasm in this runner.",
          tips: ["Always check argc before reading argv[1]."],
          mistakes: ["Assuming argv[1] exists without checking argc > 1."],
        },
      ),
      L(
        "c-best-practices",
        "Preprocessor Best Practices",
        "Use headers for declarations, include guards to prevent double inclusion, const or enum for typed constants, and functions for reusable logic. Keep macros small and fully parenthesised, and never put side effects in macro arguments.",
        "#ifndef HEADER_H\n#define HEADER_H\n/* declarations */\n#endif",
        `#include <stdio.h>

int main() {
    printf("prefer const over #define for typed constants\\n");
    printf("prefer functions over function-like macros\\n");
    printf("guard every header with #ifndef\\n");
    return 0;
}`,
        "prefer const over #define for typed constants\nprefer functions over function-like macros\nguard every header with #ifndef",
        {
          objectives: ["Apply preprocessor hygiene", "Write header guards"],
          explanation:
            "These habits prevent name clashes, double definitions and hard-to-debug macro expansion problems.",
          tips: ["Name the guard after the file, for example STACK_H."],
          mistakes: ["Including the same header twice without a guard."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-macro-area",
        "Macro for Area",
        "medium",
        "Define a macro AREA(w, h) that computes w * h with correct parentheses. Read two integers and print the area.",
        `#include <stdio.h>

#define AREA(w, h) ((w) * (h))

int main() {
    int w, h;
    scanf("%d %d", &w, &h);
    // Print the area using the macro
    
    return 0;
}
`,
        "20",
        ["Use the macro in printf.", "Print with %d."],
        "The extra parentheses make the macro safe for expressions as arguments.",
        "4 5\n",
      ),
    ],
  },
];
