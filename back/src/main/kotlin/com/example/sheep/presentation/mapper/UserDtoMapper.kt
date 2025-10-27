package com.example.sheep.presentation.mapper

import com.example.sheep.domain.model.User
import com.example.sheep.presentation.dto.RegisterRequest
import com.example.sheep.presentation.dto.RegisterResponse
import org.springframework.stereotype.Component

@Component
class UserDtoMapper {
    fun mapToRegisterResponse(user: User) = RegisterResponse(
        userId = user.id.toString()
    )

    fun mapToDomain(registerRequest: RegisterRequest) = User(
        username = registerRequest.username,
        password = registerRequest.password,
        group = registerRequest.group
    )
}