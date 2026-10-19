package com.codelab.validation;

import com.codelab.model.Language;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class LanguageValidator implements ConstraintValidator<ValidLanguage, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // @NotBlank will handle null/blank; we consider null valid here to avoid duplicate errors
        if (value == null || value.isBlank()) {
            return true;
        }
        return Language.isSupported(value);
    }
}
