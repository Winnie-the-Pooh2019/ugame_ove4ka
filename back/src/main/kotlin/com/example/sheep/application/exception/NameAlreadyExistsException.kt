package com.example.sheep.application.exception

import com.example.sheep.application.exception.core.ApplicationCommonException
import org.springframework.http.HttpStatus

class NameAlreadyExistsException(message: String = "NAME_TAKEN") : ApplicationCommonException(
    httpStatus = HttpStatus.CONFLICT,
    message = message
)