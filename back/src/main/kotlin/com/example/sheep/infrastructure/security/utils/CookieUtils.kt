package com.example.sheep.infrastructure.security.utils

import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseCookie
import org.springframework.stereotype.Component

@Component
class CookieUtils(
    @Value("\${app.cookie.name}")
    private val jwtCookieName: String,

    @Value("\${app.cookie.age}")
    private val jwtCookieAge: Long
) {

    fun createJwtCookie(token: String): ResponseCookie {
        return ResponseCookie.from(jwtCookieName, token)
            .maxAge(jwtCookieAge)
            .path("/")
            .httpOnly(true)
            .secure(false)
            .sameSite("None")
            .build()
    }

    fun createLogoutCookie(): ResponseCookie {
        return ResponseCookie.from(jwtCookieName, "")
            .maxAge(0)
            .path("/")
            .httpOnly(true)
            .secure(false)
            .sameSite("None")
            .build()
    }

    fun extractJwtFromCookie(request: HttpServletRequest): String? =
        request.cookies?.find { it.name == jwtCookieName }?.value
}