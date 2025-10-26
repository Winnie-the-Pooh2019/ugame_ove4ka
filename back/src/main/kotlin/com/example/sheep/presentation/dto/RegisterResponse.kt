package com.example.sheep.presentation.dto

data class RegisterResponse(
    val player: UserDto,
    val ok: Boolean = true
)
