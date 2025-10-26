package com.example.sheep.application.exception.core

import org.springframework.http.HttpStatus

abstract class ApplicationCommonException(override val httpStatus: HttpStatus, override val message: String) :
    ApplicationException,
    RuntimeException(message)