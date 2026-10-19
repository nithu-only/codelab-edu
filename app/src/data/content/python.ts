import type { LearningPath } from "../../types";

export const pythonPath: LearningPath = {
  language: "python",
  label: "Python",
  blurb:
    "Start from zero and build up to classes and simple problem solving with Python's readable syntax.",
  topics: [
    {
      id: "variables",
      title: "Variables & Data Types",
      difficulty: "beginner",
      lessons: [
        {
          id: "py-var",
          title: "Storing values in variables",
          concept:
            "Python variables are labels for values. You don't declare a type — the type comes from the value. The main scalar types are int (whole numbers), float (decimals), str (text), and bool (True/False).",
          syntax: "name = value\nx, y = 1, 2   # multiple assignment",
          exampleCode: `count = 10          # int
price = 9.99        # float
name = "Ada"        # str
active = True       # bool
print(count, price, name, active)
print(type(count))`,
          exampleStdin: "",
          exampleOutput: "10 9.99 Ada True\n<class 'int'>",
        },
      ],
      problems: [
        {
          id: "py-prog-vars",
          title: "Area of a rectangle",
          difficulty: "easy",
          prompt:
            "Read two integers (width and height) from standard input and print the area of the rectangle as an integer.",
          starterCode: `w = int(input())
h = int(input())
print()  # replace with your answer
`,
          samples: [{ input: "3\n5", expectedOutput: "15" }],
          hints: [
            "input() reads a line; int() converts it.",
            "area = width * height",
          ],
          explanation:
            "Read both values with int(input()), multiply, and print the product. Input is given one value per line.",
        },
      ],
    },
    {
      id: "operators",
      title: "Operators",
      difficulty: "beginner",
      lessons: [
        {
          id: "py-ops",
          title: "Arithmetic, comparison and logical operators",
          concept:
            "Python supports + - * / (true division), // (floor division), % (modulo) and ** (power). Comparisons (<, <=, >, >=, ==, !=) produce booleans, and and / or / not combine them. Division by zero raises ZeroDivisionError.",
          syntax: "a + b, a - b, a * b, a / b, a // b, a % b, a ** 2\nx == y, x != y\ncond1 and cond2, cond1 or cond2, not cond1",
          exampleCode: `a, b = 17, 5
print(a // b, a % b, a / b, a ** 2)
print(a > b and b > 0)`,
          exampleStdin: "",
          exampleOutput: "3 2 3.4 289\nTrue",
        },
      ],
      problems: [
        {
          id: "py-prog-ops",
          title: "Even or odd, and divisible by 3",
          difficulty: "easy",
          prompt:
            "Read an integer n. Print \"even\" or \"odd\" on the first line, and on the second line print \"yes\" if it is divisible by 3, otherwise \"no\".",
          starterCode: `n = int(input())
# print your two lines
`,
          samples: [
            { input: "9", expectedOutput: "odd\nyes" },
            { input: "4", expectedOutput: "even\nno" },
          ],
          hints: ["n % 2 == 0 means even.", "n % 3 == 0 means divisible by 3."],
          explanation:
            "Use the modulo operator: n % 2 decides even/odd, n % 3 decides divisibility by 3. Two print() calls give the two lines.",
        },
      ],
    },
    {
      id: "conditions",
      title: "Conditions (if / elif / else)",
      difficulty: "beginner",
      lessons: [
        {
          id: "py-if",
          title: "Branching with if, elif, else",
          concept:
            "if runs a block only when its condition is true. elif chains extra checks and runs only if earlier conditions failed; else catches everything else. Indentation defines the block — Python has no braces.",
          syntax: "if cond:\n    ...\nelif other:\n    ...\nelse:\n    ...",
          exampleCode: `score = int(input())
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"
print(grade)`,
          exampleStdin: "85",
          exampleOutput: "B",
        },
      ],
      problems: [
        {
          id: "py-prog-if",
          title: "Leap year check",
          difficulty: "easy",
          prompt:
            "Read a year and print \"leap\" if it is a leap year, otherwise \"common\". A year is a leap year if it is divisible by 4, except century years which must be divisible by 400.",
          starterCode: `year = int(input())
# print "leap" or "common"
`,
          samples: [
            { input: "2024", expectedOutput: "leap" },
            { input: "1900", expectedOutput: "common" },
            { input: "2000", expectedOutput: "leap" },
          ],
          hints: ["Divisible by 4: year % 4 == 0", "Century exception: year % 100 == 0 and year % 400 != 0"],
          explanation:
            "Leap = (divisible by 4) and (not a century year OR divisible by 400). 1900 fails the century rule; 2000 passes it.",
        },
      ],
    },
    {
      id: "loops",
      title: "Loops",
      difficulty: "beginner",
      lessons: [
        {
          id: "py-loop",
          title: "for and while loops",
          concept:
            "for iterates over a sequence (range(n), a list, a string). while repeats until its condition becomes false. break leaves the loop early; continue skips to the next iteration.",
          syntax: "for i in range(5):\n    ...\nwhile cond:\n    ...",
          exampleCode: `total = 0
for i in range(1, 101):
    total += i
print(total)

n = int(input())
while n != 1:
    print(n, end=" ")
    n = n // 2 if n % 2 == 0 else 3 * n + 1
print(1)`,
          exampleStdin: "6",
          exampleOutput: "5050\n6 3 10 5 16 8 4 2 1",
        },
      ],
      problems: [
        {
          id: "py-prog-loop",
          title: "Sum of digits",
          difficulty: "easy",
          prompt:
            "Read a positive integer and print the sum of its digits.",
          starterCode: `n = input().strip()
total = 0
# add the digits of n to total
print(total)
`,
          samples: [
            { input: "1234", expectedOutput: "10" },
            { input: "905", expectedOutput: "14" },
          ],
          hints: ["Each character of the string is a digit.", "int(ch) converts a digit character to its value."],
          explanation:
            "Loop over the input string, convert each character with int(), and accumulate. Works without math because the input is already text.",
        },
      ],
    },
    {
      id: "arrays",
      title: "Lists (arrays)",
      difficulty: "beginner",
      lessons: [
        {
          id: "py-list",
          title: "Lists and list basics",
          concept:
            "A list holds an ordered sequence: nums = [3, 1, 4]. Index from 0, use -1 for the last element, len() for length. append() adds to the end; slicing nums[1:3] copies a window. Common pattern: sort with sorted() or .sort().",
          syntax: "nums = [a, b, c]\nnums[0], nums[-1], len(nums)\nnums.append(x)\nfor x in nums: ...",
          exampleCode: `nums = [5, 2, 9, 1]
nums.append(7)
nums.sort()
print(nums, nums[0], len(nums))
print(sum(nums), max(nums))`,
          exampleStdin: "",
          exampleOutput: "[1, 2, 5, 7, 9] 1 5\n24 9",
        },
      ],
      problems: [
        {
          id: "py-prog-list",
          title: "Second largest value",
          difficulty: "easy",
          prompt:
            "Read n, then n integers on one line. Print the second largest distinct value. It is guaranteed that at least two distinct values exist.",
          starterCode: `n = int(input())
nums = list(map(int, input().split()))
# find the second largest distinct value
`,
          samples: [
            { input: "5\n3 7 7 2 9", expectedOutput: "7" },
            { input: "4\n10 4 6 4", expectedOutput: "6" },
          ],
          hints: ["Convert to a set to remove duplicates, then sort.", "After sorting ascending, take the value at index -2."],
          explanation:
            "Distinct values via set(), sorted ascending, second largest is at position -2. Duplicates like 7,7 collapse to one.",
        },
      ],
    },
    {
      id: "functions",
      title: "Functions",
      difficulty: "beginner",
      lessons: [
        {
          id: "py-fn",
          title: "def, parameters and return",
          concept:
            "def name(params): defines a function. Arguments go in parentheses; return sends a value back (or None implicitly). Default values and keyword arguments make calls clearer. A function without return still returns None.",
          syntax: "def add(a, b=0):\n    return a + b",
          exampleCode: `def area(w, h):
    return w * h

def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(area(3, 4))
print(greet("Ada"))
print(greet("Linus", greeting="Hi"))`,
          exampleStdin: "",
          exampleOutput: "12\nHello, Ada!\nHi, Linus!",
        },
      ],
      problems: [
        {
          id: "py-prog-fn",
          title: "Check prime",
          difficulty: "easy",
          prompt:
            "Read an integer n (n >= 2) and print \"prime\" if it is prime, otherwise \"composite\". Implement your check as a function.",
          starterCode: `def is_prime(n):
    # return True/False
    pass

n = int(input())
print("prime" if is_prime(n) else "composite")
`,
          samples: [
            { input: "29", expectedOutput: "prime" },
            { input: "91", expectedOutput: "composite" },
          ],
          hints: ["Only test divisors from 2 up to sqrt(n).", "2 is prime — the smallest special case."],
          explanation:
            "Trial division up to int(n**0.5) is enough. 91 = 7 × 13, so it is composite; 29 has no divisor below 6.",
        },
      ],
    },
    {
      id: "strings",
      title: "Strings",
      difficulty: "beginner",
      lessons: [
        {
          id: "py-str",
          title: "String basics, slicing and methods",
          concept:
            "Strings are immutable sequences of characters. Index/slice like lists: s[0], s[1:4]. Useful methods: len, lower, upper, strip, split, join, replace. f-strings embed expressions: f'{name} has {n} items'.",
          syntax: 's = "  Hello  "\ns.strip(), s.lower(), s.split(), "-".join(parts)\nf"{value}"',
          exampleCode: `s = "  Hello, World  "
print(s.strip())
print(s.strip().lower())
parts = s.strip().split(", ")
print(parts[1])
print(" / ".join(parts))
print(f"{len('abc')} chars")`,
          exampleStdin: "",
          exampleOutput: "Hello, World\nhello, world\nWorld\nHello / World\n3 chars",
        },
      ],
      problems: [
        {
          id: "py-prog-str",
          title: "Count vowels",
          difficulty: "easy",
          prompt: "Read a line of text and print how many vowels (a, e, i, o, u — both cases) it contains.",
          starterCode: `line = input()
count = 0
# count vowels
print(count)
`,
          samples: [
            { input: "Programming", expectedOutput: "3" },
            { input: "XYZ", expectedOutput: "0" },
          ],
          hints: ["Lowercase the string first.", '"aeiou" — check membership with in."'],
          explanation:
            "Lowercase the line, then loop counting characters that appear in \"aeiou\". 'Programming' has o, a, i.",
        },
      ],
    },
    {
      id: "oop",
      title: "Object-Oriented Programming",
      difficulty: "intermediate",
      lessons: [
        {
          id: "py-class",
          title: "Classes and objects",
          concept:
            "class defines a blueprint; __init__ constructs each object; self refers to the current instance. Attributes live on self; methods are functions that take self first. Objects bundle data and behaviour together.",
          syntax: `class Dog:
    def __init__(self, name):
        self.name = name
    def bark(self):
        return f"{self.name} says woof"`,
          exampleCode: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

acc = BankAccount("Ada", 100)
acc.deposit(50)
print(acc.owner, acc.balance)`,
          exampleStdin: "",
          exampleOutput: "Ada 150",
        },
      ],
      problems: [
        {
          id: "py-prog-oop",
          title: "Model a Counter class",
          difficulty: "medium",
          prompt:
            "Implement a Counter class with methods increment() (adds 1), reset() (back to 0) and get() (returns current value). The template creates one, you fill the class.",
          starterCode: `class Counter:
    def __init__(self):
        pass
    def increment(self):
        pass
    def reset(self):
        pass
    def get(self):
        pass

c = Counter()
c.increment()
c.increment()
c.increment()
print(c.get())
c.reset()
print(c.get())
`,
          samples: [{ input: "", expectedOutput: "3\n0" }],
          hints: ["Store the value in self.count, initialised to 0 in __init__.", "reset() sets self.count back to 0."],
          explanation:
            "The three increments raise the count to 3; reset() sets it back to 0, so get() prints 0 the second time.",
        },
      ],
    },
    {
      id: "problem-solving",
      title: "Basic Problem Solving",
      difficulty: "intermediate",
      lessons: [
        {
          id: "py-ps",
          title: "A simple approach to coding problems",
          concept:
            "A reliable routine: (1) restate the problem in your own words, (2) work a small example by hand, (3) write down the steps in plain English, (4) code the steps, (5) test with normal, edge, and bad inputs. Keep functions small so each piece is easy to check.",
          syntax: "# steps -> small functions -> test",
          exampleCode: `# Problem: read n numbers, print min, max, average (1 decimal)
n = int(input())
nums = list(map(int, input().split()))
lo, hi = min(nums), max(nums)
avg = sum(nums) / len(nums)
print(lo, hi, f"{avg:.1f}")`,
          exampleStdin: "4\n5 2 9 4",
          exampleOutput: "2 9 5.0",
        },
      ],
      problems: [
        {
          id: "py-prog-ps",
          title: "Two-sum",
          difficulty: "medium",
          prompt:
            "Read n and a target, then n integers. Print the 1-based indices (i j, i < j) of two values that add up to the target. Exactly one solution exists.",
          starterCode: `n, target = map(int, input().split())
nums = list(map(int, input().split()))
# find i, j (1-based) with nums[i-1] + nums[j-1] == target
`,
          samples: [{ input: "4 9\n2 7 11 15", expectedOutput: "1 2" }],
          hints: [
            "A nested loop over pairs works fine for small n.",
            "For each pair, check if nums[i] + nums[j] == target.",
          ],
          explanation:
            "Check every pair (i < j); the first pair summing to target wins: 2 + 7 = 9 at 1-based indices 1 and 2. A dictionary gives O(n) but loops are fine here.",
        },
      ],
    },
  ],
};
