package com.example.sheep.data.repository

import com.example.sheep.data.entity.UserEntity
import com.example.sheep.data.mapper.UserEntityMapper
import com.example.sheep.domain.model.User
import com.example.sheep.domain.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class InMemoryUserRepository(
    @Autowired
    private val userEntityMapper: UserEntityMapper
) : UserRepository {
    private val _users = mutableListOf<UserEntity>()

    override fun save(user: User) = user.apply { _users.add(this.toEntity()) }

    override fun findAll(): List<User> = _users.map { it.toDomain() }

    override fun findById(id: UUID): Optional<User> = Optional.ofNullable(
        _users.firstOrNull { it.id == id }?.toDomain()
    )

    override fun findByName(name: String): Optional<User> = Optional.ofNullable(
        _users.firstOrNull { it.name == name }?.toDomain()
    )

    private fun User.toEntity() = userEntityMapper.mapToEntity(this)

    private fun UserEntity.toDomain() = userEntityMapper.mapToDomain(this)
}