package com.example.sheep.infrastructure.security

import com.example.sheep.domain.repository.UserRepository
import com.example.sheep.infrastructure.security.exception.InvalidCredentialsException
import com.example.sheep.infrastructure.security.model.SpringUser
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Service

@Service
class UserDetailsServiceIml(
    @Autowired
    val userRepository: UserRepository
) : UserDetailsService {
    override fun loadUserByUsername(username: String?): UserDetails {
        val nonNullUsername = username ?: throw InvalidCredentialsException()

        val user = userRepository.findByUsername(nonNullUsername)
            .orElseThrow { InvalidCredentialsException() }

        return SpringUser(
            user.username,
            user.password,
            null
        )
    }
}