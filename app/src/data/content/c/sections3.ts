import type { Topic } from "../../../types";
import { L, P } from "./helpers";

export const sections3: Topic[] = [
  {
    id: "c-functions",
    title: "C Functions",
    difficulty: "intermediate",
    section: "C Functions",
    lessons: [
      L(
        "c-functions-intro",
        "Introduction to Functions",
        "A function is a named block of code that performs one task. Functions make programs shorter, reusable and easier to test. Every C program already uses at least one function: main.",
        "return_type name(parameters) {\n    statements;\n    return value;\n}",
        `#include <stdio.h>

void greet(void) {
    printf("Hello from a function\\n");
}

int main() {
    greet();
    return 0;
}`,
        "Hello from a function",
        {
          objectives: ["Define and call a function", "Explain why functions help"],
          explanation:
            "greet is defined before main and called once. It takes no parameters and returns nothing, so its type is void.",
          tips: ["Give each function a single clear responsibility."],
          mistakes: ["Calling a function before it is declared without a prototype."],
        },
      ),
      L(
        "c-function-declaration",
        "Declarations and Definitions",
        "A declaration (prototype) tells the compiler a function's name, return type and parameters. A definition supplies the body. Declaring prototypes at the top lets you define functions later or in another file.",
        "int add(int a, int b);   /* declaration */\nint add(int a, int b) { return a + b; } /* definition */",
        `#include <stdio.h>

int add(int a, int b);

int main() {
    printf("%d\\n", add(2, 3));
    return 0;
}

int add(int a, int b) {
    return a + b;
}`,
        "5",
        {
          objectives: ["Write a function prototype", "Separate declaration from definition"],
          explanation:
            "The prototype before main lets the compiler check the call even though the body appears later.",
          tips: ["Keep prototypes in a header file when sharing functions across files."],
          mistakes: ["Letting the prototype parameter types disagree with the definition."],
        },
      ),
      L(
        "c-parameters-return",
        "Parameters and Return Values",
        "Parameters are the values a function receives. Arguments are the values you pass at the call site. The return statement sends one value back to the caller, and its type must match the function's return type.",
        "int square(int n) { return n * n; }",
        `#include <stdio.h>

int square(int n) {
    return n * n;
}

int main() {
    int result = square(7);
    printf("%d\\n", result);
    return 0;
}`,
        "49",
        {
          objectives: ["Pass arguments", "Return a result"],
          explanation:
            "The argument 7 is copied into n, and the function returns 49 to the caller.",
          tips: ["Return early for error cases to keep functions flat."],
          mistakes: ["Forgetting the return statement in a non-void function."],
        },
      ),
      L(
        "c-void-functions",
        "Void Functions",
        "A void function performs an action but returns no value. It is used for printing, drawing, updating output parameters and other side effects. You cannot use a void call in an arithmetic expression.",
        "void print_line(int n) {\n    for (int i = 0; i < n; i++) putchar('-');\n    putchar('\\n');\n}",
        `#include <stdio.h>

void print_line(int n) {
    for (int i = 0; i < n; i++) {
        putchar('-');
    }
    putchar('\\n');
}

int main() {
    print_line(5);
    return 0;
}`,
        "-----",
        {
          objectives: ["Write a void function", "Use side effects"],
          explanation:
            "print_line returns nothing but writes five dashes and a newline to standard output.",
          tips: ["Use void when the purpose is an action, not a computed value."],
          mistakes: ["Trying to assign the result of a void function to a variable."],
        },
      ),
      L(
        "c-call-by-value",
        "Call by Value",
        "C passes arguments by value: the function receives copies. Changing a parameter inside the function does not affect the caller's variable. To let a function modify the caller's data, pass a pointer instead.",
        "void change(int x) { x = 99; }   /* caller unaffected */",
        `#include <stdio.h>

void change(int x) {
    x = 99;
    printf("inside: %d\\n", x);
}

int main() {
    int a = 5;
    change(a);
    printf("outside: %d\\n", a);
    return 0;
}`,
        "inside: 99\noutside: 5",
        {
          objectives: ["Explain call by value", "Know when to use pointers"],
          explanation:
            "change receives a copy of a. Assigning to x only changes the copy, so a stays 5.",
          tips: ["Pass pointers when a function must update the caller's variables."],
          mistakes: ["Expecting a function to modify its argument without a pointer."],
        },
      ),
      L(
        "c-recursion",
        "Recursion",
        "A recursive function calls itself on a smaller input. Every recursion needs a base case that stops the calls, otherwise it runs until the stack overflows. Factorial and tree traversal are classic examples.",
        "int fact(int n) {\n    if (n <= 1) return 1;      /* base case */\n    return n * fact(n - 1);    /* recursive case */\n}",
        `#include <stdio.h>

int fact(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * fact(n - 1);
}

int main() {
    printf("%d\\n", fact(5));
    return 0;
}`,
        "120",
        {
          objectives: ["Write a recursive function", "Identify the base case"],
          explanation:
            "fact(5) expands to 5 * 4 * 3 * 2 * 1. The base case at n <= 1 stops the chain.",
          tips: ["Trace small inputs on paper to verify the base case."],
          mistakes: ["Omitting the base case, which causes infinite recursion."],
        },
      ),
      L(
        "c-static-scope",
        "Static Variables and Storage Duration",
        "A local variable normally lives only during one function call. Marking it static gives it a lifetime for the whole program while keeping its name local. The initialiser runs only once.",
        "void counter(void) {\n    static int n = 0;\n    n++;\n}",
        `#include <stdio.h>

void counter(void) {
    static int n = 0;
    n++;
    printf("%d\\n", n);
}

int main() {
    counter();
    counter();
    counter();
    return 0;
}`,
        "1\n2\n3",
        {
          objectives: ["Use static locals", "Explain storage duration"],
          explanation:
            "n is created once and keeps its value between calls, so it increments across all three calls.",
          tips: ["Use static for counters and caches that must persist between calls."],
          mistakes: ["Assuming static means the variable is global - its name is still local."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-max-fn",
        "Maximum Function",
        "medium",
        "Write a function max that returns the larger of two integers. Read two integers, call it and print the result.",
        `#include <stdio.h>

int max(int a, int b) {
    // Return the larger value
    return 0;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\\n", max(a, b));
    return 0;
}
`,
        "9",
        ["Use an if statement or the ternary operator.", "return a > b ? a : b;"],
        "A function returns a value with return; the caller prints it.",
        "4 9\n",
      ),
      P(
        "c-prob-fib",
        "Fibonacci Function",
        "hard",
        "Write a recursive function fib(n) that returns the nth Fibonacci number with fib(0)=0 and fib(1)=1. Print fib(10).",
        `#include <stdio.h>

int fib(int n) {
    // Base cases and recursion
    return 0;
}

int main() {
    printf("%d\\n", fib(10));
    return 0;
}
`,
        "55",
        ["Base cases: n == 0 returns 0, n == 1 returns 1.", "Otherwise return fib(n-1) + fib(n-2)."],
        "Each value is the sum of the two before it: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55.",
      ),
    ],
  },
  {
    id: "c-arrays",
    title: "C Arrays",
    difficulty: "intermediate",
    section: "C Arrays",
    lessons: [
      L(
        "c-arrays-intro",
        "Introduction to Arrays",
        "An array stores a fixed number of values of the same type in contiguous memory. Elements are accessed by index, starting at 0. The last valid index is size - 1.",
        "type name[size];\nname[0]  /* first */\nname[size - 1]  /* last */",
        `#include <stdio.h>

int main() {
    int values[5] = {1, 2, 3, 4, 5};
    printf("first: %d\\n", values[0]);
    printf("last: %d\\n", values[4]);
    return 0;
}`,
        "first: 1\nlast: 5",
        {
          objectives: ["Declare an array", "Access elements by index"],
          explanation:
            "values holds five integers. Index 0 is the first element and index 4 is the fifth.",
          tips: ["Array indices start at 0, not 1."],
          mistakes: ["Reading values[5] in a five-element array - that is out of bounds."],
        },
      ),
      L(
        "c-array-init",
        "Initialising Arrays",
        "You can initialise an array with a brace list. Missing values are set to zero. If you omit the size, C counts the initialisers. You cannot assign a new brace list to an existing array.",
        "int a[5] = {10, 20};     /* 10 20 0 0 0 */\nint b[] = {1, 2, 3};     /* size 3 */",
        `#include <stdio.h>

int main() {
    int a[5] = {10, 20};
    for (int i = 0; i < 5; i++) {
        printf("%d ", a[i]);
    }
    printf("\\n");
    return 0;
}`,
        "10 20 0 0 0",
        {
          objectives: ["Initialise arrays", "Predict default values"],
          explanation:
            "The first two elements receive 10 and 20; the remaining three are zero-initialised.",
          tips: ["Use {0} to zero every element of an array."],
          mistakes: ["Assuming uninitialised local arrays start at zero - they do not unless partially initialised like this."],
        },
      ),
      L(
        "c-array-loop",
        "Arrays and Loops",
        "Loops and arrays work together: use the loop counter as the index to visit every element. Compute the length with sizeof(array) / sizeof(array[0]) so the loop adapts when the size changes.",
        "for (int i = 0; i < n; i++) { sum += a[i]; }",
        `#include <stdio.h>

int main() {
    int a[4] = {2, 4, 6, 8};
    int sum = 0;
    int n = (int) (sizeof(a) / sizeof(a[0]));
    for (int i = 0; i < n; i++) {
        sum += a[i];
    }
    printf("sum = %d\\n", sum);
    return 0;
}`,
        "sum = 20",
        {
          objectives: ["Traverse an array", "Compute its length safely"],
          explanation:
            "sizeof(a) is the total bytes and sizeof(a[0]) is one element, so their ratio is the element count.",
          tips: ["Compute the length once before the loop."],
          mistakes: ["Hard-coding the length and forgetting to update it."],
        },
      ),
      L(
        "c-2d-arrays",
        "Two-Dimensional Arrays",
        "A two-dimensional array is an array of arrays, often used for grids and matrices. The first index selects a row and the second selects a column. Memory is still contiguous.",
        "int grid[rows][cols];\ngrid[r][c] = value;",
        `#include <stdio.h>

int main() {
    int m[2][3] = {
        {1, 2, 3},
        {4, 5, 6}
    };
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 3; j++) {
            printf("%d ", m[i][j]);
        }
        printf("\\n");
    }
    return 0;
}`,
        "1 2 3\n4 5 6",
        {
          objectives: ["Declare a 2D array", "Traverse it with nested loops"],
          explanation:
            "The outer loop walks rows and the inner loop walks columns, so each row prints on its own line.",
          tips: ["Use rows and columns names instead of i and j for clarity in larger programs."],
          mistakes: ["Swapping the row and column indices, which reads the wrong element."],
        },
      ),
      L(
        "c-array-function",
        "Passing Arrays to Functions",
        "When you pass an array to a function it decays to a pointer to its first element, so the function does not know the length. Pass the length as a separate parameter. Changes made through the pointer affect the original array.",
        "int sum(int a[], int n);",
        `#include <stdio.h>

int sum(int a[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += a[i];
    }
    return total;
}

int main() {
    int a[4] = {1, 2, 3, 4};
    printf("%d\\n", sum(a, 4));
    return 0;
}`,
        "10",
        {
          objectives: ["Pass an array with its length", "Understand array decay"],
          explanation:
            "sum receives a pointer to the first element plus the count 4, which is enough to read every element.",
          tips: ["Always pass the length to avoid reading past the end."],
          mistakes: ["Using sizeof inside the function to find the length - it returns the pointer size."],
        },
      ),
      L(
        "c-array-bounds",
        "Bounds and Safe Indexing",
        "C does not check array bounds. Reading or writing outside the valid range is undefined behaviour: it may appear to work, corrupt other data or crash. Keep every index in the range 0 to size - 1.",
        "valid: 0 <= i && i < size",
        `#include <stdio.h>

int main() {
    int a[3] = {1, 2, 3};
    int n = (int) (sizeof(a) / sizeof(a[0]));
    printf("size: %d\\n", n);
    printf("last: %d\\n", a[n - 1]);
    return 0;
}`,
        "size: 3\nlast: 3",
        {
          objectives: ["Avoid out-of-bounds access", "Use size - 1 for the last element"],
          explanation:
            "The last valid index is n - 1. Accessing a[n] would be one past the end and is not allowed.",
          tips: ["Validate indices that come from user input."],
          mistakes: ["Looping with i <= n, which touches one element past the end."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-array-sum",
        "Sum an Array",
        "medium",
        "Read n, then n integers, and print their sum.",
        `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int a[100];
    // Read n values, then print their sum
    
    return 0;
}
`,
        "15",
        ["Loop i from 0 to n-1.", "scanf into &a[i], then add a[i] to a sum."],
        "The accumulator starts at 0 and gains one element per iteration.",
        "5\n1 2 3 4 5\n",
      ),
      P(
        "c-prob-reverse",
        "Reverse an Array",
        "medium",
        "Read n, then n integers, and print them in reverse order separated by spaces.",
        `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int a[100];
    // Read and print in reverse
    
    return 0;
}
`,
        "5 4 3 2 1",
        ["Store the values first.", "Loop from n-1 down to 0."],
        "Reverse traversal starts at the last index and decrements to 0.",
        "5\n1 2 3 4 5\n",
      ),
    ],
  },
  {
    id: "c-strings",
    title: "C Strings",
    difficulty: "intermediate",
    section: "C Strings",
    lessons: [
      L(
        "c-strings-intro",
        "Strings are Character Arrays",
        "C has no built-in string type. A string is a char array ending with the null character '\\0'. String literals such as \"Hello\" are stored with an automatic terminator, so a five-letter string needs six bytes.",
        "char name[] = \"Hello\";   /* H e l l o \\0 */",
        `#include <stdio.h>
#include <string.h>

int main() {
    char name[] = "Hello";
    printf("%s\\n", name);
    printf("length: %zu\\n", strlen(name));
    return 0;
}`,
        "Hello\nlength: 5",
        {
          objectives: ["Explain null termination", "Find a string's length"],
          explanation:
            "strlen counts characters until it reaches '\\0', so it reports 5 even though the array holds 6 bytes.",
          tips: ["Reserve one extra byte for the terminator."],
          mistakes: ["Using strlen on a char array that is not null-terminated."],
        },
      ),
      L(
        "c-string-input",
        "Reading Strings Safely",
        "scanf %s stops at whitespace and has no bound, so it can overflow a buffer. Use a width such as %19s for a 20-byte array, or use fgets, which reads a whole line and lets you specify the size.",
        "scanf(\"%19s\", buf);\nfgets(buf, sizeof buf, stdin);",
        `#include <stdio.h>

int main() {
    char name[20];
    printf("Name: ");
    fgets(name, sizeof name, stdin);
    printf("Hi %s", name);
    return 0;
}`,
        "Name: Hi Sam",
        {
          objectives: ["Read a line safely", "Limit input width"],
          explanation:
            "fgets reads at most sizeof name - 1 characters plus the terminator, so the array cannot overflow.",
          tips: ["Replace a trailing newline with '\\0' if you do not want it in the string."],
          mistakes: ["Using gets, which has no bounds check."],
          exampleStdin: "Sam\n",
        },
      ),
      L(
        "c-string-functions",
        "The string.h Library",
        "string.h provides strlen, strcpy, strncpy, strcat, strncat, strcmp and strncmp. The 'n' versions limit how many characters are copied or compared, which helps prevent overflow.",
        "strlen(s)   strcpy(dst, src)   strcat(dst, src)   strcmp(a, b)",
        `#include <stdio.h>
#include <string.h>

int main() {
    char a[20] = "Hello";
    char b[20];
    strcpy(b, a);
    strcat(b, " C");
    printf("%s\\n", b);
    printf("compare: %d\\n", strcmp(a, "Hello"));
    return 0;
}`,
        "Hello C\ncompare: 0",
        {
          objectives: ["Use common string functions", "Interpret strcmp's result"],
          explanation:
            "strcpy copies Hello into b, then strcat appends \" C\". strcmp returns 0 when both strings are equal.",
          tips: ["Prefer strncpy and strncat when sizes are uncertain."],
          mistakes: ["Assuming strcmp returns only 0 or 1 - it returns a signed difference."],
        },
      ),
      L(
        "c-string-iterate",
        "Iterating Over a String",
        "Because a string is an array, you can walk it with an index or a pointer until you reach '\\0'. This is how many string algorithms are written by hand.",
        "for (int i = 0; s[i] != '\\0'; i++) { ... }",
        `#include <stdio.h>

int main() {
    char word[] = "Code";
    for (int i = 0; word[i] != '\\0'; i++) {
        printf("%c\\n", word[i]);
    }
    return 0;
}`,
        "C\no\nd\ne",
        {
          objectives: ["Traverse a string", "Use the null terminator as a sentinel"],
          explanation:
            "The loop stops when it reaches '\\0', so it prints exactly the four visible characters.",
          tips: ["Use size_t for indices when comparing with strlen's result."],
          mistakes: ["Looping to a hard-coded length larger than the actual string."],
        },
      ),
      L(
        "c-string-safety",
        "Buffer Safety and snprintf",
        "Copying strings into fixed buffers is a common source of bugs. snprintf writes at most size - 1 characters and always terminates the result, so it is the safest way to build a string in a fixed buffer.",
        "snprintf(buf, sizeof buf, \"format\", ...);",
        `#include <stdio.h>
#include <string.h>

int main() {
    char buf[8];
    snprintf(buf, sizeof buf, "%s", "CodeLab");
    printf("%s\\n", buf);
    printf("bytes used: %zu\\n", strlen(buf));
    return 0;
}`,
        "CodeLab\nbytes used: 7",
        {
          objectives: ["Build strings safely", "Respect buffer sizes"],
          explanation:
            "The buffer holds 7 characters plus the terminator, exactly filling its 8 bytes.",
          tips: ["Check snprintf's return value to detect truncation."],
          mistakes: ["Using sprintf with an unbounded source string."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-strlen",
        "String Length",
        "easy",
        "Read one word and print its length.",
        `#include <stdio.h>
#include <string.h>

int main() {
    char word[100];
    scanf("%99s", word);
    // Print the length
    
    return 0;
}
`,
        "5",
        ["Include string.h.", "Use strlen with %zu."],
        "strlen stops counting at the null terminator.",
        "hello\n",
      ),
      P(
        "c-prob-reverse-str",
        "Reverse a Word",
        "medium",
        "Read one word and print it reversed.",
        `#include <stdio.h>
#include <string.h>

int main() {
    char word[100];
    scanf("%99s", word);
    // Print the word backwards
    
    return 0;
}
`,
        "olleh",
        ["Find the length with strlen.", "Loop from length-1 down to 0 and print each character."],
        "Reverse traversal prints the last character first.",
        "hello\n",
      ),
    ],
  },
  {
    id: "c-pointers",
    title: "C Pointers",
    difficulty: "intermediate",
    section: "C Pointers",
    lessons: [
      L(
        "c-pointers-intro",
        "Introduction to Pointers",
        "A pointer is a variable that stores a memory address. The & operator takes an address, and the * operator dereferences a pointer to read or write the value at that address. Pointers let functions modify caller data and let you build dynamic data structures.",
        "int x = 42;\nint *p = &x;   /* p holds the address of x */\nprintf(\"%d\", *p);  /* 42 */",
        `#include <stdio.h>

int main() {
    int x = 42;
    int *p = &x;
    printf("x = %d\\n", x);
    printf("*p = %d\\n", *p);
    printf("same value: %d\\n", x == *p);
    return 0;
}`,
        "x = 42\n*p = 42\nsame value: 1",
        {
          objectives: ["Declare a pointer", "Use & and *"],
          explanation:
            "p stores the address of x. Dereferencing p with *p reads the value stored there, which is 42.",
          tips: ["Read int *p as 'p is a pointer to int'."],
          mistakes: ["Declaring a pointer and dereferencing it before it points anywhere."],
        },
      ),
      L(
        "c-pointer-syntax",
        "Modifying Values Through Pointers",
        "Writing through a dereferenced pointer changes the original variable. This is how functions can return more than one result or update an existing value.",
        "*p = new_value;",
        `#include <stdio.h>

int main() {
    int x = 10;
    int *p = &x;
    *p = 20;
    printf("x = %d\\n", x);
    return 0;
}`,
        "x = 20",
        {
          objectives: ["Write through a pointer", "See the link to the original variable"],
          explanation:
            "p points at x, so *p = 20 stores 20 directly into x.",
          tips: ["Initialise pointers before dereferencing them."],
          mistakes: ["Forgetting the * and assigning to the pointer itself instead."],
        },
      ),
      L(
        "c-pointer-arithmetic",
        "Pointer Arithmetic",
        "Adding 1 to a pointer moves it to the next element of its type, not the next byte. This makes pointers and arrays interchangeable in many expressions: *(p + i) is the same element as p[i].",
        "p + 1   /* next element */\n*(p + i) == p[i]",
        `#include <stdio.h>

int main() {
    int a[3] = {10, 20, 30};
    int *p = a;
    printf("%d\\n", *p);
    printf("%d\\n", *(p + 1));
    printf("%d\\n", *(p + 2));
    return 0;
}`,
        "10\n20\n30",
        {
          objectives: ["Use pointer arithmetic", "Relate pointers to arrays"],
          explanation:
            "An array name decays to a pointer to its first element, so p points at a[0]. p + 1 points at a[1].",
          tips: ["Pointer arithmetic is only valid within one array (or one past the end)."],
          mistakes: ["Assuming p + 1 advances one byte rather than one element."],
        },
      ),
      L(
        "c-pointers-arrays",
        "Pointers and Arrays",
        "Array indexing is defined in terms of pointer arithmetic: a[i] means *(a + i). You can iterate with a pointer, and passing an array to a function passes a pointer to its first element.",
        "a[i] == *(a + i)\np[i] == *(p + i)",
        `#include <stdio.h>

int main() {
    int a[3] = {1, 2, 3};
    int *p = a;
    printf("%d %d\\n", a[1], p[1]);
    printf("%d\\n", *(a + 2));
    return 0;
}`,
        "2 2\n3",
        {
          objectives: ["Use both syntaxes", "Explain array decay"],
          explanation:
            "a[1] and p[1] both reach the second element, and *(a + 2) reaches the third.",
          tips: ["Prefer array indexing when it is clearer."],
          mistakes: ["Using sizeof on a pointer and expecting the array's size."],
        },
      ),
      L(
        "c-pass-by-reference",
        "Pass by Reference with Pointers",
        "Passing a pointer lets a function modify the caller's variable. This is how swap works: the function receives addresses and writes through them.",
        "void swap(int *a, int *b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}",
        `#include <stdio.h>

void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int main() {
    int x = 1, y = 2;
    swap(&x, &y);
    printf("%d %d\\n", x, y);
    return 0;
}`,
        "2 1",
        {
          objectives: ["Modify caller variables", "Implement swap"],
          explanation:
            "swap receives the addresses of x and y, so writing through a and b updates the originals.",
          tips: ["Check pointers for NULL before dereferencing them in library code."],
          mistakes: ["Calling swap(x, y) instead of swap(&x, &y)."],
        },
      ),
      L(
        "c-null-pointer",
        "NULL Pointers",
        "A pointer that does not point to anything should be set to NULL. Dereferencing NULL is a runtime error. Test a pointer against NULL before using it, especially after allocation or when a search finds nothing.",
        "int *p = NULL;\nif (p != NULL) { /* safe to use */ }",
        `#include <stdio.h>

int main() {
    int *p = NULL;
    if (p == NULL) {
        printf("p is NULL\\n");
    }
    int x = 5;
    p = &x;
    if (p != NULL) {
        printf("p now points to %d\\n", *p);
    }
    return 0;
}`,
        "p is NULL\np now points to 5",
        {
          objectives: ["Use NULL safely", "Guard against invalid pointers"],
          explanation:
            "The first check confirms p is empty. After assigning &x, the second check allows safe dereferencing.",
          tips: ["Set a pointer to NULL after freeing it to avoid a dangling pointer."],
          mistakes: ["Dereferencing a pointer without checking whether it is NULL."],
        },
      ),
    ],
    problems: [
      P(
        "c-prob-swap-ptr",
        "Swap with Pointers",
        "medium",
        "Complete the swap function so that the printed values are exchanged.",
        `#include <stdio.h>

void swap(int *a, int *b) {
    // Swap the values pointed to by a and b
}

int main() {
    int x, y;
    scanf("%d %d", &x, &y);
    swap(&x, &y);
    printf("%d %d\\n", x, y);
    return 0;
}
`,
        "9 4",
        ["Use a temporary int.", "Dereference with *a and *b."],
        "Pointers let the function write to the caller's variables.",
        "4 9\n",
      ),
      P(
        "c-prob-sum-ptr",
        "Sum Through a Pointer",
        "medium",
        "Complete add_to that adds value to the integer pointed to by p. Print the updated value.",
        `#include <stdio.h>

void add_to(int *p, int value) {
    // Add value to *p
}

int main() {
    int n;
    scanf("%d", &n);
    add_to(&n, 5);
    printf("%d\\n", n);
    return 0;
}
`,
        "15",
        ["Write *p = *p + value;", "No return value is needed."],
        "The function modifies n through its address.",
        "10\n",
      ),
    ],
  },
];
