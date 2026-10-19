package com.codelab.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Supported languages. Case-insensitive parsing normalized to lower-case.
 */
public enum Language {
    PYTHON("python"),
    JAVA("java"),
    C("c"),
    CPP("cpp");

    private final String value;

    Language(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Language fromString(String input) {
        if (input == null) {
            return null;
        }
        String normalized = input.trim().toLowerCase();
        for (Language lang : values()) {
            if (lang.value.equals(normalized)) {
                return lang;
            }
            // also accept "c++" as alias for cpp
            if (lang == CPP && (normalized.equals("c++") || normalized.equals("cpp"))) {
                return CPP;
            }
        }
        throw new IllegalArgumentException("Unsupported language: " + input);
    }

    public static boolean isSupported(String input) {
        if (input == null) return false;
        String normalized = input.trim().toLowerCase();
        return getSupportedValues().contains(normalized);
    }

    public static Set<String> getSupportedValues() {
        return Arrays.stream(values())
                .map(Language::getValue)
                .collect(Collectors.toSet());
    }

    public static String allowedValuesString() {
        return Arrays.stream(values())
                .map(Language::getValue)
                .collect(Collectors.joining(", "));
    }
}
