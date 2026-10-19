import type { Language } from "./types";

export const LANGUAGE_TEMPLATES: Record<Language, string> = {
  python: `print("Hello, CodeLab!")

# Read from stdin example:
# import sys
# data = sys.stdin.read()
# print(data)

def solve():
    print("Hello")

if __name__ == "__main__":
    solve()
`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeLab!");

        // Read from stdin example:
        // java.util.Scanner sc = new java.util.Scanner(System.in);
        // if (sc.hasNextLine()) System.out.println(sc.nextLine());
    }
}
`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, CodeLab!\\n");

    // Read from stdin example:
    // char buf[1024];
    // if (fgets(buf, sizeof(buf), stdin)) printf("%s", buf);

    return 0;
}
`,
  cpp: `#include <iostream>
#include <string>

int main() {
    std::cout << "Hello, CodeLab!" << std::endl;

    // Read from stdin example:
    // std::string line;
    // if (std::getline(std::cin, line)) std::cout << line << std::endl;

    return 0;
}
`,
};

export const MONACO_LANGUAGE_MAP: Record<Language, string> = {
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
};
