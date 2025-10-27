package com.example.sheep.infrastructure.security

import com.example.sheep.infrastructure.security.utils.CookieUtils
import com.example.sheep.infrastructure.security.utils.JwtUtils
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(
    @Autowired
    private val jwtUtils: JwtUtils,
    @Autowired
    private val cookieUtils: CookieUtils
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val token = cookieUtils.extractJwtFromCookie(request)

            if (token != null && jwtUtils.validateToken(token)) {
                val username = jwtUtils.extractUsername(token)

                val authentication = UsernamePasswordAuthenticationToken(username, null, null)
                authentication.details = WebAuthenticationDetailsSource().buildDetails(request)

                val securityContext = SecurityContextHolder.getContext()
                    ?: SecurityContextHolder.createEmptyContext()
                securityContext.authentication = authentication
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        filterChain.doFilter(request, response)
    }
}