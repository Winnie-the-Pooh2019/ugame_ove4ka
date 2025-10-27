package com.example.sheep.presentation.controller

import com.example.sheep.application.usercase.AuthorizationUseCase
import com.example.sheep.domain.model.AuthRequest
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseCookie
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/auth")
class AuthController(
    @Autowired
    private val authCase: AuthorizationUseCase,

    @Value("\${app.cookie.name}")
    private val jwtCookieName: String,

    @Value("\${app.cookie.age}")
    private val jwtCookieAge: Long
) {
    @PostMapping("/login")
    fun login(@RequestBody authRequest: AuthRequest, request: HttpServletRequest, response: HttpServletResponse) {
        val authorizationResult = authCase.authorize(authRequest)

        val cookie = ResponseCookie.from(jwtCookieName, authorizationResult.token)
            .maxAge(jwtCookieAge)
            .path("/")
            .httpOnly(true)
            .secure(false)
            .sameSite("None")
            .build()

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString())
    }
}