package com.example.sheep.application.service

import org.springframework.stereotype.Service

@Service
class UserValidator {
    fun sanitizeUsername(username: String): String {
        return username
    }

    fun sanitizeGroup(group: String): String {
        return group
    }
}