package com.example.sheep.application.service

import com.example.sheep.domain.model.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.*

@Service
class UserValidator(
    @Autowired
    private val encoder: PasswordEncoder
) {
    fun validate(user: User): User {
        return User(
            id = user.id ?: UUID.randomUUID(),
            username = sanitizeUsername(user.username),
            group = sanitizeGroup(user.group),
            password = encoder.encode(user.password)
        )
    }

    fun checkPassword(user: User, rawPassword: String): Boolean = encoder.matches(rawPassword, user.password)

    private fun sanitizeUsername(username: String): String {
        return username
    }

    private fun sanitizeGroup(group: String): String {
        return group
    }
}