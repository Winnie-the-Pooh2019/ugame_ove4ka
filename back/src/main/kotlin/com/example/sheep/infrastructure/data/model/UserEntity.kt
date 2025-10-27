package com.example.sheep.infrastructure.data.model

import java.util.*

data class UserEntity(
    val id: UUID? = null,
    val username: String,
    val password: String,
    val group: String
)
