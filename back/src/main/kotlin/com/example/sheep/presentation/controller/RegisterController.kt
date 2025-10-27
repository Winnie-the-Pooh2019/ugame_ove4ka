package com.example.sheep.presentation.controller

import com.example.sheep.application.usercase.RegisterUseCase
import com.example.sheep.domain.model.User
import com.example.sheep.presentation.dto.RegisterRequest
import com.example.sheep.presentation.dto.RegisterResponse
import com.example.sheep.presentation.mapper.UserDtoMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class RegisterController(
    @Autowired
    private val registerUseCase: RegisterUseCase,

    @Autowired
    private val userDtoMapper: UserDtoMapper
) {
    @PostMapping("register")
    fun register(@RequestBody registerRequest: RegisterRequest): ResponseEntity<RegisterResponse> {
        val result = registerUseCase
            .registerUser(registerRequest.toUser())
            .toRegisterResponse()

        return ResponseEntity.ok(result)
    }

    private fun User.toRegisterResponse() = userDtoMapper.mapToRegisterResponse(this)

    private fun RegisterRequest.toUser() = userDtoMapper.mapToDomain(this)
}