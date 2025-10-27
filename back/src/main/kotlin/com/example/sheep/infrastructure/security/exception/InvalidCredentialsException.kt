package com.example.sheep.infrastructure.security.exception

import com.example.sheep.application.exception.core.ApplicationCommonException
import org.springframework.http.HttpStatus

class InvalidCredentialsException(message: String = "Invalid credentials") : ApplicationCommonException(
    httpStatus = HttpStatus.CONFLICT,
    message = message
)