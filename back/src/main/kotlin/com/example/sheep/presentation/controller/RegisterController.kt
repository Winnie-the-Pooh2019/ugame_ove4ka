package com.example.sheep.presentation.controller

import com.example.sheep.application.usercase.RegisterUser
import com.example.sheep.domain.model.User
import com.example.sheep.presentation.dto.RegisterResponse
import com.example.sheep.presentation.dto.UserDto
import com.example.sheep.presentation.mapper.UserDtoMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class RegisterController(
    @param:Autowired
    private val registerUser: RegisterUser,
    @param:Autowired
    private val userDtoMapper: UserDtoMapper
) {
    @PostMapping("register")
    fun register(@RequestBody userDto: UserDto): ResponseEntity<RegisterResponse> {
        val user = registerUser
            .registerUser(userDto.toUser())
            .toUserDto()

        return ResponseEntity
            .ok(RegisterResponse(user))
    }

    private fun UserDto.toUser() = userDtoMapper.mapToDomain(this)

    private fun User.toUserDto() = userDtoMapper.mapToDto(this)
}