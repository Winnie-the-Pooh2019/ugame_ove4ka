package com.example.sheep.presentation.dto

data class RegisterRequest(
    val username: String,
    val password: String,
    val group: String
)
