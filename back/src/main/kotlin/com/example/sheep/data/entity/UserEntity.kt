package com.example.sheep.data.entity

import java.util.UUID

data class UserEntity(
    val id: UUID,
    val name: String,
    val group: String
)
