package com.example.sheep.presentation.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class RegisterResponse(
    @JsonProperty("user_id")
    val userId: String
)
