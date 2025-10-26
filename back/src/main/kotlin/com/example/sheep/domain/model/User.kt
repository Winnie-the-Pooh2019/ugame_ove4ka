package com.example.sheep.domain.model

import java.util.*

data class User(
    val id: UUID? = null,
    val name: String,
    val group: String
)
