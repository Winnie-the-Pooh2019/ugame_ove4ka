package com.example.sheep.presentation.mapper

import com.example.sheep.domain.model.User
import com.example.sheep.presentation.dto.UserDto
import org.springframework.stereotype.Component

@Component
class UserDtoMapper {
    fun mapToDto(user: User) = UserDto(
        name = user.name,
        group = user.group
    )

    fun mapToDomain(userDto: UserDto) = User(
        name = userDto.name,
        group = userDto.group
    )
}