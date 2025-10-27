package com.example.sheep.application.usercase

import com.example.sheep.application.exception.InvalidPasswordException
import com.example.sheep.application.exception.NoSuchUserException
import com.example.sheep.application.service.UserValidator
import com.example.sheep.domain.model.AuthRequest
import com.example.sheep.domain.model.AuthResult
import com.example.sheep.domain.repository.UserRepository
import com.example.sheep.infrastructure.security.utils.JwtUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class AuthorizationUseCase(
    @Autowired
    private val jwtUtils: JwtUtils,
    @Autowired
    private val userRepository: UserRepository,
    @Autowired
    private val validator: UserValidator
) {

    fun authorize(authRequest: AuthRequest): AuthResult {
        val user = userRepository.findByUsername(authRequest.username)
            .orElseThrow { NoSuchUserException() }

        if (!validator.checkPassword(user, authRequest.password))
            throw InvalidPasswordException()

        val token = jwtUtils.generateToken(user.username)

        return AuthResult(token)
    }
}