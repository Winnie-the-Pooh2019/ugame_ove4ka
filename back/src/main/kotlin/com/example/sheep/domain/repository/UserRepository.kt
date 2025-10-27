package com.example.sheep.domain.repository

import com.example.sheep.domain.model.User
import java.util.*

interface UserRepository {
    fun save(user: User): User
    fun findAll(): List<User>
    fun findById(id: UUID): Optional<User>
    fun findByUsername(username: String): Optional<User>
}