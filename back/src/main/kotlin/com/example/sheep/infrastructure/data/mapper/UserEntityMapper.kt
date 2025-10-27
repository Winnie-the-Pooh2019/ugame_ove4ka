package com.example.sheep.infrastructure.data.mapper

import com.example.sheep.infrastructure.data.model.UserEntity
import com.example.sheep.domain.model.User
import org.springframework.stereotype.Component
import java.util.*

@Component
class UserEntityMapper {
    fun mapToEntity(user: User) = UserEntity(
        id = user.id ?: UUID.randomUUID(),
        username = user.username,
        password = user.password,
        group = user.group
    )

    fun mapToDomain(userEntity: UserEntity) = User(
        id = userEntity.id,
        username = userEntity.username,
        password = userEntity.password,
        group = userEntity.group
    )
}