package com.example.sheep.presentation.controller.advice

import com.example.sheep.application.exception.core.ApplicationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalControllerAdvice {
    @ExceptionHandler(
        value = [
            RuntimeException::class,
            Exception::class
        ]
    )
    fun handleException(e: Exception): ResponseEntity<String> {
        val status = when (e) {
            is ApplicationException -> e.httpStatus

            is RuntimeException -> HttpStatus.BAD_REQUEST

            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }

        return ResponseEntity(e.message, status)
    }
}