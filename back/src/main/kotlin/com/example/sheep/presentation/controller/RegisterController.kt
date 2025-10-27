package com.example.sheep.presentation.controller

import com.example.sheep.application.usercase.RegisterUser
import com.example.sheep.domain.model.User
import com.example.sheep.presentation.dto.RegisterResponse
import com.example.sheep.presentation.dto.RegistrationDto
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
    fun register(@RequestBody registrationDto: RegistrationDto): ResponseEntity<RegisterResponse> {
        val user = registerUser
            .registerUser(registrationDto.toUser())
            .toRegistrationDto()

        return ResponseEntity
            .ok(RegisterResponse(user))
    }

    private fun RegistrationDto.toUser() = userDtoMapper.mapToDomain(this)

    private fun User.toRegistrationDto() = userDtoMapper.mapToDto(this)
}