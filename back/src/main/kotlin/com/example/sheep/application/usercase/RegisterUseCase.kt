package com.example.sheep.application.usercase

import com.example.sheep.application.exception.NameAlreadyExistsException
import com.example.sheep.application.service.UserValidator
import com.example.sheep.domain.model.User
import com.example.sheep.domain.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class RegisterUseCase(
    @Autowired
    private val validator: UserValidator,
    @Autowired
    private val userRepository: UserRepository
) {
    fun registerUser(user: User): User {
        val userCopy = validator.validate(user)

        val currentUser = userRepository
            .findByUsername(userCopy.username)
            .orElse(null)

        if (currentUser != null)
            throw NameAlreadyExistsException()

        return userRepository.save(userCopy)
    }
}