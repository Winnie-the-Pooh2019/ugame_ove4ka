package com.example.sheep.application.exception

import com.example.sheep.application.exception.core.ApplicationCommonException
import org.springframework.http.HttpStatus

class InvalidPasswordException(message: String = "NAME_TAKEN") : ApplicationCommonException(
    httpStatus = HttpStatus.BAD_REQUEST,
    message = message
)