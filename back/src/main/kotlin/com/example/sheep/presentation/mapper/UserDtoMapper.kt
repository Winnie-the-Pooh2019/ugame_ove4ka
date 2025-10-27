package com.example.sheep.presentation.mapper

import com.example.sheep.domain.model.User
import com.example.sheep.presentation.dto.RegistrationDto
import org.springframework.stereotype.Component

@Component
class UserDtoMapper {
    fun mapToDto(user: User) = RegistrationDto(
        username = user.username,
        password = user.password,
        group = user.group
    )

    fun mapToDomain(registrationDto: RegistrationDto) = User(
        username = registrationDto.username,
        password = registrationDto.password,
        group = registrationDto.group
    )
}