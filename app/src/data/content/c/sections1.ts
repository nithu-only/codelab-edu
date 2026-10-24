import type { Topic } from "../../../types";
import { L, P } from "./helpers";

export const sections1: Topic[] = [
  {
    id: "c-getting-started",
    title: "C Getting Started",
    difficulty: "beginner",
    section: "C Getting Started",
    lessons: [
      L(
        "c-what-is-c",
        "What is C Programming?",
        "C is a general-purpose, procedural language created by Dennis Ritchie at Bell Labs in 1972. It is small, fast and gives direct control over memory, which is why operating systems, embedded devices and compilers are written in it. Learning C also makes C++, Java and C# much easier because they inherit C's syntax.",
        "A C program is a set of functions; execution always starts at main().",
        `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
        "Hello, World!",
        {
          objectives: [
            "Describe what C is and where it is used",
            "Write and read a minimal C program",
          ],
          explanation:
            "#include <stdio.h> brings in the input/output library. main() is the entry point. printf writes text to the screen. return 0 tells the operating system the program finished successfully.",
          tips: [
            "Every statement inside a function ends with a semicolon.",
            "C is case-sensitive: main is not the same as Main.",
          ],
          mistakes: ["Forgetting the semicolon after printf(...)", "Writing Main() instead of main()"],
        },
      ),
      L(
        "c-uses-features",
        "Uses and Features of C",
        "C powers operating systems (UNIX, Linux), embedded firmware, databases, compilers and game engines. Its key features are portability, speed, a small standard library, modular functions, pointers for low-level access, and the ability to mix high-level code with low-level memory work.",
        "Feature list: simple, portable, fast, modular, extensible, mid-level language.",
        `#include <stdio.h>

int main() {
    printf("C is used in operating systems, embedded systems and compilers\\n");
    printf("It is portable, fast and gives direct memory access\\n");
    return 0;
}`,
        "C is used in operating systems, embedded systems and compilers\nIt is portable, fast and gives direct memory access",
        {
          objectives: ["Name real-world uses of C", "Explain why C is called a mid-level language"],
          explanation:
            "C is called mid-level because it supports high-level constructs such as functions and loops while still offering pointers and bitwise operators for hardware-level work.",
          tips: ["C is not garbage-collected, so you manage memory yourself."],
          mistakes: ["Assuming C is object-oriented - it is procedural."],
        },
      ),
      L(
        "c-structure",
        "Structure of a C Program",
        "A C source file is built from preprocessor directives, global declarations, and functions. The main() function is required because the runtime calls it first. Code inside a function is grouped into blocks with braces { }.",
        "#include <header>\n\nint main() {\n    declarations;\n    statements;\n    return 0;\n}",
        `#include <stdio.h>

int main() {
    int year = 1972;
    printf("C was created in %d\\n", year);
    return 0;
}`,
        "C was created in 1972",
        {
          objectives: ["Identify the parts of a C program", "Explain the role of main()"],
          explanation:
            "The preprocessor handles #include before compilation. The compiler then turns the remaining code into an executable whose entry point is main.",
          tips: ["Put #include lines at the very top of the file.", "Use indentation to show which statements belong to a block."],
          mistakes: ["Putting executable statements outside any function."],
        },
      ),
      L(
        "c-execution",
        "How C Code is Compiled and Run",
        "C is a compiled language. The compiler runs four stages: preprocessing (expands #include and #define), compilation (source to assembly), assembly (assembly to object code) and linking (combines object files with libraries into one executable).",
        "source.c -> preprocess -> compile -> assemble -> link -> executable",
        `#include <stdio.h>

int main() {
    printf("Step 1: preprocess\\n");
    printf("Step 2: compile\\n");
    printf("Step 3: assemble\\n");
    printf("Step 4: link and run\\n");
    return 0;
}`,
        "Step 1: preprocess\nStep 2: compile\nStep 3: assemble\nStep 4: link and run",
        {
          objectives: ["List the four compilation stages", "Explain the difference between compiling and linking"],
          explanation:
            "Compiling turns one source file into an object file. Linking is what combines that object file with libraries such as stdio so function calls like printf resolve.",
          tips: ["With GCC the whole process is one command: gcc program.c -o program"],
          mistakes: ["Confusing a compiler error (before running) with a runtime error (while running)."],
        },
      ),
      L(
        "c-first-program",
        "Your First Program, Step by Step",
        "The classic first program prints one line of text. Read it from the inside out: main is the function that runs, printf is a library function, the text in quotes is a string literal, and \\n moves the cursor to the next line.",
        "printf(\"text\\n\");",
        `#include <stdio.h>

int main() {
    printf("Welcome to C!\\n");
    printf("This is line 2\\n");
    return 0;
}`,
        "Welcome to C!\nThis is line 2",
        {
          objectives: ["Write, compile and run a first program", "Use \\n to end a line"],
          explanation:
            "Each printf call writes exactly the characters inside the quotes. The escape sequence \\n is not printed; it starts a new line.",
          tips: ["Click Try it Yourself to run this example in your browser.", "Use one printf per line while learning."],
          mistakes: ["Using single quotes for a string: 'Hello' is a character, \"Hello\" is a string."],
        },
      ),
      L(
        "c-errors",
        "Compile-Time, Runtime and Logical Errors",
        "A compile-time error stops the build: a missing semicolon, an unknown variable or a wrong argument type. A runtime error happens while the program runs, such as dividing by zero or reading an invalid pointer. A logical error compiles and runs but produces the wrong answer.",
        "compile error -> fix before running\nruntime error -> fix with checks\nlogical error -> fix the algorithm",
        `#include <stdio.h>

int main() {
    int total = 10;
    int count = 2;
    int average = total / count;
    printf("Average = %d\\n", average);
    return 0;
}`,
        "Average = 5",
        {
          objectives: ["Distinguish the three error types", "Read a compiler message"],
          explanation:
            "This program is correct. If count were 0 the same code would compile but crash at runtime, which is why input validation matters.",
          tips: ["Read the first compiler error first; later errors are often consequences of it."],
          mistakes: ["Ignoring compiler warnings - they often reveal real bugs."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-hello",
        "Print Hello World",
        "easy",
        "Write a program that prints exactly: Hello World",
        `#include <stdio.h>

int main() {
    // Write your code here
    
    return 0;
}
`,
        "Hello World",
        ["Call printf with a string literal.", "Add \\n at the end of the text if you want a new line."],
        "printf(\"Hello World\\n\"); writes the text to standard output.",
      ),
      P(
        "c-prob-two-lines",
        "Print Two Lines",
        "easy",
        "Print 'Learning C' on the first line and 'is fun' on the second line.",
        `#include <stdio.h>

int main() {
    // Print two lines
    
    return 0;
}
`,
        "Learning C\nis fun",
        ["Use one printf per line.", "End each line with \\n."],
        "A printf call can contain \\n anywhere inside the string to break the line.",
      ),
    ],
  },
  {
    id: "c-comments-syntax",
    title: "C Comments & Syntax",
    difficulty: "beginner",
    section: "C Comments & Syntax",
    lessons: [
      L(
        "c-comments",
        "Comments in C",
        "Comments document code and are removed before compilation. A single-line comment starts with // and runs to the end of the line. A multi-line comment starts with /* and ends with */. Comments do not affect program speed or output.",
        "// single line\n/* multi-line\n   comment */",
        `#include <stdio.h>

int main() {
    // This line explains the next statement
    printf("Comments are ignored by the compiler\\n");
    /* This comment spans
       more than one line */
    printf("They make code easier to read\\n");
    return 0;
}`,
        "Comments are ignored by the compiler\nThey make code easier to read",
        {
          objectives: ["Write single-line and multi-line comments", "Explain why comments are useful"],
          explanation:
            "The compiler discards comments during preprocessing, so they cost nothing at runtime. Use them to explain why code exists, not to restate what it obviously does.",
          tips: ["Keep comments close to the code they describe.", "Update comments when the code changes."],
          mistakes: ["Nesting /* */ comments - C does not support nesting.", "Leaving commented-out code in the final program."],
        },
      ),
      L(
        "c-syntax",
        "C Syntax Basics",
        "C is case-sensitive and whitespace-insensitive outside strings. Every simple statement ends with a semicolon. Braces { } group statements into a block. Functions have a return type, a name and a parameter list in parentheses.",
        "return_type name(parameters) {\n    statements;\n}",
        `#include <stdio.h>

int main() {
    printf("C is case sensitive\\n");
    printf("A semicolon ends each statement\\n");
    printf("Braces define a block\\n");
    return 0;
}`,
        "C is case sensitive\nA semicolon ends each statement\nBraces define a block",
        {
          objectives: ["Apply C's punctuation rules", "Recognise the parts of a function definition"],
          explanation:
            "Each printf is a statement terminated by ';'. main has return type int, no parameters, and a body enclosed in braces.",
          tips: ["Indent consistently - 4 spaces is common in C.", "One statement per line keeps errors obvious."],
          mistakes: ["Putting a semicolon after int main() {", "Using curly quotes from a word processor."],
        },
      ),
      L(
        "c-statements-blocks",
        "Statements, Expressions and Blocks",
        "An expression produces a value, such as a + b. A statement performs an action, such as an assignment or a function call. A block is a group of statements inside braces and creates a new scope for variables declared within it.",
        "{\n    int local = 10;   /* visible only in this block */\n    printf(\"%d\", local);\n}",
        `#include <stdio.h>

int main() {
    int a = 4;
    int b = 6;
    int sum = a + b;          /* expression used in a statement */
    {
        int doubled = sum * 2; /* block-scoped variable */
        printf("doubled = %d\\n", doubled);
    }
    printf("sum = %d\\n", sum);
    return 0;
}`,
        "doubled = 20\nsum = 10",
        {
          objectives: ["Tell expressions and statements apart", "Understand block scope"],
          explanation:
            "doubled exists only inside the inner braces. After the block closes it can no longer be used, which prevents accidental name clashes.",
          tips: ["Declare variables as close to their first use as possible."],
          mistakes: ["Using a block variable after the closing brace."],
        },
      ),
      L(
        "c-case-sensitivity",
        "Case Sensitivity and Naming",
        "C treats uppercase and lowercase as different characters. int is a keyword, Int is an ordinary identifier, and main is not Main. This applies to variables, functions, headers and everything else.",
        "int count;   /* different from Count and COUNT */",
        `#include <stdio.h>

int main() {
    int count = 3;
    int Count = 30;
    printf("count = %d\\n", count);
    printf("Count = %d\\n", Count);
    return 0;
}`,
        "count = 3\nCount = 30",
        {
          objectives: ["Explain case sensitivity", "Avoid confusing names"],
          explanation:
            "Because count and Count are distinct variables, both can exist in the same scope. Consistent naming avoids mistakes.",
          tips: ["Use lowerCamelCase or snake_case consistently.", "Never rely on two names differing only by case."],
          mistakes: ["Writing Printf or Scanf with a capital letter."],
        },
      ),
      L(
        "c-escape-sequences",
        "Escape Sequences",
        "Escape sequences let a string contain characters you cannot type directly: \\n newline, \\t tab, \\\\ backslash, \\\" double quote, \\' single quote and \\0 the null terminator. They are used inside string and character literals.",
        "\\n  \\t  \\\\  \\\"  \\'  \\0",
        `#include <stdio.h>

int main() {
    printf("Line one\\nLine two\\n");
    printf("Quote: \\"C\\"\\n");
    printf("Backslash: \\\\ \\n");
    return 0;
}`,
        "Line one\nLine two\nQuote: \"C\"\nBackslash: \\",
        {
          objectives: ["Use common escape sequences", "Print quotes and backslashes"],
          explanation:
            "A backslash changes the meaning of the next character. To print a literal backslash you therefore write two backslashes.",
          tips: ["\\n is a single character stored in memory, not two."],
          mistakes: ["Writing \\n outside quotes, where it is not an escape sequence."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-comments",
        "Using Comments",
        "easy",
        "Print 'Learning C'. Put a single-line comment above the printf statement.",
        `#include <stdio.h>

int main() {
    // Add your comment here
    
    return 0;
}
`,
        "Learning C",
        ["Start the comment with //.", "Use printf(\"Learning C\\n\");"],
        "Comments are ignored by the compiler, so the output is unchanged.",
      ),
    ],
  },
  {
    id: "c-tokens",
    title: "C Tokens",
    difficulty: "beginner",
    section: "C Tokens",
    lessons: [
      L(
        "c-tokens-intro",
        "What are C Tokens?",
        "A token is the smallest meaningful unit the compiler recognises. C has six token types: keywords, identifiers, constants, string literals, operators and special symbols (punctuation).",
        "Program text -> keywords, identifiers, constants, strings, operators, punctuation",
        `#include <stdio.h>

int main() {
    int num = 100;            /* int: keyword, num: identifier, 100: constant */
    printf("%d\\n", num);     /* printf: identifier, "%d\\n": string literal */
    return 0;
}`,
        "100",
        {
          objectives: ["List the six token types", "Classify tokens in a small program"],
          explanation:
            "The compiler scans the source into tokens before checking grammar. Understanding tokens explains most beginner syntax errors.",
          tips: ["A missing semicolon merges or breaks tokens, so the error often points to the previous line."],
          mistakes: ["Splitting an identifier with a space or hyphen."],
        },
      ),
      L(
        "c-keywords",
        "C Keywords",
        "Keywords are reserved words with a fixed meaning. You cannot use them as variable or function names. Common ones include int, char, float, double, void, if, else, for, while, do, switch, return, break, continue, struct and typedef.",
        "int  char  float  double  void  if  else  for  while  return",
        `#include <stdio.h>

int main() {
    int x = 5;
    if (x > 0) {
        printf("x is positive\\n");
    }
    return 0;
}`,
        "x is positive",
        {
          objectives: ["Recognise reserved words", "Avoid using keywords as names"],
          explanation:
            "int, if, return and void are all keywords. The compiler rejects any attempt to redeclare them.",
          tips: ["Modern C has about 32 keywords - you will use only a dozen regularly."],
          mistakes: ["Naming a variable class or int in C (class is fine in C, not in C++)."],
        },
      ),
      L(
        "c-identifiers",
        "C Identifiers",
        "Identifiers are the names you give to variables, functions, arrays, structures and typedefs. They must start with a letter or underscore, may contain letters, digits and underscores, cannot contain spaces, and cannot be keywords.",
        "int age;        /* valid */\nint _count;     /* valid */\nint total_marks;/* valid */\nint 2ndPlace;   /* invalid */",
        `#include <stdio.h>

int main() {
    int studentAge = 18;
    float totalMarks = 85.5;
    char grade = 'A';
    printf("%d %.1f %c\\n", studentAge, totalMarks, grade);
    return 0;
}`,
        "18 85.5 A",
        {
          objectives: ["Apply identifier naming rules", "Choose readable names"],
          explanation:
            "studentAge, totalMarks and grade are valid identifiers. Meaningful names make code self-documenting.",
          tips: ["Prefer descriptive names over abbreviations.", "Avoid names beginning with two underscores - they are reserved."],
          mistakes: ["Starting a name with a digit.", "Using a hyphen, which the compiler reads as subtraction."],
        },
      ),
      L(
        "c-constants",
        "Constants and Literals",
        "A constant is a value that does not change. Literals are constants written directly in code: 42 (integer), 3.14 (floating), 'A' (character) and \"Hello\" (string). The const qualifier makes a named variable read-only.",
        "const float PI = 3.14159f;\nconst int LIMIT = 100;",
        `#include <stdio.h>

int main() {
    const float PI = 3.14159f;
    int radius = 5;
    float area = PI * radius * radius;
    printf("Area = %.2f\\n", area);
    return 0;
}`,
        "Area = 78.54",
        {
          objectives: ["Use literal constants", "Declare read-only values with const"],
          explanation:
            "PI is stored as a float and multiplied by radius twice. %.2f rounds the result to two decimal places for display.",
          tips: ["Write f after a float literal to avoid an implicit double-to-float conversion."],
          mistakes: ["Trying to assign a new value to a const variable - the compiler rejects it."],
        },
      ),
      L(
        "c-operators-tokens",
        "Operators and Punctuation Tokens",
        "Operators are tokens that act on values: + - * / % for arithmetic, = for assignment, == != < > for comparison, && || ! for logic, and & | ^ ~ << >> for bitwise work. Punctuation tokens include ( ) { } [ ] ; , . and ->.",
        "a + b   a == b   a && b   a << 2   p->x",
        `#include <stdio.h>

int main() {
    int a = 10;
    int b = 3;
    printf("%d\\n", a + b);
    printf("%d\\n", a % b);
    printf("%d\\n", a > b);
    return 0;
}`,
        "13\n1\n1",
        {
          objectives: ["Spot operators and punctuation", "Know the main operator families"],
          explanation:
            "Each operator is a separate token. Understanding grouping helps you read expressions such as a + b * c correctly.",
          tips: ["Use parentheses when precedence is not obvious."],
          mistakes: ["Confusing = (assignment) with == (comparison)."],
        },
      ),
      L(
        "c-special-symbols",
        "Special Symbols and Separators",
        "Special symbols give structure to a program. Semicolons end statements, commas separate declarations and arguments, braces delimit blocks, brackets index arrays, parentheses group expressions, and the dot operator accesses structure members.",
        ";  ,  { }  [ ]  ( )  .",
        `#include <stdio.h>

int main() {
    int a = 1, b = 2, c = 3;
    int values[3] = {a, b, c};
    printf("%d %d %d\\n", values[0], values[1], values[2]);
    return 0;
}`,
        "1 2 3",
        {
          objectives: ["Use separators correctly", "Read structured declarations"],
          explanation:
            "The comma declares three variables at once and also separates array initialisers. Braces provide the initial values.",
          tips: ["Braces and semicolons are the two most common sources of syntax errors."],
          mistakes: ["Using a comma where a semicolon is required between statements."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-tokens",
        "Identify and Use Tokens",
        "easy",
        "Declare an int variable named marks with the value 90 and print it.",
        `#include <stdio.h>

int main() {
    // Use a keyword, an identifier and a constant
    
    return 0;
}
`,
        "90",
        ["int is the keyword.", "marks is the identifier, 90 is the constant.", "Print with %d."],
        "Tokens combine to form a declaration: int marks = 90;",
      ),
    ],
  },
  {
    id: "c-variables",
    title: "C Variables",
    difficulty: "beginner",
    section: "C Variables",
    lessons: [
      L(
        "c-variables-intro",
        "Variables in C",
        "A variable is a named region of memory that stores a value of one type. You must declare it before use. The value can change during execution, which is what makes variables useful for counting, accumulating and storing input.",
        "data_type name = value;",
        `#include <stdio.h>

int main() {
    int age = 20;
    printf("Age is %d\\n", age);
    age = 21;
    printf("Updated age is %d\\n", age);
    return 0;
}`,
        "Age is 20\nUpdated age is 21",
        {
          objectives: ["Declare and use a variable", "Change a variable's value"],
          explanation:
            "age is declared once with type int. The second assignment replaces the stored value; the type never changes.",
          tips: ["Always initialise a variable before reading it."],
          mistakes: ["Reading an uninitialised local variable - its value is unpredictable."],
        },
      ),
      L(
        "c-declare-init",
        "Declaring and Initialising",
        "Declaration announces a variable's type and name. Initialisation gives it a first value. You can declare several variables on one line, and you can initialise later, but you cannot use a variable before it has a value.",
        "int a, b, c;\nint x = 10, y = 20;\nint z;\nz = x + y;",
        `#include <stdio.h>

int main() {
    int x = 10;
    int y, z;
    y = 20;
    z = x + y;
    printf("Sum = %d\\n", z);
    return 0;
}`,
        "Sum = 30",
        {
          objectives: ["Declare and initialise variables", "Use several variables in one expression"],
          explanation:
            "x is initialised at declaration, y is assigned on the next line, and z receives the result of the addition.",
          tips: ["Initialise at declaration when the value is known immediately."],
          mistakes: ["Using z before assigning it."],
        },
      ),
      L(
        "c-variable-rules",
        "Rules for Naming Variables",
        "Names must start with a letter or underscore, may contain letters, digits and underscores, are case-sensitive, and cannot be keywords. Choose names that describe the stored value and keep a consistent style.",
        "valid: total, _count, item2\ninvalid: 2item, total-marks, int",
        `#include <stdio.h>

int main() {
    int firstNumber = 100;
    int secondNumber = 200;
    int sum = firstNumber + secondNumber;
    printf("%d + %d = %d\\n", firstNumber, secondNumber, sum);
    return 0;
}`,
        "100 + 200 = 300",
        {
          objectives: ["Apply naming rules", "Write readable variable names"],
          explanation:
            "All three names follow the rules and describe their purpose, which makes the final printf easy to understand.",
          tips: ["Avoid single-letter names except for loop counters i, j, k."],
          mistakes: ["Using a keyword such as int or return as a name."],
        },
      ),
      L(
        "c-multiple-variables",
        "Multiple Variables and Assignments",
        "You can declare several variables of the same type with commas, and chain assignments because = returns the assigned value. Keep declarations readable - one variable per line is often clearer.",
        "int a = 1, b = 2, c = 3;\na = b = c = 0;",
        `#include <stdio.h>

int main() {
    int a = 1, b = 2, c = 3;
    printf("%d %d %d\\n", a, b, c);
    a = b = c = 0;
    printf("%d %d %d\\n", a, b, c);
    return 0;
}`,
        "1 2 3\n0 0 0",
        {
          objectives: ["Declare multiple variables", "Understand chained assignment"],
          explanation:
            "The chained assignment is evaluated right to left: c becomes 0, then b, then a.",
          tips: ["Prefer separate declarations when types differ."],
          mistakes: ["Mixing types in one declaration and losing precision."],
        },
      ),
      L(
        "c-scope",
        "Scope: Local and Global Variables",
        "A variable declared inside a function or block has local scope and exists only there. A variable declared outside all functions has global scope and is visible to every function after its declaration. Local variables with the same name hide globals.",
        "int global = 10;          /* file scope */\nvoid f(void) { int local = 20; }",
        `#include <stdio.h>

int counter = 10;

void show(void) {
    int counter = 20;
    printf("local = %d\\n", counter);
}

int main() {
    printf("global = %d\\n", counter);
    show();
    printf("global = %d\\n", counter);
    return 0;
}`,
        "global = 10\nlocal = 20\nglobal = 10",
        {
          objectives: ["Distinguish local and global scope", "Explain shadowing"],
          explanation:
            "show declares its own counter, which hides the global one inside that function. The global value is unchanged.",
          tips: ["Prefer local variables; globals make programs harder to reason about."],
          mistakes: ["Assuming a local assignment updates the global variable."],
        },
      ),
      L(
        "c-type-conversion",
        "Implicit and Explicit Conversion",
        "When operands have different types, C converts them to a common type. This implicit conversion can lose information, for example storing a double in an int truncates the fraction. A cast makes the conversion explicit: (int)value.",
        "(type) expression\nint n = (int) 3.9;   /* n becomes 3 */",
        `#include <stdio.h>

int main() {
    int total = 7;
    int count = 2;
    printf("integer division: %d\\n", total / count);
    printf("floating division: %.2f\\n", (float) total / count);
    printf("cast to int: %d\\n", (int) 3.99);
    return 0;
}`,
        "integer division: 3\nfloating division: 3.50\ncast to int: 3",
        {
          objectives: ["Predict implicit conversions", "Use casts deliberately"],
          explanation:
            "int / int performs integer division. Casting total to float forces floating-point division. Casting 3.99 to int truncates toward zero.",
          tips: ["Cast before dividing, not after - casting the result is too late."],
          mistakes: ["Expecting 3.5 from 7 / 2 without a cast or float literal."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-vars-print",
        "Print Variables",
        "easy",
        "Print the values of a and b, then their sum, each on its own line.",
        `#include <stdio.h>

int main() {
    int a = 5;
    int b = 10;
    // Print a, b and their sum
    
    return 0;
}
`,
        "5\n10\n15",
        ["Use three printf statements.", "printf(\"%d\\n\", a);", "Print a + b for the sum."],
        "Variables store values and printf displays them with format specifiers.",
      ),
      P(
        "c-prob-swap",
        "Swap Two Numbers",
        "medium",
        "Read two integers and print them swapped on one line, separated by a space.",
        `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    // Swap a and b, then print them
    
    return 0;
}
`,
        "7 3",
        ["Use a temporary variable: temp = a; a = b; b = temp;", "Print with printf(\"%d %d\\n\", a, b);"],
        "A temporary variable holds one value while the other is overwritten.",
        "3 7\n",
      ),
    ],
  },
  {
    id: "c-data-types",
    title: "C Data Types",
    difficulty: "beginner",
    section: "C Data Types",
    lessons: [
      L(
        "c-data-types-intro",
        "Introduction to Data Types",
        "A data type tells the compiler how many bytes to reserve and how to interpret those bits. C's basic types are int (whole numbers), float and double (real numbers), char (a single character), and void (no value).",
        "int age = 25;\nfloat temp = 36.6f;\nchar grade = 'A';",
        `#include <stdio.h>

int main() {
    int age = 25;
    float temp = 36.6f;
    char grade = 'A';
    printf("Age: %d\\n", age);
    printf("Temp: %.2f\\n", temp);
    printf("Grade: %c\\n", grade);
    return 0;
}`,
        "Age: 25\nTemp: 36.60\nGrade: A",
        {
          objectives: ["Name the basic data types", "Choose a type for a value"],
          explanation:
            "Each type has its own format specifier: %d for int, %f for float and %c for char.",
          tips: ["Use double instead of float unless memory is tight."],
          mistakes: ["Storing a decimal number in an int - the fraction is lost."],
        },
      ),
      L(
        "c-int-types",
        "Integer Types: short, int, long, long long",
        "C offers several integer widths. short is usually 16 bits, int is usually 32 bits, long is 32 bits on 64-bit Windows and 64 bits on Linux, and long long is at least 64 bits. Use the smallest type that safely holds your range.",
        "short s = 10;\nint i = 1000;\nlong l = 100000L;\nlong long ll = 10000000000LL;",
        `#include <stdio.h>

int main() {
    short s = 10;
    int i = 1000;
    long l = 100000L;
    long long ll = 10000000000LL;
    printf("%hd %d %ld %lld\\n", s, i, l, ll);
    return 0;
}`,
        "10 1000 100000 10000000000",
        {
          objectives: ["Use the integer type families", "Match format specifiers to lengths"],
          explanation:
            "The length modifiers hd, ld and lld tell printf how many bytes to read from the argument list.",
          tips: ["Add L to a long literal and LL to a long long literal."],
          mistakes: ["Printing a long with %d - the width mismatch gives wrong output."],
        },
      ),
      L(
        "c-unsigned-signed",
        "Signed and Unsigned Integers",
        "A signed integer stores positive, negative and zero values. An unsigned integer stores only zero and positive values, doubling the maximum. The suffix u creates an unsigned literal, and %u prints one.",
        "unsigned int count = 4000000000u;\nint temperature = -25;",
        `#include <stdio.h>

int main() {
    unsigned int count = 4000000000u;
    int temperature = -25;
    printf("count = %u\\n", count);
    printf("temperature = %d\\n", temperature);
    return 0;
}`,
        "count = 4000000000\ntemperature = -25",
        {
          objectives: ["Choose signed or unsigned", "Print unsigned values"],
          explanation:
            "count is larger than the signed 32-bit maximum, so it must be unsigned. temperature can be negative, so it must be signed.",
          tips: ["Use unsigned for sizes and bit masks, not for ordinary numbers."],
          mistakes: ["Printing an unsigned value with %d shows a negative number for large values."],
        },
      ),
      L(
        "c-char-type",
        "The char Type",
        "char stores a single character such as 'A' or '7'. Internally it is a small integer holding the character's code. printf %c prints the character, while %d prints its numeric code.",
        "char letter = 'C';\nprintf(\"%c %d\\n\", letter, letter);",
        `#include <stdio.h>

int main() {
    char letter = 'C';
    char digit = '7';
    printf("letter = %c\\n", letter);
    printf("digit as char = %c\\n", digit);
    printf("digit as int = %d\\n", digit);
    return 0;
}`,
        "letter = C\ndigit as char = 7\ndigit as int = 55",
        {
          objectives: ["Store characters in char", "Convert between char and its code"],
          explanation:
            "Character literals use single quotes. In ASCII, '7' has code 55, which is what %d shows.",
          tips: ["Use single quotes for characters and double quotes for strings."],
          mistakes: ["Assigning \"A\" (a string) to a char variable."],
        },
      ),
      L(
        "c-float-double",
        "Floating-Point Types: float and double",
        "float and double store real numbers with a fractional part. double has more precision and is the default floating type. A literal without a suffix is a double; add f to make it a float.",
        "float f = 3.14f;\ndouble d = 3.141592653589793;",
        `#include <stdio.h>

int main() {
    float f = 3.14f;
    double d = 3.141592653589793;
    printf("float: %.7f\\n", f);
    printf("double: %.15f\\n", d);
    return 0;
}`,
        "float: 3.1400001\ndouble: 3.141592653589793",
        {
          objectives: ["Use float and double", "Explain precision differences"],
          explanation:
            "A float keeps about 7 significant digits, so 3.14f prints as 3.1400001. A double keeps about 15-16 digits.",
          tips: ["Use double for money-like calculations and scientific work."],
          mistakes: ["Comparing floating-point values with ==; compare a small difference instead."],
        },
      ),
      L(
        "c-sizeof",
        "Measuring Types with sizeof",
        "sizeof is a compile-time operator that reports how many bytes a type or value occupies. Its result has type size_t, so print it with %zu. Sizes depend on the platform.",
        "printf(\"%zu\\n\", sizeof(int));",
        `#include <stdio.h>

int main() {
    printf("char: %zu\\n", sizeof(char));
    printf("int: %zu\\n", sizeof(int));
    printf("double: %zu\\n", sizeof(double));
    printf("pointer: %zu\\n", sizeof(void *));
    return 0;
}`,
        "char: 1\nint: 4\ndouble: 8\npointer: 4",
        {
          objectives: ["Use sizeof", "Relate type sizes to ranges"],
          explanation:
            "The browser engine is a 32-bit WebAssembly target, so pointers are 4 bytes. On a 64-bit desktop the pointer size would be 8.",
          tips: ["Use sizeof(array) / sizeof(array[0]) to count array elements."],
          mistakes: ["Assuming int is always 4 bytes on every platform."],
        },
      ),
      L(
        "c-typedef",
        "Creating Type Aliases with typedef",
        "typedef gives an existing type a new name. It does not create a new type; it only makes declarations shorter and more meaningful. It is especially useful for structs.",
        "typedef unsigned int uint;\ntypedef struct { int x, y; } Point;",
        `#include <stdio.h>

typedef int Temperature;

int main() {
    Temperature room = 24;
    Temperature oven = 180;
    printf("room = %d, oven = %d\\n", room, oven);
    return 0;
}`,
        "room = 24, oven = 180",
        {
          objectives: ["Create a typedef", "Use typedef for readability"],
          explanation:
            "Temperature is just another name for int, but it documents intent and can be changed in one place later.",
          tips: ["Conventionally typedef names end with _t, such as size_t."],
          mistakes: ["Thinking typedef creates a distinct type - it is an alias."],
        },
      ),
      L(
        "c-enum",
        "Enumerations",
        "An enum defines a set of named integer constants. The first name is 0 by default and each following name increases by one unless you assign a value explicitly. Enums make code such as states and weekdays readable.",
        "enum Color { RED, GREEN, BLUE };",
        `#include <stdio.h>

enum Color { RED, GREEN = 5, BLUE };

int main() {
    printf("RED = %d\\n", RED);
    printf("GREEN = %d\\n", GREEN);
    printf("BLUE = %d\\n", BLUE);
    return 0;
}`,
        "RED = 0\nGREEN = 5\nBLUE = 6",
        {
          objectives: ["Declare an enum", "Predict enum values"],
          explanation:
            "RED gets 0. GREEN is explicitly 5, so the next name BLUE becomes 6.",
          tips: ["Use enums instead of magic numbers in switch statements."],
          mistakes: ["Assuming enum values are strings - they are integers."],
        },
      ),
      L(
        "c-type-casting",
        "Type Casting",
        "Casting converts a value from one type to another. An implicit cast happens automatically during mixed-type arithmetic. An explicit cast, written (type)value, documents the conversion and silences warnings.",
        "(double) count / total\n(int) 3.99   /* 3 */",
        `#include <stdio.h>

int main() {
    int a = 7, b = 2;
    printf("int division: %d\\n", a / b);
    printf("double division: %.2f\\n", (double) a / b);
    printf("truncated: %d\\n", (int) 3.99);
    return 0;
}`,
        "int division: 3\ndouble division: 3.50\ntruncated: 3",
        {
          objectives: ["Cast between numeric types", "Avoid integer division surprises"],
          explanation:
            "Casting a to double before the division changes the whole expression to floating point. Casting to int truncates toward zero.",
          tips: ["Cast the operand before the operation, not the result."],
          mistakes: ["Casting after division: (double)(a / b) still performs integer division first."],
        },
      ),
      L(
        "c-type-ranges",
        "Type Ranges with limits.h",
        "The limits.h header defines macros for the minimum and maximum value of each integer type, such as INT_MAX, INT_MIN, SCHAR_MAX and UCHAR_MAX. float.h provides limits for floating types.",
        "#include <limits.h>\nINT_MAX, INT_MIN, SCHAR_MAX, UCHAR_MAX",
        `#include <stdio.h>
#include <limits.h>

int main() {
    printf("INT_MAX = %d\\n", INT_MAX);
    printf("INT_MIN = %d\\n", INT_MIN);
    printf("SCHAR_MAX = %d\\n", SCHAR_MAX);
    printf("UCHAR_MAX = %d\\n", UCHAR_MAX);
    return 0;
}`,
        "INT_MAX = 2147483647\nINT_MIN = -2147483648\nSCHAR_MAX = 127\nUCHAR_MAX = 255",
        {
          objectives: ["Read integer limits", "Prevent overflow"],
          explanation:
            "These macros expand to constants for the target platform. Use them instead of hard-coding magic numbers.",
          tips: ["Unsigned overflow wraps around; signed overflow is undefined behaviour."],
          mistakes: ["Assuming the range of int is the same on every machine."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-sizes",
        "Print Type Sizes",
        "easy",
        "Print the size of int, char and double, one per line, in the form: int = 4",
        `#include <stdio.h>

int main() {
    // Print sizes using sizeof and %zu
    
    return 0;
}
`,
        "int = 4\nchar = 1\ndouble = 8",
        ["Use sizeof(int) with %zu.", "printf(\"int = %zu\\n\", sizeof(int));"],
        "sizeof reports bytes. The browser's 32-bit target stores int in 4 bytes.",
      ),
      P(
        "c-prob-average",
        "Average of Three Numbers",
        "medium",
        "Read three integers and print their average with exactly two decimal places.",
        `#include <stdio.h>

int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    // Print the average with 2 decimals
    
    return 0;
}
`,
        "3.00",
        ["Cast one value to double before dividing.", "Use %.2f to print two decimals."],
        "Integer division would lose the fraction, so cast before dividing.",
        "2 3 4\n",
      ),
    ],
  },
];
