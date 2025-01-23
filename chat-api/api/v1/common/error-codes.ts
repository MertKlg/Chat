const errorCodes = {
    /* USERNAME ERRORS */
    USERNAME_EMPTY : "Username cannot be empty",
    USERNAME_LENGHT : "Username must be at least 3 and at most 12",
    USERNAME_ALREADY_USING : "This username already exists",

    /* EMAIL ERRORS */
    EMAIL_EMPTY : "Email cannot be empty",
    EMAIL_ALREADY_USING : "This email already exists",
    VALIDATE_EMAIL : "Email cannot validated, send an validated email",

    /* PASSWORD ERRORS */
    PASSWORD_WEAK : "The password must contain 6 characters, 1 lower case letter, 1 upper case letter, 1 number and 1 symbol",
    PASSWORDS_NOT_SAME : "Passwords are not the same"
}

export default errorCodes