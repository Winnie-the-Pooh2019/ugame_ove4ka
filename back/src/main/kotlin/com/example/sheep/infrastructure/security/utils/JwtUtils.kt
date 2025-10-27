package com.example.sheep.infrastructure.security.utils

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtUtils(
    @Value("\${app.jwt.secret}")
    private val secret: String,

    @Value("\${app.jwt.age}")
    private val expiration: Long
) {

    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))
    }

    fun generateToken(username: String): String = Jwts.builder()
            .subject(username)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + expiration))
            .signWith(key)
            .compact()

    fun validateToken(token: String): Boolean = try {
        Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)

        true
    } catch (e: Exception) {
        false
    }

    fun extractUsername(token: String): String = extractClaims(token).subject

    private fun extractClaims(token: String): Claims = Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)
        .payload
}