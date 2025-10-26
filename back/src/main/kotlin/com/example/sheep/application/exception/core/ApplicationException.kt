package com.example.sheep.application.exception.core

import org.springframework.http.HttpStatus

interface ApplicationException {
    val httpStatus: HttpStatus
    val message: String
}