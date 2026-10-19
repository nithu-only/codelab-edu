package com.codelab.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ExecutionRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    @Test
    void validRequestShouldPass() {
        ExecutionRequest req = new ExecutionRequest("python", "print('hello')", "input");
        Set<ConstraintViolation<ExecutionRequest>> violations = validator.validate(req);
        assertTrue(violations.isEmpty(), "Expected no violations but got: " + violations);
    }

    @Test
    void validLanguageCaseInsensitive() {
        for (String lang : new String[]{"Python", "JAVA", "C", "Cpp", "CPP", "cPP"}) {
            ExecutionRequest req = new ExecutionRequest(lang, "code", null);
            Set<ConstraintViolation<ExecutionRequest>> violations = validator.validate(req);
            assertTrue(violations.isEmpty(), "Language " + lang + " should be valid, got: " + violations);
        }
    }

    @Test
    void invalidLanguageShouldFail() {
        ExecutionRequest req = new ExecutionRequest("ruby", "code", null);
        Set<ConstraintViolation<ExecutionRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("language")));
    }

    @Test
    void blankLanguageShouldFail() {
        ExecutionRequest req = new ExecutionRequest("   ", "code", null);
        Set<ConstraintViolation<ExecutionRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void blankSourceCodeShouldFail() {
        ExecutionRequest req = new ExecutionRequest("python", "", null);
        Set<ConstraintViolation<ExecutionRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("sourceCode")));
    }

    @Test
    void nullSourceCodeShouldFail() {
        ExecutionRequest req = new ExecutionRequest("python", null, null);
        Set<ConstraintViolation<ExecutionRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void sourceCodeTooLargeShouldFail() {
        String large = "a".repeat(102401);
        ExecutionRequest req = new ExecutionRequest("python", large, null);
        Set<ConstraintViolation<ExecutionRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("100KB")));
    }

    @Test
    void sourceCodeExactly100KBShouldPass() {
        String exact = "a".repeat(102400);
        ExecutionRequest req = new ExecutionRequest("python", exact, null);
        Set<ConstraintViolation<ExecutionRequest>> violations = validator.validate(req);
        assertTrue(violations.isEmpty(), "Exactly 102400 chars should pass, got: " + violations);
    }

    @Test
    void stdinNullShouldBeAllowed() {
        ExecutionRequest req = new ExecutionRequest("python", "code", null);
        Set<ConstraintViolation<ExecutionRequest>> violations = validator.validate(req);
        assertTrue(violations.isEmpty());
        assertEquals("", req.getStdinOrDefault());
    }

    @Test
    void languageNormalization() {
        ExecutionRequest req = new ExecutionRequest("  PyThOn  ", "code", null);
        assertEquals("python", req.getNormalizedLanguage());
    }
}
