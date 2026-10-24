import type { Topic } from "../../../types";
import { L, P } from "./helpers";

export const sections2: Topic[] = [
  {
    id: "c-format-specifiers",
    title: "C Format Specifiers",
    difficulty: "beginner",
    section: "C Format Specifiers",
    lessons: [
      L(
        "c-printf-format",
        "How Format Specifiers Work",
        "A format specifier starts with % and tells printf what kind of value comes next in the argument list. The specifier must match the argument's type. A mismatch is undefined behaviour - it may print garbage or crash.",
        "printf(\"format string\", value1, value2);\n%d int   %f double   %c char   %s string",
        `#include <stdio.h>

int main() {
    int age = 25;
    double pi = 3.14;
    char grade = 'A';
    printf("Age: %d\\n", age);
    printf("Pi: %f\\n", pi);
    printf("Grade: %c\\n", grade);
    return 0;
}`,
        "Age: 25\nPi: 3.140000\nGrade: A",
        {
          objectives: ["Match specifiers to types", "Read a format string"],
          explanation:
            "Each % is replaced by the corresponding argument. %f prints six decimal places by default.",
          tips: ["Count the % signs and the arguments - they must line up."],
          mistakes: ["Using %d for a double - the output is undefined."],
        },
      ),
      L(
        "c-integer-specifiers",
        "Integer Format Specifiers",
        "%d and %i print a signed int in decimal. %u prints unsigned. %x and %X print hexadecimal in lower and upper case, and %o prints octal. Prefixes such as %#x add 0x to hexadecimal output.",
        "%d %i signed\n%u unsigned\n%x %X hex\n%o octal",
        `#include <stdio.h>

int main() {
    int d = -42;
    unsigned int u = 42;
    printf("decimal: %d\\n", d);
    printf("unsigned: %u\\n", u);
    printf("hex: %x\\n", 255);
    printf("HEX: %X\\n", 255);
    printf("octal: %o\\n", 8);
    return 0;
}`,
        "decimal: -42\nunsigned: 42\nhex: ff\nHEX: FF\noctal: 10",
        {
          objectives: ["Choose the right integer specifier", "Print numbers in other bases"],
          explanation:
            "255 is ff in hexadecimal and 8 is 10 in octal. The value is the same; only the display base changes.",
          tips: ["Use %x for debugging bit masks and memory addresses."],
          mistakes: ["Printing a negative number with %u produces a huge positive value."],
        },
      ),
      L(
        "c-float-specifiers",
        "Floating-Point Specifiers: %f, %e, %g",
        "%f prints fixed-point notation with six decimals by default. %e prints scientific notation. %g chooses the shorter of the two. In printf, %f accepts a double, and float arguments are promoted to double automatically.",
        "%f fixed   %e scientific   %g shortest\n%.2f two decimals",
        `#include <stdio.h>

int main() {
    double price = 19.5;
    float ratio = 0.125f;
    printf("default: %f\\n", price);
    printf("2 dp: %.2f\\n", price);
    printf("float: %f\\n", ratio);
    printf("scientific: %e\\n", 12345.678);
    return 0;
}`,
        "default: 19.500000\n2 dp: 19.50\nfloat: 0.125000\nscientific: 1.234568e+04",
        {
          objectives: ["Control decimal places", "Use scientific notation"],
          explanation:
            "The number after the dot is the precision. %f uses six decimals when no precision is given.",
          tips: ["In printf, %lf is accepted but %f is the canonical double specifier.", "In scanf the rule is different: use %lf for double."],
          mistakes: ["Using %d for a floating-point value - this is undefined behaviour."],
        },
      ),
      L(
        "c-text-specifiers",
        "Character and String Specifiers",
        "%c prints a single character and %s prints a null-terminated string. A string is an array of char ending with the null character '\\0'; printf stops at that terminator.",
        "%c character\n%s string\n%20s right-aligned in 20 columns",
        `#include <stdio.h>

int main() {
    char ch = 'A';
    char name[] = "CodeLab";
    printf("char: %c\\n", ch);
    printf("string: %s\\n", name);
    printf("first char: %c\\n", name[0]);
    return 0;
}`,
        "char: A\nstring: CodeLab\nfirst char: C",
        {
          objectives: ["Print characters and strings", "Index a string"],
          explanation:
            "name is an array of characters. name[0] is the first character, and the array is automatically terminated by '\\0'.",
          tips: ["Always leave room for the terminating null character in a char array."],
          mistakes: ["Using %c to print a whole string - it prints only the first character."],
        },
      ),
      L(
        "c-width-precision-flags",
        "Width, Precision and Flags",
        "A specifier can include a width and precision: %8.2f means at least 8 characters wide with 2 decimals. The minus flag left-aligns, 0 pads with zeros, and + always shows a sign. Precision on %s limits how many characters are printed.",
        "%[flags][width][.precision]specifier\n%5d  %-5d  %05d  %8.2f  %.3s",
        `#include <stdio.h>

int main() {
    printf("|%5d|\\n", 42);
    printf("|%-5d|\\n", 42);
    printf("|%05d|\\n", 42);
    printf("|%8.2f|\\n", 3.14159);
    printf("|%.3s|\\n", "CodeLab");
    return 0;
}`,
        "|   42|\n|42   |\n|00042|\n|    3.14|\n|Cod|",
        {
          objectives: ["Align columns with width", "Limit precision"],
          explanation:
            "%5d pads on the left. %-5d pads on the right. %05d pads with zeros. %.3s prints only the first three characters.",
          tips: ["Use width alignment to build neat text tables."],
          mistakes: ["Confusing width (minimum characters) with precision (digits after the dot)."],
        },
      ),
      L(
        "c-scanf-specifiers",
        "scanf Format Specifiers",
        "scanf reads input using the same specifier letters but different rules. You must pass the address of the variable with &. For double use %lf - %f alone reads a float, not a double. Width limits prevent buffer overflow when reading strings.",
        "scanf(\"%d\", &age);\nscanf(\"%lf\", &height);\nscanf(\"%19s\", name);",
        `#include <stdio.h>

int main() {
    int age;
    double height;
    char grade;
    printf("Enter age height grade: ");
    scanf("%d %lf %c", &age, &height, &grade);
    printf("age=%d height=%.2f grade=%c\\n", age, height, grade);
    return 0;
}`,
        "Enter age height grade: age=20 height=5.90 grade=A",
        {
          objectives: ["Pass addresses to scanf", "Use %lf for double input"],
          explanation:
            "The space before %c in the format string skips the leftover newline, so %c reads 'A' instead of a blank.",
          tips: ["Check scanf's return value to confirm how many items were read."],
          mistakes: ["Passing the variable instead of its address: scanf(\"%d\", age).", "Using %f for a double in scanf - use %lf."],
          exampleStdin: "20 5.9 A\n",
        },
      ),
      L(
        "c-length-modifiers",
        "Length Modifiers and size_t",
        "Length modifiers adjust a specifier for wider or narrower types: %hd short, %ld long, %lld long long, %zu size_t, %hhd signed char. They must match the argument's actual type or the output is undefined.",
        "%hd short   %ld long   %lld long long   %zu size_t",
        `#include <stdio.h>

int main() {
    long big = 123456789L;
    long long huge = 1234567890123LL;
    size_t bytes = sizeof(int);
    printf("long: %ld\\n", big);
    printf("long long: %lld\\n", huge);
    printf("size_t: %zu\\n", bytes);
    return 0;
}`,
        "long: 123456789\nlong long: 1234567890123\nsize_t: 4",
        {
          objectives: ["Use length modifiers", "Print size_t correctly"],
          explanation:
            "sizeof produces a size_t, which is unsigned. On the 32-bit WebAssembly target it is 4 bytes.",
          tips: ["Always use %zu for values returned by sizeof."],
          mistakes: ["Using %d for sizeof - on 64-bit systems the output can be wrong."],
        },
      ),
      L(
        "c-specifier-mistakes",
        "Common Format Specifier Mistakes",
        "The most common bugs are using %d with a double, %f with an int, forgetting & in scanf, using %f instead of %lf in scanf for double, and printing a string with %c. Cast deliberately when you need to convert between types.",
        "wrong: printf(\"%d\", 3.5);\nright: printf(\"%f\", 3.5);\nright: printf(\"%d\", (int) 3.5);",
        `#include <stdio.h>

int main() {
    int age = 30;
    double price = 9.99;
    printf("age as float: %f\\n", (double) age);
    printf("price 2dp: %.2f\\n", price);
    printf("percent sign: 100%%\\n");
    return 0;
}`,
        "age as float: 30.000000\nprice 2dp: 9.99\npercent sign: 100%",
        {
          objectives: ["Recognise mismatched specifiers", "Print a literal percent sign"],
          explanation:
            "age is cast to double so %f is correct. To print a literal % you write %%.",
          tips: ["If output looks like 0 or a huge number, check the specifier first."],
          mistakes: ["Writing printf(\"100%\\n\") without escaping the percent sign."],
        },
      ),
      L(
        "c-format-reference",
        "Format Specifier Reference Table",
        "Keep this table handy. The printf column is what you pass to printf, and the scanf column is what you pass to scanf. Note that double differs between the two: printf uses %f, scanf requires %lf.",
        "printf vs scanf specifiers for the same C type",
        `#include <stdio.h>

int main() {
    printf("%-10s %-8s %s\\n", "Type", "printf", "scanf");
    printf("%-10s %-8s %s\\n", "int", "%d", "%d");
    printf("%-10s %-8s %s\\n", "double", "%f", "%lf");
    printf("%-10s %-8s %s\\n", "char", "%c", "%c");
    printf("%-10s %-8s %s\\n", "string", "%s", "%s");
    return 0;
}`,
        "Type       printf   scanf\nint        %d       %d\ndouble     %f       %lf\nchar       %c       %c\nstring     %s       %s",
        {
          objectives: ["Recall specifiers for each type", "See why scanf differs"],
          explanation:
            "scanf needs to know the real storage size, which is why double input uses %lf. printf receives a promoted double either way.",
          tips: ["Bookmark this lesson while writing input-heavy programs."],
          mistakes: ["Using the scanf column in printf or vice versa."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-format-table",
        "Print a Formatted Row",
        "easy",
        "Read a name (one word) and an integer score, then print them right-aligned: name in 8 columns, score in 5 columns, separated by a space.",
        `#include <stdio.h>

int main() {
    char name[32];
    int score;
    scanf("%31s %d", name, &score);
    // Print with width 8 and 5
    
    return 0;
}
`,
        "     Ada    95",
        ["Use %8s for the name.", "Use %5d for the score."],
        "Width numbers pad on the left by default.",
        "Ada 95\n",
      ),
      P(
        "c-prob-price",
        "Format a Price",
        "easy",
        "Read a double price and print it with exactly two decimal places.",
        `#include <stdio.h>

int main() {
    double price;
    scanf("%lf", &price);
    // Print the price with 2 decimals
    
    return 0;
}
`,
        "19.50",
        ["Use %lf in scanf for double.", "Use %.2f in printf."],
        "scanf needs %lf for double; printf uses %f with a precision.",
        "19.5\n",
      ),
    ],
  },
  {
    id: "c-input-output",
    title: "C Input & Output",
    difficulty: "beginner",
    section: "C Input & Output",
    lessons: [
      L(
        "c-printf",
        "Output with printf",
        "printf writes formatted text to standard output. It returns the number of characters written. The format string can contain plain text, escape sequences and format specifiers.",
        "printf(\"format string\", arguments);",
        `#include <stdio.h>

int main() {
    int year = 1972;
    printf("C was created in %d\\n", year);
    printf("It is still widely used today\\n");
    return 0;
}`,
        "C was created in 1972\nIt is still widely used today",
        {
          objectives: ["Print text and values", "Use escape sequences"],
          explanation:
            "The first printf substitutes year for %d. The second prints a plain string.",
          tips: ["End lines with \\n so terminal prompts do not run together."],
          mistakes: ["Passing a variable to printf without a matching specifier."],
        },
      ),
      L(
        "c-puts-putchar",
        "puts and putchar",
        "puts writes a string followed by a newline. putchar writes one character. They are simpler and slightly faster than printf when you do not need formatting.",
        "puts(\"text\");\nputchar('A');",
        `#include <stdio.h>

int main() {
    puts("Hello from puts");
    putchar('C');
    putchar('\\n');
    return 0;
}`,
        "Hello from puts\nC",
        {
          objectives: ["Use puts and putchar", "Know when printf is unnecessary"],
          explanation:
            "puts adds the newline automatically, while putchar prints exactly the character you give it.",
          tips: ["Use puts for fixed messages."],
          mistakes: ["Expecting puts to format values - it takes only a string."],
        },
      ),
      L(
        "c-scanf",
        "Reading Input with scanf",
        "scanf reads formatted input from standard input. Each specifier must be paired with the address of a variable, written with &. Whitespace in the format matches any amount of whitespace in the input.",
        "scanf(\"%d\", &number);",
        `#include <stdio.h>

int main() {
    int number;
    printf("Enter a number: ");
    scanf("%d", &number);
    printf("You entered %d\\n", number);
    return 0;
}`,
        "Enter a number: You entered 42",
        {
          objectives: ["Read an integer", "Use the address operator"],
          explanation:
            "scanf stores the parsed value at the address of number. The prompt has no newline, so the result follows on the same line.",
          tips: ["Always check that scanf returned 1 before using the value."],
          mistakes: ["Writing scanf(\"%d\", number) without &."],
          exampleStdin: "42\n",
        },
      ),
      L(
        "c-read-numbers",
        "Reading Several Values",
        "A single scanf can read multiple values separated by spaces or newlines. The number of successfully assigned items is returned, which you can use to validate input.",
        "scanf(\"%d %d\", &a, &b);",
        `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Sum = %d\\n", a + b);
    return 0;
}`,
        "Sum = 12",
        {
          objectives: ["Read multiple values", "Use whitespace-separated input"],
          explanation:
            "The two integers can be on one line or on separate lines; scanf skips whitespace between them.",
          tips: ["Keep the format string simple: spaces between specifiers already match any whitespace."],
          mistakes: ["Adding a newline inside the format string and expecting it to matter - it just skips whitespace."],
          exampleStdin: "7 5\n",
        },
      ),
      L(
        "c-read-strings-fgets",
        "Reading Lines with fgets",
        "scanf %s stops at the first whitespace, so it cannot read a full name. fgets reads a whole line, keeps spaces and includes the newline if there is room. Always pass the buffer size.",
        "fgets(buffer, sizeof buffer, stdin);",
        `#include <stdio.h>

int main() {
    char name[32];
    printf("Enter your name: ");
    fgets(name, sizeof name, stdin);
    printf("Hello, %s", name);
    return 0;
}`,
        "Enter your name: Hello, Ada",
        {
          objectives: ["Read a full line", "Use fgets safely"],
          explanation:
            "fgets stops after a newline or when the buffer is full. The newline stays in the string, which is why the output does not need an extra \\n.",
          tips: ["Open the file with fopen and read lines with fgets for file input."],
          mistakes: ["Using gets - it is unsafe and was removed from the language."],
          exampleStdin: "Ada\n",
        },
      ),
      L(
        "c-read-chars",
        "Reading Characters with getchar",
        "getchar reads one character from standard input and returns it as an int, or EOF when input ends. Using int lets it represent EOF distinctly from every valid character.",
        "int c = getchar();\nputchar(c);",
        `#include <stdio.h>

int main() {
    int c;
    printf("Type a letter: ");
    c = getchar();
    printf("\\nYou typed: %c\\n", c);
    return 0;
}`,
        "Type a letter: \nYou typed: K",
        {
          objectives: ["Read one character", "Handle EOF"],
          explanation:
            "getchar returns the next byte of input. The leading \\n in the second printf starts a new line after the prompt.",
          tips: ["Loop with while ((c = getchar()) != EOF) to process all input."],
          mistakes: ["Storing getchar's result in a char, which cannot represent EOF reliably."],
          exampleStdin: "K\n",
        },
      ),
      L(
        "c-input-buffer",
        "Leftover Newlines and Input Buffers",
        "scanf leaves unread characters in the input buffer. After reading a number, the newline remains, so a following %c would read that newline instead of your character. Put a space before %c to skip whitespace.",
        "scanf(\" %c\", &ch);   /* leading space skips whitespace */",
        `#include <stdio.h>

int main() {
    int age;
    char grade;
    printf("Age: ");
    scanf("%d", &age);
    printf("Grade: ");
    scanf(" %c", &grade);
    printf("age=%d grade=%c\\n", age, grade);
    return 0;
}`,
        "Age: Grade: age=18 grade=B",
        {
          objectives: ["Explain the input buffer", "Skip whitespace before %c"],
          explanation:
            "Without the space, %c would read the newline left by %d. The space in \" %c\" tells scanf to skip any whitespace first.",
          tips: ["Mix fgets and sscanf when input has both lines and numbers."],
          mistakes: ["Assuming scanf always consumes the entire line."],
          exampleStdin: "18\nB\n",
        },
      ),
    ],
    problems: [
      P(
        "c-prob-greet",
        "Greet by Name",
        "easy",
        "Read one word and print Hello, followed by the name and an exclamation mark.",
        `#include <stdio.h>

int main() {
    char name[32];
    scanf("%31s", name);
    // Print the greeting
    
    return 0;
}
`,
        "Hello, Ada!",
        ["Read with %31s to limit the buffer.", "Print with %s."],
        "%s stops at whitespace, which is fine for a single-word name.",
        "Ada\n",
      ),
      P(
        "c-prob-sum-input",
        "Add Two Inputs",
        "easy",
        "Read two integers and print their sum.",
        `#include <stdio.h>

int main() {
    int a, b;
    // Read two integers and print their sum
    
    return 0;
}
`,
        "15",
        ["scanf(\"%d %d\", &a, &b);", "printf(\"%d\\n\", a + b);"],
        "Pass the addresses of both variables to scanf.",
        "10 5\n",
      ),
    ],
  },
  {
    id: "c-operators",
    title: "C Operators",
    difficulty: "beginner",
    section: "C Operators",
    lessons: [
      L(
        "c-arithmetic",
        "Arithmetic Operators",
        "C provides +, -, *, / and % (remainder). Integer division discards the fraction. The remainder operator works only with integers; for floating-point remainders use fmod from math.h.",
        "a + b   a - b   a * b   a / b   a % b",
        `#include <stdio.h>

int main() {
    int a = 10, b = 3;
    printf("add: %d\\n", a + b);
    printf("sub: %d\\n", a - b);
    printf("mul: %d\\n", a * b);
    printf("div: %d\\n", a / b);
    printf("rem: %d\\n", a % b);
    return 0;
}`,
        "add: 13\nsub: 7\nmul: 30\ndiv: 3\nrem: 1",
        {
          objectives: ["Apply arithmetic operators", "Predict integer division"],
          explanation:
            "10 / 3 is 3 because the fraction is discarded. 10 % 3 is the remainder, 1.",
          tips: ["Use % only with integers."],
          mistakes: ["Expecting 3.33 from 10 / 3."],
        },
      ),
      L(
        "c-relational",
        "Relational Operators",
        "Relational operators compare two values and produce 1 (true) or 0 (false): == equal, != not equal, > greater, < less, >= greater or equal, <= less or equal. They are often used inside if conditions.",
        "a == b   a != b   a > b   a < b   a >= b   a <= b",
        `#include <stdio.h>

int main() {
    int a = 5, b = 3;
    printf("%d\\n", a > b);
    printf("%d\\n", a < b);
    printf("%d\\n", a == b);
    printf("%d\\n", a != b);
    return 0;
}`,
        "1\n0\n0\n1",
        {
          objectives: ["Use comparison operators", "Interpret boolean results"],
          explanation:
            "C has no dedicated boolean type in older code; any non-zero value is true and zero is false.",
          tips: ["Use == for comparison and = for assignment."],
          mistakes: ["Writing if (a = b) when you meant if (a == b)."],
        },
      ),
      L(
        "c-logical",
        "Logical Operators",
        "Logical AND (&&) is true only when both operands are true. Logical OR (||) is true when at least one is. Logical NOT (!) flips true to false. They short-circuit: the right operand may not be evaluated.",
        "a && b   a || b   !a",
        `#include <stdio.h>

int main() {
    int age = 20;
    int hasId = 1;
    printf("%d\\n", age >= 18 && hasId);
    printf("%d\\n", age < 18 || hasId);
    printf("%d\\n", !hasId);
    return 0;
}`,
        "1\n1\n0",
        {
          objectives: ["Combine conditions", "Explain short-circuit evaluation"],
          explanation:
            "The first expression is true because both parts hold. The third is false because hasId is 1, so !hasId is 0.",
          tips: ["Put the cheap or safety-critical check first in && expressions."],
          mistakes: ["Using bitwise & instead of logical && in conditions."],
        },
      ),
      L(
        "c-assignment",
        "Assignment and Compound Assignment",
        "The = operator assigns a value. Compound assignments combine an operation with assignment: +=, -=, *=, /=, %=. They are shorthand for a = a + b and similar.",
        "x += 5;   /* x = x + 5 */\nx *= 2;   /* x = x * 2 */",
        `#include <stdio.h>

int main() {
    int x = 10;
    x += 5;
    printf("%d\\n", x);
    x -= 3;
    printf("%d\\n", x);
    x *= 2;
    printf("%d\\n", x);
    x /= 4;
    printf("%d\\n", x);
    return 0;
}`,
        "15\n12\n24\n6",
        {
          objectives: ["Use compound assignment", "Simplify update statements"],
          explanation:
            "Each compound assignment updates x in place. Integer division in the final step gives 6.",
          tips: ["Compound assignment avoids repeating a long variable name."],
          mistakes: ["Confusing = with ==."],
        },
      ),
      L(
        "c-increment",
        "Increment and Decrement",
        "++ adds one and -- subtracts one. In prefix form (++i) the value is updated before it is used. In postfix form (i++) the old value is used and then updated. Using both forms in one expression is confusing and can be undefined.",
        "++i  pre-increment\ni++  post-increment\n--i  pre-decrement\ni--  post-decrement",
        `#include <stdio.h>

int main() {
    int i = 5;
    printf("i++ gives %d\\n", i++);
    printf("i is now %d\\n", i);
    printf("++i gives %d\\n", ++i);
    printf("i is now %d\\n", i);
    return 0;
}`,
        "i++ gives 5\ni is now 6\n++i gives 7\ni is now 7",
        {
          objectives: ["Distinguish prefix and postfix", "Avoid side-effect confusion"],
          explanation:
            "Postfix i++ returns 5 then increments. Prefix ++i increments first and returns 7.",
          tips: ["Use ++i in loops when the old value is not needed."],
          mistakes: ["Modifying the same variable twice in one expression, which is undefined behaviour."],
        },
      ),
      L(
        "c-bitwise",
        "Bitwise Operators",
        "Bitwise operators work on individual bits: & AND, | OR, ^ XOR, ~ NOT, << left shift, >> right shift. They are used for flags, masks and low-level data manipulation.",
        "a & b   a | b   a ^ b   ~a   a << n   a >> n",
        `#include <stdio.h>

int main() {
    int a = 5; /* 0101 */
    int b = 3; /* 0011 */
    printf("and: %d\\n", a & b);
    printf("or: %d\\n", a | b);
    printf("xor: %d\\n", a ^ b);
    printf("not: %d\\n", ~a);
    printf("left: %d\\n", a << 1);
    printf("right: %d\\n", a >> 1);
    return 0;
}`,
        "and: 1\nor: 7\nxor: 6\nnot: -6\nleft: 10\nright: 2",
        {
          objectives: ["Apply bitwise operators", "Read binary representations"],
          explanation:
            "0101 & 0011 is 0001. 0101 | 0011 is 0111. 0101 ^ 0011 is 0110. ~5 flips all bits, giving -6 in two's complement.",
          tips: ["Use unsigned types for bit manipulation to avoid sign issues."],
          mistakes: ["Mixing up & with && and | with ||."],
        },
      ),
      L(
        "c-ternary",
        "The Conditional (Ternary) Operator",
        "The conditional operator ?: chooses between two values based on a condition. It is an expression, so it can be used inside printf or an assignment.",
        "condition ? value_if_true : value_if_false",
        `#include <stdio.h>

int main() {
    int age = 20;
    printf("%s\\n", age >= 18 ? "adult" : "minor");
    int max = 10 > 7 ? 10 : 7;
    printf("max = %d\\n", max);
    return 0;
}`,
        "adult\nmax = 10",
        {
          objectives: ["Write a ternary expression", "Choose between values"],
          explanation:
            "The condition selects which value is produced. It is a compact alternative to a short if/else.",
          tips: ["Use ?: only when both branches are simple values."],
          mistakes: ["Using an assignment inside the condition instead of a comparison."],
        },
      ),
      L(
        "c-precedence",
        "Operator Precedence and Associativity",
        "Precedence decides which operator runs first: multiplication before addition, comparison before logical AND, and so on. Parentheses override precedence and make intent clear.",
        "2 + 3 * 4   == 14\n(2 + 3) * 4 == 20",
        `#include <stdio.h>

int main() {
    int a = 2 + 3 * 4;
    int b = (2 + 3) * 4;
    printf("a = %d\\n", a);
    printf("b = %d\\n", b);
    return 0;
}`,
        "a = 14\nb = 20",
        {
          objectives: ["Apply precedence rules", "Use parentheses for clarity"],
          explanation:
            "Multiplication binds tighter than addition, so a is 14. Parentheses force the addition first, giving 20.",
          tips: ["When in doubt, add parentheses - readability beats cleverness."],
          mistakes: ["Assuming left-to-right evaluation overrides precedence."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-calculator",
        "Four Operations",
        "easy",
        "Read two integers and print their sum, difference, product and quotient, each on its own line.",
        `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    // Print the four results
    
    return 0;
}
`,
        "15\n5\n50\n2",
        ["Use +, -, *, /.", "Print each result on its own line."],
        "Integer division is fine here because the inputs divide evenly.",
        "10 5\n",
      ),
      P(
        "c-prob-even-odd",
        "Even or Odd",
        "easy",
        "Read an integer and print Even if it is divisible by 2, otherwise Odd.",
        `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    // Print Even or Odd
    
    return 0;
}
`,
        "Even",
        ["Use the remainder operator %.", "Check n % 2 == 0."],
        "A number is even when dividing by 2 leaves remainder 0.",
        "8\n",
      ),
    ],
  },
  {
    id: "c-conditions",
    title: "C Conditions",
    difficulty: "beginner",
    section: "C Conditions",
    lessons: [
      L(
        "c-if",
        "The if Statement",
        "An if statement runs a block only when its condition is true. The condition is any expression; zero is false and every non-zero value is true.",
        "if (condition) {\n    statements;\n}",
        `#include <stdio.h>

int main() {
    int n = 10;
    if (n > 0) {
        printf("positive\\n");
    }
    return 0;
}`,
        "positive",
        {
          objectives: ["Write an if statement", "Evaluate a condition"],
          explanation:
            "n > 0 is true, so the printf inside the braces runs.",
          tips: ["Always use braces, even for a single statement - it prevents bugs when adding lines."],
          mistakes: ["Putting a semicolon after if (condition), which makes the if body empty."],
        },
      ),
      L(
        "c-if-else",
        "if...else",
        "if...else runs one block when the condition is true and another when it is false. Exactly one of the two branches runs.",
        "if (condition) {\n    statements;\n} else {\n    statements;\n}",
        `#include <stdio.h>

int main() {
    int n = 7;
    if (n % 2 == 0) {
        printf("even\\n");
    } else {
        printf("odd\\n");
    }
    return 0;
}`,
        "odd",
        {
          objectives: ["Use two-way branching", "Combine conditions with %"],
          explanation:
            "7 % 2 is 1, so the condition is false and the else branch prints odd.",
          tips: ["Keep conditions positive and easy to read."],
          mistakes: ["Writing elseif instead of else if."],
        },
      ),
      L(
        "c-else-if",
        "else if Chains",
        "An else if chain tests conditions in order and runs the first matching branch. Once a branch runs, the rest are skipped. Always include a final else for the remaining cases.",
        "if (c1) { ... }\nelse if (c2) { ... }\nelse { ... }",
        `#include <stdio.h>

int main() {
    int score = 85;
    if (score >= 90) {
        printf("Grade A\\n");
    } else if (score >= 80) {
        printf("Grade B\\n");
    } else if (score >= 70) {
        printf("Grade C\\n");
    } else {
        printf("Grade F\\n");
    }
    return 0;
}`,
        "Grade B",
        {
          objectives: ["Build a multi-way decision", "Order conditions correctly"],
          explanation:
            "85 fails the first test but passes >= 80, so Grade B prints and later branches are skipped.",
          tips: ["Order conditions from most specific to most general."],
          mistakes: ["Testing score >= 80 before >= 90, which lets every high score fall into the lower branch."],
        },
      ),
      L(
        "c-nested-if",
        "Nested if Statements",
        "An if can contain another if. Only the inner condition is checked when the outer one is true. Deep nesting is hard to read, so prefer combining conditions with && when possible.",
        "if (outer) {\n    if (inner) { ... }\n}",
        `#include <stdio.h>

int main() {
    int a = 10, b = 25;
    if (a > 0) {
        if (b > a) {
            printf("b is greater than a\\n");
        }
    }
    return 0;
}`,
        "b is greater than a",
        {
          objectives: ["Nest conditions", "Simplify nested ifs"],
          explanation:
            "Both conditions are true, so the message prints. The same logic could be written as if (a > 0 && b > a).",
          tips: ["Add braces to every block to avoid the dangling-else trap."],
          mistakes: ["Forgetting braces so an else binds to the wrong if."],
        },
      ),
      L(
        "c-switch",
        "The switch Statement",
        "switch selects among several constant cases based on one integer or character expression. Each case should end with break; otherwise execution falls through into the next case. default handles unmatched values.",
        "switch (value) {\n    case 1: ...; break;\n    default: ...; break;\n}",
        `#include <stdio.h>

int main() {
    int day = 3;
    switch (day) {
        case 1: printf("Monday\\n"); break;
        case 2: printf("Tuesday\\n"); break;
        case 3: printf("Wednesday\\n"); break;
        default: printf("Other day\\n"); break;
    }
    return 0;
}`,
        "Wednesday",
        {
          objectives: ["Use switch for multiple choices", "Explain fallthrough"],
          explanation:
            "day is 3, so case 3 runs and break exits the switch.",
          tips: ["Use switch when comparing one value against many constants."],
          mistakes: ["Omitting break, which causes unintended fallthrough."],
        },
      ),
      L(
        "c-conditional-logic",
        "Combining Conditions",
        "Real decisions often need more than one test. Use && when all conditions must hold, || when any one is enough, and ! to reverse a test. Parentheses make the grouping explicit.",
        "if (temp > 25 && temp < 40) ...\nif (age < 13 || age > 65) ...",
        `#include <stdio.h>

int main() {
    int temp = 30;
    if (temp > 25 && temp < 40) {
        printf("Hot day\\n");
    }
    int age = 70;
    if (age < 13 || age > 65) {
        printf("Discounted ticket\\n");
    }
    return 0;
}`,
        "Hot day\nDiscounted ticket",
        {
          objectives: ["Combine conditions", "Group with parentheses"],
          explanation:
            "The first test needs both bounds to hold. The second needs only one alternative to hold.",
          tips: ["Name complex conditions in a comment or a separate boolean variable."],
          mistakes: ["Writing 25 < temp < 40, which C evaluates as (25 < temp) < 40 and is almost always true."],
        },
      ),
      L(
        "c-condition-practice",
        "Worked Example: Leap Year",
        "A year is a leap year when it is divisible by 4 and not by 100, or when it is divisible by 400. This combines &&, || and != in one readable condition.",
        "if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)",
        `#include <stdio.h>

int main() {
    int year = 2024;
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        printf("Leap year\\n");
    } else {
        printf("Not a leap year\\n");
    }
    return 0;
}`,
        "Leap year",
        {
          objectives: ["Translate a rule into a condition", "Use parentheses with && and ||"],
          explanation:
            "2024 is divisible by 4 and not by 100, so the first group is true and the whole condition is true.",
          tips: ["Test boundary years such as 1900 and 2000 when verifying this logic."],
          mistakes: ["Checking divisibility by 4 only, which wrongly accepts 1900."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-largest",
        "Largest of Three",
        "medium",
        "Read three integers and print the largest one.",
        `#include <stdio.h>

int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    // Print the largest
    
    return 0;
}
`,
        "30",
        ["Start by assuming a is the maximum.", "Compare with b, then c."],
        "Use if statements to update the current maximum.",
        "10 30 20\n",
      ),
      P(
        "c-prob-grade",
        "Grade Calculator",
        "medium",
        "Read a score and print A for 90+, B for 80+, C for 70+, D for 60+, otherwise F.",
        `#include <stdio.h>

int main() {
    int score;
    scanf("%d", &score);
    // Print the grade
    
    return 0;
}
`,
        "B",
        ["Use an if / else if chain.", "Test the highest bracket first."],
        "Order matters in an else if chain; test >= 90 before >= 80.",
        "85\n",
      ),
    ],
  },
  {
    id: "c-loops",
    title: "C Loops",
    difficulty: "beginner",
    section: "C Loops",
    lessons: [
      L(
        "c-while",
        "The while Loop",
        "while repeats a block as long as its condition is true. The condition is checked before each iteration, so the body may run zero times. Make sure something inside the loop moves it toward termination.",
        "while (condition) {\n    statements;\n}",
        `#include <stdio.h>

int main() {
    int i = 1;
    while (i <= 5) {
        printf("%d ", i);
        i++;
    }
    printf("\\n");
    return 0;
}`,
        "1 2 3 4 5",
        {
          objectives: ["Write a while loop", "Avoid infinite loops"],
          explanation:
            "i starts at 1 and increments each pass until the condition i <= 5 becomes false.",
          tips: ["Initialise the counter before the loop and update it inside."],
          mistakes: ["Forgetting i++ - the condition never becomes false."],
        },
      ),
      L(
        "c-do-while",
        "The do...while Loop",
        "do...while runs the body first and checks the condition afterwards, so the body always executes at least once. It is useful for menus and validation loops.",
        "do {\n    statements;\n} while (condition);",
        `#include <stdio.h>

int main() {
    int i = 1;
    do {
        printf("%d ", i);
        i++;
    } while (i <= 5);
    printf("\\n");
    return 0;
}`,
        "1 2 3 4 5",
        {
          objectives: ["Use do...while", "Know when the body must run once"],
          explanation:
            "The body prints before the first test, which is the defining difference from a while loop.",
          tips: ["Remember the semicolon after while (condition);"],
          mistakes: ["Leaving out the trailing semicolon."],
        },
      ),
      L(
        "c-for",
        "The for Loop",
        "for packages initialisation, condition and update in one line. It is the best choice when the number of iterations is known. C99 lets you declare the counter inside the for statement.",
        "for (initialise; condition; update) {\n    statements;\n}",
        `#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`,
        "1 2 3 4 5",
        {
          objectives: ["Write a for loop", "Choose the right loop form"],
          explanation:
            "i is created, tested and incremented by the loop header alone, keeping the loop compact.",
          tips: ["Use for when you know how many times to repeat."],
          mistakes: ["Using a comma instead of a semicolon between the three parts."],
        },
      ),
      L(
        "c-nested-loops",
        "Nested Loops",
        "A loop inside another loop runs the inner loop completely for each outer iteration. Nested loops are used for tables, grids and combinations. Total iterations multiply, so keep them small.",
        "for (i...) {\n    for (j...) { ... }\n}",
        `#include <stdio.h>

int main() {
    for (int i = 1; i <= 3; i++) {
        for (int j = 1; j <= 2; j++) {
            printf("%d%d ", i, j);
        }
    }
    printf("\\n");
    return 0;
}`,
        "11 12 21 22 31 32",
        {
          objectives: ["Write nested loops", "Predict iteration order"],
          explanation:
            "For each value of i, j runs from 1 to 2. The inner loop finishes before i advances.",
          tips: ["Use different counter names for each level, such as i and j."],
          mistakes: ["Reusing i in the inner loop, which corrupts the outer counter."],
        },
      ),
      L(
        "c-break",
        "The break Statement",
        "break exits the innermost loop or switch immediately. Any remaining iterations are skipped. It is commonly used to stop searching once a value is found.",
        "if (found) break;",
        `#include <stdio.h>

int main() {
    for (int i = 1; i <= 10; i++) {
        if (i == 4) break;
        printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`,
        "1 2 3",
        {
          objectives: ["Exit a loop early", "Use break in a search"],
          explanation:
            "When i reaches 4 the break ends the loop before printing 4.",
          tips: ["In nested loops break only exits the loop that contains it."],
          mistakes: ["Expecting break to exit all enclosing loops."],
        },
      ),
      L(
        "c-continue",
        "The continue Statement",
        "continue skips the rest of the current iteration and jumps to the next test or update. The loop itself keeps running, unlike break.",
        "if (skip) continue;",
        `#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        if (i % 2 == 0) continue;
        printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`,
        "1 3 5",
        {
          objectives: ["Skip an iteration", "Compare continue and break"],
          explanation:
            "Even numbers hit continue, so only odd numbers reach printf.",
          tips: ["In a while loop, update the counter before continue or you may loop forever."],
          mistakes: ["Using continue when you actually need to stop the loop."],
        },
      ),
      L(
        "c-infinite-loops",
        "Infinite Loops and Controlled Exit",
        "A loop whose condition never becomes false runs forever. Sometimes that is intentional, such as a server loop, and is stopped with break. In this sandbox, infinite loops are terminated by a timeout.",
        "while (1) {\n    if (done) break;\n}",
        `#include <stdio.h>

int main() {
    int i = 0;
    while (1) {
        if (i >= 3) break;
        printf("tick %d\\n", i);
        i++;
    }
    printf("done\\n");
    return 0;
}`,
        "tick 0\ntick 1\ntick 2\ndone",
        {
          objectives: ["Recognise infinite loops", "Exit with break"],
          explanation:
            "while (1) is always true, so the explicit break is what ends the loop after three ticks.",
          tips: ["Always give an intentional infinite loop a clear exit condition."],
          mistakes: ["Writing a condition that never changes inside the loop."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-sum-n",
        "Sum 1 to N",
        "easy",
        "Read n and print the sum of all integers from 1 to n.",
        `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    // Sum from 1 to n
    
    return 0;
}
`,
        "15",
        ["Initialise sum to 0.", "Loop from 1 to n and add each value."],
        "A for loop with sum += i accumulates the total.",
        "5\n",
      ),
      P(
        "c-prob-table",
        "Multiplication Table",
        "medium",
        "Read n and print its multiplication table from 1 to 5, one equation per line in the form n x i = result.",
        `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    // Print the table
    
    return 0;
}
`,
        "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15",
        ["Loop i from 1 to 5.", "printf(\"%d x %d = %d\\n\", n, i, n * i);"],
        "The loop variable supplies both the multiplier and the displayed number.",
        "3\n",
      ),
    ],
  },
];
