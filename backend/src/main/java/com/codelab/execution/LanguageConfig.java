package com.codelab.execution;

import java.util.List;

/**
 * Language-specific Docker image, filename and container command.
 * Container commands use /workspace as source mount and /tmp (tmpfs exec) for build artifacts.
 */
public enum LanguageConfig {

    PYTHON("python", "python:3.11-slim", "main.py",
            List.of("python3", "/workspace/main.py")),

    JAVA("java", "eclipse-temurin:17", "Main.java",
            List.of("sh", "-c", "javac /workspace/Main.java -d /tmp && java -cp /tmp Main")),

    C("c", "gcc:13", "main.c",
            List.of("sh", "-c", "gcc /workspace/main.c -o /tmp/a.out && /tmp/a.out")),

    CPP("cpp", "gcc:13", "main.cpp",
            List.of("sh", "-c", "g++ /workspace/main.cpp -o /tmp/a.out && /tmp/a.out"));

    private final String language;
    private final String image;
    private final String filename;
    private final List<String> containerCommand;

    LanguageConfig(String language, String image, String filename, List<String> containerCommand) {
        this.language = language;
        this.image = image;
        this.filename = filename;
        this.containerCommand = containerCommand;
    }

    public String getLanguage() {
        return language;
    }

    public String getImage() {
        return image;
    }

    public String getFilename() {
        return filename;
    }

    public List<String> getContainerCommand() {
        return containerCommand;
    }

    public static LanguageConfig fromNormalized(String normalized) {
        for (LanguageConfig c : values()) {
            if (c.language.equals(normalized)) {
                return c;
            }
            // alias for c++ -> cpp
            if (c == CPP && normalized.equals("c++")) {
                return CPP;
            }
        }
        throw new IllegalArgumentException("Unsupported language: " + normalized);
    }

    public static boolean isSupported(String normalized) {
        if (normalized == null) return false;
        String n = normalized.trim().toLowerCase();
        for (LanguageConfig c : values()) {
            if (c.language.equals(n)) return true;
        }
        return n.equals("c++");
    }
}
