package com.example.sheep.presentation.dto

data class RegisterResponse(
    val player: RegistrationDto,
    val ok: Boolean = true
)
