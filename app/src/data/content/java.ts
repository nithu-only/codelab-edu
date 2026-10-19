import type { LearningPath } from "../../types";

export const javaPath: LearningPath = {
  language: "java",
  label: "Java",
  blurb:
    "Strongly-typed object orientation: primitives, control flow, methods, arrays, strings and classes from the ground up.",
  topics: [
    {
      id: "variables",
      title: "Variables & Data Types",
      difficulty: "beginner",
      lessons: [
        {
          id: "java-var",
          title: "Primitives and references",
          concept:
            "Java is strongly typed: every variable has a declared type. Primitives: int, double, float, long, boolean, char. Reference types: String, arrays, classes. A String literal uses double quotes; a char uses single quotes. Local variables must be initialised before use.",
          syntax: 'int count = 10;\ndouble price = 9.99;\nboolean ok = true;\nString name = "Ada";',
          exampleCode: `public class Main {
    public static void main(String[] args) {
        int count = 10;
        double price = 9.99;
        boolean ok = true;
        String name = "Ada";
        System.out.println(count + " " + price + " " + ok + " " + name);
        System.out.println("int bytes: " + Integer.BYTES);
    }
}`,
          exampleStdin: "",
          exampleOutput: "10 9.99 true Ada\nint bytes: 4",
        },
      ],
      problems: [
        {
          id: "java-prog-vars",
          title: "Total from item prices",
          difficulty: "easy",
          prompt:
            "Read three doubles (item prices) on one line. Print their total with 2 decimal places.",
          starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // read three doubles, print total with 2 decimals
        sc.close();
    }
}
`,
          samples: [{ input: "10.50 2.25 7.25", expectedOutput: "20.00" }],
          hints: ["sc.nextDouble() reads a double.", "System.out.printf(\"%.2f%n\", total);"],
          explanation: "Sum three nextDouble() calls and print with printf so the format is fixed.",
        },
      ],
    },
    {
      id: "operators",
      title: "Operators",
      difficulty: "beginner",
      lessons: [
        {
          id: "java-ops",
          title: "Arithmetic, comparison, logical",
          concept:
            "Java operators: + - * / % with integer / truncating and double / precise. Comparisons == != < > <= >= yield boolean; combine with && || !. Watch out: == on Strings compares references — use .equals() for text.",
          syntax: "a / b; a % b;\ncond1 && cond2; !cond\ns1.equals(s2)",
          exampleCode: `public class Main {
    public static void main(String[] args) {
        int a = 17, b = 5;
        System.out.println(a / b + " " + a % b);
        System.out.println(a > b && b > 0);
        System.out.println((double) a / b);
        System.out.println("abc".equals("abc"));
    }
}`,
          exampleStdin: "",
          exampleOutput: "3 2\ntrue\n3.4\ntrue",
        },
      ],
      problems: [
        {
          id: "java-prog-ops",
          title: "Test score decision",
          difficulty: "easy",
          prompt:
            "Read an int score (0–100). Print \"pass\" if score >= 50 and score <= 100, otherwise \"fail\". Print \"invalid\" if the score is out of the 0–100 range.",
          starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int score = sc.nextInt();
        // print pass / fail / invalid
        sc.close();
    }
}
`,
          samples: [
            { input: "75", expectedOutput: "pass" },
            { input: "40", expectedOutput: "fail" },
            { input: "150", expectedOutput: "invalid" },
          ],
          hints: ["Check the range first, then the threshold."],
          explanation: "Range validation first (0 ≤ score ≤ 100), then pass/fail against 50.",
        },
      ],
    },
    {
      id: "conditions",
      title: "Conditions",
      difficulty: "beginner",
      lessons: [
        {
          id: "java-if",
          title: "if / else if / else and switch",
          concept:
            "if (cond) { } else if (cond2) { } else { } chains branches. For multi-way choices on an int or String, switch (value) with case labels and break (fall-through without it). Java 14+ allows arrow cases: case 1 -> ... without break.",
          syntax: "if (cond) { ... } else if (x) { ... } else { ... }\nswitch (v) { case 1 -> ...; default -> ...; }",
          exampleCode: `public class Main {
    public static void main(String[] args) {
        int marks = 85;
        if (marks >= 90) {
            System.out.println("A");
        } else if (marks >= 80) {
            System.out.println("B");
        } else {
            System.out.println("C");
        }
    }
}`,
          exampleStdin: "",
          exampleOutput: "B",
        },
      ],
      problems: [
        {
          id: "java-prog-if",
          title: "FizzBuzz single number",
          difficulty: "easy",
          prompt:
            "Read an int n. Print \"FizzBuzz\" if divisible by both 3 and 5, \"Fizz\" if only by 3, \"Buzz\" if only by 5, otherwise the number itself.",
          starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // print FizzBuzz / Fizz / Buzz / n
        sc.close();
    }
}
`,
          samples: [
            { input: "15", expectedOutput: "FizzBuzz" },
            { input: "9", expectedOutput: "Fizz" },
            { input: "10", expectedOutput: "Buzz" },
            { input: "7", expectedOutput: "7" },
          ],
          hints: ["Check the combined condition FIRST — otherwise \"Fizz\" catches 15 too."],
          explanation: "Order matters: both-then-single-conditions before the plain echo.",
        },
      ],
    },
    {
      id: "loops",
      title: "Loops",
      difficulty: "beginner",
      lessons: [
        {
          id: "java-loop",
          title: "for, while, enhanced for",
          concept:
            "for (int i = 0; i < n; i++) is the classic counted loop. while checks its condition each pass. The enhanced for (for (int x : arr)) walks an array or List without indices. break and continue behave as in C/C++.",
          syntax: "for (int i = 0; i < n; i++) { ... }\nfor (int x : arr) { ... }\nwhile (cond) { ... }",
          exampleCode: `public class Main {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 100; i++) sum += i;
        System.out.println(sum);
        int[] nums = {2, 4, 6};
        for (int x : nums) System.out.print(x * x + " ");
        System.out.println();
    }
}`,
          exampleStdin: "",
          exampleOutput: "5050\n4 16 36 ",
        },
      ],
      problems: [
        {
          id: "java-prog-loop",
          title: "Count digits",
          difficulty: "easy",
          prompt:
            "Read a positive integer n and print how many digits it has (without converting to String — use division).",
          starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // count digits by repeatedly dividing by 10
        sc.close();
    }
}
`,
          samples: [
            { input: "98765", expectedOutput: "5" },
            { input: "7", expectedOutput: "1" },
          ],
          hints: ["Divide n by 10 each iteration and count until n becomes 0.", "Special case: n = 0 has 1 digit."],
          explanation: "Integer division by 10 peels one digit per iteration; the counter stops when nothing is left.",
        },
      ],
    },
    {
      id: "arrays",
      title: "Arrays",
      difficulty: "beginner",
      lessons: [
        {
          id: "java-arr",
          title: "Array basics",
          concept:
            "int[] a = new int[5] creates five zeros; int[] a = {1,2,3} initialises inline. Index from 0 to length-1; .length (no parens!) gives the size. Arrays are objects — pass-by-value of the reference, so callees can modify elements. Arrays.sort(a) sorts in place.",
          syntax: "int[] a = new int[n];\na[i]; a.length;\nArrays.sort(a);",
          exampleCode: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {5, 2, 9, 1};
        a[0] = 50;
        System.out.println(Arrays.toString(a));
        System.out.println(a.length);
        Arrays.sort(a);
        System.out.println(Arrays.toString(a));
    }
}`,
          exampleStdin: "",
          exampleOutput: "[50, 2, 9, 1]\n4\n[1, 2, 9, 50]",
        },
      ],
      problems: [
        {
          id: "java-prog-arr",
          title: "Average of an array",
          difficulty: "easy",
          prompt:
            "Read n, then n integers. Print their average as a double with exactly 1 decimal place.",
          starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        // print average with 1 decimal
        sc.close();
    }
}
`,
          samples: [{ input: "4\n2 3 4 5", expectedOutput: "3.5" }],
          hints: ["Cast the sum to double before dividing: (double) sum / n.", "printf(\"%.1f%n\", avg);"],
          explanation: "Integer division would truncate — convert one operand to double first.",
        },
      ],
    },
    {
      id: "functions",
      title: "Methods",
      difficulty: "beginner",
      lessons: [
        {
          id: "java-fn",
          title: "Static methods and overloading",
          concept:
            "A method: returnType name(params) { ... }. In a beginner program they are static so main can call them without an object. Java supports overloading — several methods with the same name but different parameter lists. Pass objects by reference-value (the reference is copied; the object is shared).",
          syntax: "static int add(int a, int b) { return a + b; }",
          exampleCode: `public class Main {
    static int add(int a, int b) { return a + b; }
    static double add(double a, double b) { return a + b; }

    static void shout(String s) {
        System.out.println(s + "!");
    }

    public static void main(String[] args) {
        System.out.println(add(2, 3));
        System.out.println(add(1.5, 2.5));
        shout("hi");
    }
}`,
          exampleStdin: "",
          exampleOutput: "5\n4.0\nhi!",
        },
      ],
      problems: [
        {
          id: "java-prog-fn",
          title: "Factorial (long)",
          difficulty: "easy",
          prompt:
            "Implement static long fact(int n) returning n! for n in 0..20 (0! = 1). main reads n and prints the result.",
          starterCode: `import java.util.Scanner;

public class Main {
    static long fact(int n) {
        // return n!
        return 1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(fact(sc.nextInt()));
        sc.close();
    }
}
`,
          samples: [
            { input: "5", expectedOutput: "120" },
            { input: "0", expectedOutput: "1" },
          ],
          hints: ["Loop from 2 to n multiplying a long accumulator.", "Use long — 20! overflows int."],
          explanation: "Iterative product into a long; starting at 1 handles both 0! and 1! correctly.",
        },
      ],
    },
    {
      id: "strings",
      title: "Strings",
      difficulty: "beginner",
      lessons: [
        {
          id: "java-str",
          title: "String and StringBuilder",
          concept:
            "Strings are immutable — every edit produces a new object. Use .equals() (not ==) to compare. Common methods: length, charAt, substring, toLowerCase, split, trim. In loops building text, use StringBuilder for efficiency.",
          syntax: 'String s = "Hello";\ns.length(); s.charAt(0); s.substring(1, 4);\ns.equals(other); s.contains("ell");',
          exampleCode: `public class Main {
    public static void main(String[] args) {
        String s = "  Java  ";
        System.out.println(s.trim());
        System.out.println(s.trim().toLowerCase());
        System.out.println(s.contains("av"));
        System.out.println("abc".equals("abc"));
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 3; i++) sb.append(i).append(",");
        System.out.println(sb.toString());
    }
}`,
          exampleStdin: "",
          exampleOutput: "Java\njava\ntrue\ntrue\n1,2,3,",
        },
      ],
      problems: [
        {
          id: "java-prog-str",
          title: "Initials from a full name",
          difficulty: "easy",
          prompt:
            "Read a full name of words separated by single spaces (e.g. Ada Lovelace King). Print the initials, one uppercase letter each, concatenated — \"ALK\".",
          starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        // print concatenated initials
        sc.close();
    }
}
`,
          samples: [
            { input: "Ada Lovelace", expectedOutput: "AL" },
            { input: "Grace Brewster Hopper", expectedOutput: "GBH" },
          ],
          hints: ["split(\" \") gives the words.", "Take charAt(0) of each word and append to a result."],
          explanation: "Split on spaces, take the first character of every word, concatenate them.",
        },
      ],
    },
    {
      id: "oop",
      title: "Classes & Objects",
      difficulty: "intermediate",
      lessons: [
        {
          id: "java-class",
          title: "Classes, fields and methods",
          concept:
            "A class defines fields (state) and methods (behaviour). new ClassName(args) runs the constructor (same name as the class). Instance methods operate on this; fields are private and exposed through methods (encapsulation). Each object has its own field values.",
          syntax: `class Counter {
    private int count = 0;
    public void increment() { count++; }
    public int get() { return count; }
}`,
          exampleCode: `class BankAccount {
    private String owner;
    private double balance;

    public BankAccount(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
    }

    public void deposit(double amount) { balance += amount; }
    public double getBalance() { return balance; }

    public static void main(String[] args) {
        BankAccount acc = new BankAccount("Ada", 100);
        acc.deposit(50);
        System.out.println(acc.owner + " -> " + acc.getBalance());
    }
}`,
          exampleStdin: "",
          exampleOutput: "Ada -> 150.0",
        },
      ],
      problems: [
        {
          id: "java-prog-oop",
          title: "Student class",
          difficulty: "medium",
          prompt:
            "Complete class Student with constructor Student(String name, int marks), getName(), getMarks(), and boolean isPassed() (marks >= 40). main already tests it.",
          starterCode: `public class Main {
    static class Student {
        private String name;
        private int marks;

        public Student(String name, int marks) {
            // store fields
        }
        public String getName() { return null; }
        public int getMarks() { return -1; }
        public boolean isPassed() { return false; }
    }

    public static void main(String[] args) {
        Student s = new Student("Aisha", 78);
        System.out.println(s.getName() + " " + s.getMarks() + " " + s.isPassed());
        Student t = new Student("Ravi", 35);
        System.out.println(t.getName() + " " + t.getMarks() + " " + t.isPassed());
    }
}
`,
          samples: [
            { input: "", expectedOutput: "Aisha 78 true\nRavi 35 false" },
          ],
          hints: ["this.name = name; in the constructor.", "isPassed() returns marks >= 40."],
          explanation:
            "Standard encapsulated POJO: constructor assigns, getters expose, isPassed applies the threshold.",
        },
      ],
    },
    {
      id: "problem-solving",
      title: "Basic Problem Solving",
      difficulty: "intermediate",
      lessons: [
        {
          id: "java-ps",
          title: "Planning before coding",
          concept:
            "Restate the problem, work a tiny example by hand, list the algorithm steps, then code each step as a small method. Test normal, boundary and invalid inputs. Java's compiler catches many mistakes early — read its messages carefully.",
          syntax: "// restate -> example -> steps -> methods -> test",
          exampleCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        int count = 0;
        for (int x : a) if (x > 0) count++;
        System.out.println(count);
        sc.close();
    }
}`,
          exampleStdin: "5\n-1 2 -3 4 5",
          exampleOutput: "3",
        },
      ],
      problems: [
        {
          id: "java-prog-ps",
          title: "Most frequent value",
          difficulty: "medium",
          prompt:
            "Read n and n integers (each between 1 and 100). Print the value that occurs most often (if several tie, print the smallest such value).",
          starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        // find the most frequent value
        sc.close();
    }
}
`,
          samples: [{ input: "7\n3 1 3 2 1 3 2", expectedOutput: "3" }],
          hints: [
            "int[101] counts — index by value.",
            "Scan values 1..100 keeping the best count; scanning upward breaks ties toward the smaller value.",
          ],
          explanation:
            "Histogram over 1..100, then scan the buckets in increasing order keeping strict improvements — ties resolve to the smaller value automatically.",
        },
      ],
    },
  ],
};
