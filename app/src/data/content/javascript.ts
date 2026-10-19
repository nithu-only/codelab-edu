import type { LearningPath } from "../../types";

export const javascriptPath: LearningPath = {
  language: "javascript",
  label: "JavaScript",
  blurb:
    "The language of the web: variables, control flow, functions, arrays, objects — running right in your browser.",
  topics: [
    {
      id: "variables",
      title: "Variables & Data Types",
      difficulty: "beginner",
      lessons: [
        {
          id: "js-var",
          title: "let, const and primitives",
          concept:
            "Declare variables with const (preferred) or let when reassigned later — var is legacy and avoided. Primitives: number (all numerics), string, boolean, null, undefined, bigint, symbol. Template literals use backticks: `Hello ${name}`. No type declarations — types belong to values.",
          syntax: 'const name = "Ada";\nlet count = 0;\nconst greeting = `Hi ${name}!`;',
          exampleCode: `const name = "Ada";
let count = 0;
count = count + 1;
const price = 9.99;
const active = true;
console.log(\`\${name} has \${count} item(s) costing \${price}, active=\${active}\`);
console.log(typeof price, typeof active, typeof name);`,
          exampleStdin: "",
          exampleOutput: "Ada has 1 item(s) costing 9.99, active=true\nnumber boolean string",
        },
      ],
      problems: [
        {
          id: "js-prog-vars",
          title: "Tip calculator",
          difficulty: "easy",
          prompt:
            "Read a line: bill tipPercent. Print the tip amount and the total, each on its own line, rounded to 2 decimal places (use toFixed(2)).",
          starterCode: `const [bill, pct] = input().trim().split(/\\s+/).map(Number);
// print tip and total, 2 decimals each
`,
          samples: [{ input: "200 10", expectedOutput: "20.00\n220.00" }],
          hints: ["tip = bill * pct / 100", "`Total` is bill + tip."],
          explanation: "Compute both numbers from the same bill value, format with toFixed(2).",
        },
      ],
    },
    {
      id: "operators",
      title: "Operators",
      difficulty: "beginner",
      lessons: [
        {
          id: "js-ops",
          title: "Arithmetic, comparison, logical",
          concept:
            "Arithmetic + - * / % **; division always yields a number. Comparisons: == does coercion (avoid), === compares value AND type (always use this). Logical: && || !. Note 1 + 2 + '3' is different from '1' + 2 + 3 because + is also string concatenation.",
          syntax: "a / b; a % b; a ** 2;\na === b; a !== b;\ncond1 && cond2",
          exampleCode: `const a = 17, b = 5;
console.log(a / b, a % b, a ** 2);
console.log(7 / 2, 7 % 2);
console.log(1 + 2 + "3");
console.log("1" + 2 + 3);
console.log(5 === "5", 5 == "5");
console.log(a > b && b > 0);`,
          exampleStdin: "",
          exampleOutput: "3.4 2 289\n3.5 1\n33\n123\nfalse true\ntrue",
        },
      ],
      problems: [
        {
          id: "js-prog-ops",
          title: "Even or odd (and sign)",
          difficulty: "easy",
          prompt:
            "Read an integer. Print \"even-positive\", \"odd-positive\", \"even-negative\" or \"odd-negative\" (zero counts as even-positive).",
          starterCode: `const n = Number(input().trim());
// print one of the four labels
`,
          samples: [
            { input: "4", expectedOutput: "even-positive" },
            { input: "-7", expectedOutput: "odd-negative" },
            { input: "0", expectedOutput: "even-positive" },
          ],
          hints: ["n % 2 === 0 tests evenness (works for negatives too).", "n >= 0 tests the sign."],
          explanation: "Two independent facts — parity and sign — combined into one label string.",
        },
      ],
    },
    {
      id: "conditions",
      title: "Conditions",
      difficulty: "beginner",
      lessons: [
        {
          id: "js-if",
          title: "if / else if / else",
          concept:
            "if (cond) { } else if (cond2) { } else { }. Conditions are evaluated for truthiness: 0, '', null, undefined, NaN and false are falsy; everything else is truthy. Use === when comparing values so you don't inherit coercion surprises.",
          syntax: "if (cond) { ... } else if (x) { ... } else { ... }",
          exampleCode: `function classify(n) {
  if (n === 0) return "zero";
  else if (n < 0) return "negative";
  else return "positive";
}
console.log(classify(-5), classify(0), classify(12));
console.log(Boolean(""), Boolean("hi"), Boolean(0), Boolean([]));`,
          exampleStdin: "",
          exampleOutput: "negative zero positive\nfalse true false true",
        },
      ],
      problems: [
        {
          id: "js-prog-if",
          title: "Leap year",
          difficulty: "easy",
          prompt:
            "Read a year and print \"yes\" if it is a leap year, otherwise \"no\". Rule: divisible by 400, OR divisible by 4 but not by 100.",
          starterCode: `const y = Number(input().trim());
// print yes / no
`,
          samples: [
            { input: "2024", expectedOutput: "yes" },
            { input: "1900", expectedOutput: "no" },
            { input: "2000", expectedOutput: "yes" },
          ],
          hints: ["(y % 400 === 0) || (y % 4 === 0 && y % 100 !== 0)"],
          explanation: "The century rule is the trap: 1900 fails, 2000 passes.",
        },
      ],
    },
    {
      id: "loops",
      title: "Loops",
      difficulty: "beginner",
      lessons: [
        {
          id: "js-loop",
          title: "for, while and for...of",
          concept:
            "for (let i = 0; i < n; i++) counts up. while repeats on a condition. for...of walks arrays (and iterables) by value — preferred over for...in (which walks keys and is for objects). break exits; continue skips the rest of the pass.",
          syntax: "for (let i = 0; i < n; i++) { ... }\nfor (const x of arr) { ... }\nwhile (cond) { ... }",
          exampleCode: `const nums = [3, 1, 4, 1, 5];
let sum = 0;
for (const x of nums) sum += x;
console.log("sum:", sum);

let squares = "";
for (let i = 1; i <= 5; i++) squares += i * i + " ";
console.log(squares);

let i = 10;
while (i > 0) i -= 3;
console.log("stopped at", i);`,
          exampleStdin: "",
          exampleOutput: "sum: 14\n1 4 9 16 25 \nstopped at -2",
        },
      ],
      problems: [
        {
          id: "js-prog-loop",
          title: "Fibonacci sequence",
          difficulty: "easy",
          prompt:
            "Read n (1 ≤ n ≤ 40) and print the first n Fibonacci numbers, space-separated with a trailing space (F1=1, F2=1).",
          starterCode: `const n = Number(input().trim());
// print n Fibonacci numbers with trailing space
`,
          samples: [
            { input: "6", expectedOutput: "1 1 2 3 5 8 " },
            { input: "1", expectedOutput: "1 " },
          ],
          hints: ["Keep two variables a and b; each step: [a, b] = [b, a + b].", "Print the OLD a before updating."],
          explanation: "Sliding window of two values — print then shift, which naturally starts 1, 1, 2, 3, 5, 8.",
        },
      ],
    },
    {
      id: "arrays",
      title: "Arrays",
      difficulty: "beginner",
      lessons: [
        {
          id: "js-arr",
          title: "Array methods",
          concept:
            "const a = [1, 2, 3] is a mutable list. Key methods: push/pop (ends), shift/unshift (starts), slice (copy), splice (cut/insert), map/filter/reduce (transform/select/aggregate), includes, indexOf, sort((x, y) => x - y) for numerics — default sort is alphabetical!",
          syntax: "a.push(4); a.slice(1, 3);\na.map(fn); a.filter(fn); a.reduce(fn, init);",
          exampleCode: `const a = [5, 2, 9, 1];
a.sort((x, y) => x - y);
console.log(a.join(" "));
console.log(a.map((x) => x * 10).join(","));
console.log(a.filter((x) => x > 2).join(","));
console.log(a.reduce((s, x) => s + x, 0));
console.log([1, 2, 3].includes(2), a.indexOf(9));`,
          exampleStdin: "",
          exampleOutput: "1 2 5 9\n10,20,50,90\n5,9\n17\ntrue 3",
        },
      ],
      problems: [
        {
          id: "js-prog-arr",
          title: "Second largest",
          difficulty: "easy",
          prompt:
            "Read n and n integers. Print the second largest distinct value (it is guaranteed to exist).",
          starterCode: `const tokens = input().trim().split(/\\s+/).map(Number);
const a = tokens.slice(1); // skip the leading n
// print second largest DISTINCT value
`,
          samples: [{ input: "5\n3 9 9 1 7", expectedOutput: "7" }],
          hints: ["Unique values first: [...new Set(a)].sort((x, y) => y - x).", "Then take index 1."],
          explanation: "Deduplicate, sort descending, pick the second entry: 9, 7, 3, 1 → 7.",
        },
      ],
    },
    {
      id: "functions",
      title: "Functions",
      difficulty: "beginner",
      lessons: [
        {
          id: "js-fn",
          title: "Function declarations and arrow functions",
          concept:
            "Three flavours: function f(a) { return a; }, const f = (a) => a, and anonymous callbacks. Arrow functions have concise syntax and inherit `this` from their surrounding scope. Functions are first-class values — pass them to map, filter, setTimeout.",
          syntax: "function add(a, b) { return a + b; }\nconst sq = (x) => x * x;",
          exampleCode: `function add(a, b) { return a + b; }
const sq = (x) => x * x;
const twice = (f, v) => f(f(v));

console.log(add(2, 3), sq(4), twice(sq, 2));
console.log([1, 2, 3].map(sq).join(","));
console.log([1, 2, 3, 4].filter((x) => x % 2 === 0).join(","));`,
          exampleStdin: "",
          exampleOutput: "5 16 16\n1,4,9\n2,4",
        },
      ],
      problems: [
        {
          id: "js-prog-fn",
          title: "Higher-order: apply twice",
          difficulty: "easy",
          prompt:
            "Implement applyTwice(fn, x) that returns fn(fn(x)). main (already written) reads a number, applies x => x * 3 twice, and prints the result.",
          starterCode: `function applyTwice(fn, x) {
  // return fn applied to x twice
}

console.log(applyTwice((n) => n * 3, Number(input().trim())));
`,
          samples: [{ input: "2", expectedOutput: "18" }],
          hints: ["return fn(fn(x));"],
          explanation: "2 → ×3 = 6 → ×3 = 18. Functions are just values you can call twice.",
        },
      ],
    },
    {
      id: "strings",
      title: "Strings",
      difficulty: "beginner",
      lessons: [
        {
          id: "js-str",
          title: "String methods and template literals",
          concept:
            "Strings are immutable. Useful methods: length, toUpperCase, trim, includes, slice(start, end), split(delim), replace, startsWith. Template literals (backticks) interpolate ${expr} and allow multi-line text. split + join covers most join/split chores.",
          syntax: 'const s = "Hello World";\ns.toUpperCase(); s.slice(0, 5); s.split(" ");\n`Total: ${n}`',
          exampleCode: `const s = "  Hello, World  ";
console.log(s.trim());
console.log(s.trim().toUpperCase());
console.log(s.trim().split(", "));
console.log(s.includes("World"), s.startsWith("  H"));
const name = "Ada", n = 3;
console.log(\`\${name} has \${n} item\${n === 1 ? "" : "s"}\`);`,
          exampleStdin: "",
          exampleOutput: "Hello, World\nHELLO, WORLD\n[\"Hello\",\"World\"]\ntrue true\nAda has 3 items",
        },
      ],
      problems: [
        {
          id: "js-prog-str",
          title: "Count vowels",
          difficulty: "easy",
          prompt:
            "Read a line of text and print how many vowels (a e i o u, case-insensitive) it contains.",
          starterCode: `const line = input();
// print the vowel count
`,
          samples: [
            { input: "CodeLab", expectedOutput: "3" },
            { input: "rhythm", expectedOutput: "0" },
          ],
          hints: ['lower = line.toLowerCase()', 'count how many chars are in "aeiou" — includes() works.'],
          explanation: "Lowercase the input once, then count membership in the vowel set.",
        },
      ],
    },
    {
      id: "oop",
      title: "Objects & Classes",
      difficulty: "intermediate",
      lessons: [
        {
          id: "js-obj",
          title: "Objects and classes",
          concept:
            'Objects are key/value bags: const o = { name: "Ada", greet() { return "hi" } }. Access with o.name or o["name"]. class syntax (from ES6) gives real constructors, methods and fields with `this`. Arrays are objects too.',
          syntax: `const o = { name: "Ada", age: 36 };
class Counter { #n = 0; inc() { this.#n++; } get() { return this.#n; } }`,
          exampleCode: `const point = { x: 3, y: 4, norm() { return Math.hypot(this.x, this.y); } };
console.log(point.x, point.norm());

class Counter {
  constructor(start = 0) { this.count = start; }
  inc() { this.count++; }
  get() { return this.count; }
}
const c = new Counter(10);
c.inc(); c.inc();
console.log(c.get());
console.log(Object.keys(point).join(","));`,
          exampleStdin: "",
          exampleOutput: "3 5\n12\nx,y,norm",
        },
      ],
      problems: [
        {
          id: "js-prog-oop",
          title: "Wallet class",
          difficulty: "medium",
          prompt:
            "Complete class Wallet with constructor(initial), deposit(amount), withdraw(amount) (withdraw only if funds allow — otherwise return false), and balance getter. main already exercises it.",
          starterCode: `class Wallet {
  constructor(initial) {
    // set starting balance
  }
  deposit(amount) {
    // add to balance, return true
    return false;
  }
  withdraw(amount) {
    // subtract if sufficient, return true; else return false
    return false;
  }
  get balance() {
    return -1;
  }
}

const w = new Wallet(100);
console.log(w.balance);
console.log(w.deposit(50), w.balance);
console.log(w.withdraw(30), w.balance);
console.log(w.withdraw(1000), w.balance);
`,
          samples: [{ input: "", expectedOutput: "100\ntrue 150\ntrue 120\nfalse 120" }],
          hints: ['this._balance = initial; in the constructor.', "Guard: if (amount > this._balance) return false;"],
          explanation: "Encapsulated state with guarded mutation — rejected withdrawal leaves the balance untouched.",
        },
      ],
    },
    {
      id: "problem-solving",
      title: "Basic Problem Solving",
      difficulty: "intermediate",
      lessons: [
        {
          id: "js-ps",
          title: "From idea to working program",
          concept:
            "Restate the problem, hand-run a small example, list the algorithm steps, then write the code. JavaScript's array methods (map/filter/reduce) often turn explicit loops into one expressive line — but clarity beats cleverness.",
          syntax: "// restate -> example -> steps -> code -> test",
          exampleCode: `const tokens = input().trim().split(/\\s+/).map(Number);
const n = tokens[0];
const a = tokens.slice(1, 1 + n);
const positives = a.filter((x) => x > 0);
console.log(positives.length, positives.reduce((s, x) => s + x, 0));`,
          exampleStdin: "5\n-1 2 -3 4 5",
          exampleOutput: "3 11",
        },
      ],
      problems: [
        {
          id: "js-prog-ps",
          title: "Longest streak of ones",
          difficulty: "medium",
          prompt:
            "Read n and a line of n 0/1 values. Print the length of the longest consecutive run of 1s (0 if there are none).",
          starterCode: `const tokens = input().trim().split(/\\s+/).map(Number);
const a = tokens.slice(1); // skip the leading n
// print the longest run of 1s
`,
          samples: [
            { input: "10\n1 1 0 1 1 1 0 1 1 1", expectedOutput: "3" },
            { input: "5\n0 0 0 0 0", expectedOutput: "0" },
          ],
          hints: ["Track current run and best-so-far in one pass.", "Reset current to 0 whenever you see a 0."],
          explanation:
            "Single pass: extend the run on 1, reset on 0, keep the maximum seen — classic running-maximum pattern.",
        },
      ],
    },
  ],
};
