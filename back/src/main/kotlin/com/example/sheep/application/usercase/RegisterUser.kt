package com.example.sheep.application.usercase

import com.example.sheep.application.service.AccountService
import com.example.sheep.application.service.UserValidator
import com.example.sheep.domain.model.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class RegisterUser(
    @Autowired
    private val accountService: AccountService,
    @Autowired
    private val validator: UserValidator
) {
    fun registerUser(user: User): User {
        val newUser = User(
            user.id,
            validator.sanitizeUsername(user.username),
            validator.sanitizeGroup(user.group)
        )

        return accountService.registerUser(newUser)
    }
}