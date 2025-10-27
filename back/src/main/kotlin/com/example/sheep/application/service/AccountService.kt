package com.example.sheep.application.service

import com.example.sheep.application.exception.NameAlreadyExistsException
import com.example.sheep.domain.model.User
import com.example.sheep.domain.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class AccountService(
    @Autowired
    private val userRepository: UserRepository
) {
    fun registerUser(user: User): User {
        val currentUser = userRepository
            .findByName(user.username)
            .orElse(null)

        if (currentUser != null) {
            throw NameAlreadyExistsException()
        }

        return userRepository.save(user)
    }

    fun loginUser(user: User): User {
        userRepository.findById(user.id!!).let {
            if (it.isPresent) {
                return it.get()
            } else {
                throw Exception("아이디 또는 비밀번호가 잘못되었습니다.")
            }
        }
    }
}