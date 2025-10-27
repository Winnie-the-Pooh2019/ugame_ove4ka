package com.example.sheep.infrastructure.data.entity

import java.util.UUID

data class UserEntity(
    val id: UUID,
    val username: String,
    val password: String,
    val group: String
)
