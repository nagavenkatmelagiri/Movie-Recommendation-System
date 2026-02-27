package com.movie.recommendation.dto;

public class AuthResponse {

    private String token;
    private String tokenType;

    public AuthResponse() {
    }

    public AuthResponse(String token) {
        this.token = token;
        this.tokenType = "Bearer";
    }

    public AuthResponse(String token, String tokenType) {
        this.token = token;
        this.tokenType = tokenType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
}
