package com.example.sheep.data.mapper

import com.example.sheep.data.entity.UserEntity
import com.example.sheep.domain.model.User
import org.springframework.stereotype.Component
import java.util.*

@Component
class UserEntityMapper {
    fun mapToEntity(user: User) = UserEntity(
        id = user.id ?: UUID.randomUUID(),
        name = user.name,
        group = user.group
    )

    fun mapToDomain(userEntity: UserEntity) = User(
        id = userEntity.id,
        name = userEntity.name,
        group = userEntity.group
    )
}