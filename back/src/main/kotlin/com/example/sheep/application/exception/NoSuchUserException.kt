package com.example.sheep.application.exception

import com.example.sheep.application.exception.core.ApplicationCommonException
import org.springframework.http.HttpStatus

class NoSuchUserException(message: String = "NAME_TAKEN") : ApplicationCommonException(
    httpStatus = HttpStatus.NOT_FOUND,
    message = message
)