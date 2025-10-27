package com.example.sheep.domain.model

import java.util.*

data class User(
    val id: UUID? = null,
    val username: String,
    val password: String,
    val group: String
)
