import type { LearningPath } from "../../types";

export const cppPath: LearningPath = {
  language: "cpp",
  label: "C++",
  blurb:
    "C with classes: master variables, control flow, functions, vectors, strings and objects in modern C++.",
  topics: [
    {
      id: "variables",
      title: "Variables & Data Types",
      difficulty: "beginner",
      lessons: [
        {
          id: "cpp-var",
          title: "Declaring variables with auto and explicit types",
          concept:
            "C++ has fixed-size numeric types: int, long, double, float, char, bool. Prefer auto x = value; when the type is obvious. std::string holds text (from <string>). Variables must be declared before use.",
          syntax: "int count = 10;\ndouble price = 9.99;\nauto n = 42;          // int\nstd::string name = \"Ada\";",
          exampleCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int count = 10;
    double price = 9.99;
    auto active = true;
    string name = "Ada";
    cout << count << " " << price << " " << active << " " << name << endl;
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "10 9.99 1 Ada",
        },
      ],
      problems: [
        {
          id: "cpp-prog-vars",
          title: "Simple interest",
          difficulty: "easy",
          prompt:
            "Read principal (double), annual rate (double) and time in years (double). Print simple interest = principal × rate × time ÷ 100, with 2 decimal places.",
          starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double p, r, t;
    cin >> p >> r >> t;
    // print simple interest with 2 decimals
    return 0;
}
`,
          samples: [{ input: "1000 5 2", expectedOutput: "100.00" }],
          hints: ["interest = p * r * t / 100.0", "Use fixed << setprecision(2) from <iomanip>."],
          explanation: "Direct formula; keep everything double so division is not truncated.",
        },
      ],
    },
    {
      id: "operators",
      title: "Operators",
      difficulty: "beginner",
      lessons: [
        {
          id: "cpp-ops",
          title: "Arithmetic, comparison, logical operators",
          concept:
            "+ - * / % work like C: integer / truncates, % only on integers. Comparisons yield bool. && || ! combine conditions. Casting (double)a / b forces floating division.",
          syntax: "a / b; a % b;\na == b; a != b;\ncond1 && cond2; !cond",
          exampleCode: `#include <iostream>
using namespace std;

int main() {
    int a = 17, b = 5;
    cout << a / b << " " << a % b << endl;
    cout << (a > b && b > 0) << endl;
    cout << (double)a / b << endl;
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "3 2\n1\n3.4",
        },
      ],
      problems: [
        {
          id: "cpp-prog-ops",
          title: "Celsius to Fahrenheit",
          difficulty: "easy",
          prompt:
            "Read a double (Celsius) and print Fahrenheit = C × 9/5 + 32 with 1 decimal place.",
          starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double c;
    cin >> c;
    // print Fahrenheit with 1 decimal
    return 0;
}
`,
          samples: [{ input: "100", expectedOutput: "212.0" }],
          hints: ["f = c * 9 / 5 + 32 — use 9.0/5.0 to keep it floating point."],
          explanation: "Standard conversion; 9.0/5.0 avoids integer division.",
        },
      ],
    },
    {
      id: "conditions",
      title: "Conditions",
      difficulty: "beginner",
      lessons: [
        {
          id: "cpp-if",
          title: "if / else if / else and switch",
          concept:
            "if (cond) ... else if ... else chains branches. For integral/enum choices, switch (value) { case 1: ... break; } is an alternative — forget break and you fall through to the next case.",
          syntax: "if (cond) { ... } else if (x) { ... } else { ... }\nswitch (v) { case 1: ... break; default: ... }",
          exampleCode: `#include <iostream>
using namespace std;

int main() {
    int day;
    cin >> day;
    switch (day) {
        case 1: cout << "Mon" << endl; break;
        case 2: cout << "Tue" << endl; break;
        case 3: cout << "Wed" << endl; break;
        default: cout << "other" << endl;
    }
    return 0;
}`,
          exampleStdin: "2",
          exampleOutput: "Tue",
        },
      ],
      problems: [
        {
          id: "cpp-prog-if",
          title: "Triangle side check",
          difficulty: "easy",
          prompt:
            "Read three integers a b c. Print \"yes\" if they can form a triangle (each side less than the sum of the other two), otherwise \"no\".",
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    // print yes / no
    return 0;
}
`,
          samples: [
            { input: "3 4 5", expectedOutput: "yes" },
            { input: "1 2 10", expectedOutput: "no" },
          ],
          hints: ["Check all three: a+b>c, a+c>b, b+c>a — all must hold."],
          explanation: "Triangle inequality: every side must be shorter than the sum of the other two.",
        },
      ],
    },
    {
      id: "loops",
      title: "Loops",
      difficulty: "beginner",
      lessons: [
        {
          id: "cpp-loop",
          title: "for, while and range-for",
          concept:
            "for (int i = 0; i < n; ++i) is the counted loop. while repeats on a condition. C++11 range-for walks a container: for (int x : nums) { ... }. break exits; continue skips ahead.",
          syntax: "for (int i = 0; i < n; ++i) { ... }\nfor (int x : nums) { ... }\nwhile (cond) { ... }",
          exampleCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {3, 1, 4, 1, 5};
    int sum = 0;
    for (int x : nums) sum += x;
    cout << sum << endl;
    for (int i = 1; i <= 5; i++) cout << i * i << " ";
    cout << endl;
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "14\n1 4 9 16 25 ",
        },
      ],
      problems: [
        {
          id: "cpp-prog-loop",
          title: "First power of two above n",
          difficulty: "easy",
          prompt:
            "Read n (1 ≤ n ≤ 1000) and print the smallest power of two strictly greater than n.",
          starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // find smallest 2^k > n
    return 0;
}
`,
          samples: [
            { input: "8", expectedOutput: "16" },
            { input: "5", expectedOutput: "8" },
          ],
          hints: ["Start p = 1 and keep doubling while p <= n."],
          explanation: "Repeated doubling from 1 lands on the first value exceeding n.",
        },
      ],
    },
    {
      id: "arrays",
      title: "Arrays & Vectors",
      difficulty: "beginner",
      lessons: [
        {
          id: "cpp-vec",
          title: "std::vector — the growable array",
          concept:
            "Prefer std::vector<int> over raw arrays: it manages memory, knows its size, and grows on push_back. Access with v[i] (0-based) or v.at(i) (bounds-checked). size() gives the element count; range-for iterates cleanly.",
          syntax: "vector<int> v = {1, 2, 3};\nv.push_back(4);\nv.size(); v[0];",
          exampleCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {5, 2, 9};
    v.push_back(1);
    v[0] = 50;
    for (size_t i = 0; i < v.size(); i++) cout << v[i] << " ";
    cout << "\\nsize=" << v.size() << endl;
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "50 2 9 1 \nsize=4",
        },
      ],
      problems: [
        {
          id: "cpp-prog-vec",
          title: "Reverse and print",
          difficulty: "easy",
          prompt: "Read n, then n integers. Print them in reverse order, space-separated, with a trailing space.",
          starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++) cin >> v[i];
    // print reversed
    return 0;
}
`,
          samples: [{ input: "4\n1 2 3 4", expectedOutput: "4 3 2 1 " }],
          hints: ["Loop i from n-1 down to 0."],
          explanation: "Backwards counted loop over the same vector.",
        },
      ],
    },
    {
      id: "functions",
      title: "Functions",
      difficulty: "beginner",
      lessons: [
        {
          id: "cpp-fn",
          title: "Functions, references and defaults",
          concept:
            "ReturnType name(params) { ... }. Pass by const reference (const string &s) to avoid copying large values; pass by pointer/reference (&x) when the function must modify the caller's variable. Default arguments: int f(int a, int b = 10).",
          syntax: "int add(int a, int b) { return a + b; }\nvoid twice(int &n) { n *= 2; }",
          exampleCode: `#include <iostream>
#include <string>
using namespace std;

string shout(const string &s) { return s + "!"; }

void twice(int &n) { n *= 2; }

int main() {
    cout << shout("hello") << endl;
    int x = 21;
    twice(x);
    cout << x << endl;
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "hello!\n42",
        },
      ],
      problems: [
        {
          id: "cpp-prog-fn",
          title: "GCD of two numbers",
          difficulty: "easy",
          prompt:
            "Implement int gcd(int a, int b) using Euclid's algorithm (loop version: replace the larger by the difference/modulo until zero). main reads a b and prints the result.",
          starterCode: `#include <iostream>
using namespace std;

int gcd(int a, int b) {
    // return the greatest common divisor
    return 0;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << gcd(a, b) << endl;
    return 0;
}
`,
          samples: [
            { input: "12 18", expectedOutput: "6" },
            { input: "7 13", expectedOutput: "1" },
          ],
          hints: ["while (b != 0) { int t = a % b; a = b; b = t; }", "Return a at the end."],
          explanation:
            "Euclid's algorithm: repeatedly replace (a, b) with (b, a mod b); when b hits 0, a is the GCD.",
        },
      ],
    },
    {
      id: "strings",
      title: "std::string",
      difficulty: "beginner",
      lessons: [
        {
          id: "cpp-str",
          title: "Working with std::string",
          concept:
            "std::string (from <string>) manages its own memory. Concatenate with +, compare with == / <, get size() (chars only), find substrings with find, and take substr(pos, len). getline(cin, s) reads a whole line including spaces.",
          syntax: 'string s = "hi";\ns.size(); s + "!"; s.substr(0, 3); s.find("x");',
          exampleCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "Hello, World";
    cout << s.size() << endl;
    cout << s.substr(0, 5) << endl;
    cout << (s.find("World") != string::npos) << endl;
    string a = "abc", b = "abd";
    cout << (a < b) << endl;
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "12\nHello\n1\n1",
        },
      ],
      problems: [
        {
          id: "cpp-prog-str",
          title: "Is it a palindrome?",
          difficulty: "easy",
          prompt:
            "Read one word and print \"yes\" if it reads the same forwards and backwards, otherwise \"no\".",
          starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    // print yes / no
    return 0;
}
`,
          samples: [
            { input: "level", expectedOutput: "yes" },
            { input: "codelab", expectedOutput: "no" },
          ],
          hints: ["Compare s with a reversed copy, or check s[i] vs s[n-1-i] in a loop."],
          explanation: "Symmetric index comparison from both ends — one mismatch means not a palindrome.",
        },
      ],
    },
    {
      id: "oop",
      title: "Classes & Objects (OOP)",
      difficulty: "intermediate",
      lessons: [
        {
          id: "cpp-class",
          title: "Defining a class",
          concept:
            "class bundles data and methods. public: members are reachable from outside; private: members are the default and hidden. The constructor class-name(args) initialises each object (use member initialiser lists). Methods declared const don't modify the object.",
          syntax: `class Point {
public:
    Point(int x, int y) : x_(x), y_(y) {}
    int x() const { return x_; }
private:
    int x_, y_;
};`,
          exampleCode: `#include <iostream>
using namespace std;

class Counter {
public:
    Counter() : count_(0) {}
    void increment() { count_++; }
    int get() const { return count_; }
private:
    int count_;
};

int main() {
    Counter c;
    c.increment();
    c.increment();
    cout << c.get() << endl;
    return 0;
}`,
          exampleStdin: "",
          exampleOutput: "2",
        },
      ],
      problems: [
        {
          id: "cpp-prog-oop",
          title: "Rectangle class",
          difficulty: "medium",
          prompt:
            "Complete class Rectangle with a constructor Rectangle(w, h), double area() const, and double perimeter() const. main already exercises them.",
          starterCode: `#include <iostream>
using namespace std;

class Rectangle {
public:
    Rectangle(double w, double h) {
        // store w and h
    }
    double area() const { return 0; }
    double perimeter() const { return 0; }
private:
    double w_ = 0, h_ = 0;
};

int main() {
    Rectangle r(3, 4);
    cout << r.area() << endl;
    cout << r.perimeter() << endl;
    return 0;
}
`,
          samples: [{ input: "", expectedOutput: "12\n14" }],
          hints: ["area = w * h", "perimeter = 2 * (w + h)"],
          explanation: "Simple property methods reading the private dimensions set by the constructor.",
        },
      ],
    },
    {
      id: "problem-solving",
      title: "Basic Problem Solving",
      difficulty: "intermediate",
      lessons: [
        {
          id: "cpp-ps",
          title: "From idea to working program",
          concept:
            "Restate the problem, hand-run a small example, write the algorithm in plain English, then code it in small pieces you can test independently. Think about edge cases (empty input, n = 1) before you finish.",
          syntax: "// restate -> example -> steps -> code -> test",
          exampleCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++) cin >> v[i];
    sort(v.begin(), v.end());
    long long best = 0;
    for (int i = 1; i < n; i++) best = max(best, (long long)v[i] * v[i - 1]);
    cout << best << endl;
    return 0;
}`,
          exampleStdin: "4\n1 20 3 4",
          exampleOutput: "80",
        },
      ],
      problems: [
        {
          id: "cpp-prog-ps",
          title: "Meeting point",
          difficulty: "medium",
          prompt:
            "Read n positions on a line (n ≤ 1000). Find the position p (must be one of the given positions) minimising the total distance travelled to all points. Print that minimum total distance.",
          starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
#include <cstdlib>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++) cin >> v[i];
    // try every candidate, keep the best total distance
    return 0;
}
`,
          samples: [{ input: "4\n1 2 3 10", expectedOutput: "10" }],
          hints: [
            "For a candidate p, total = sum of |v[i] - p|.",
            "The optimum is the median, but trying every position is simpler and fast enough.",
          ],
          explanation:
            "Try each given position as the meeting point: p=1 gives 0+1+2+9=12, p=2 gives 1+0+1+8=10, p=3 gives 2+1+0+7=10, p=10 gives 9+8+7+0=24. The minimum total distance is 10.",
        },
      ],
    },
  ],
};
