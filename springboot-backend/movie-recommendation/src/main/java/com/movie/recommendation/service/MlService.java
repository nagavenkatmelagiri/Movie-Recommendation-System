package com.movie.recommendation.service;

import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class MlService {

    private final RestTemplate restTemplate;

    public MlService() {
        this.restTemplate = new RestTemplate();
    }

    public List<Map<String, Object>> getRecommendations(Long userId) {

        String url = "http://localhost:8000/recommend/" + userId;

        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {
                }
        );

        return response.getBody() != null ? response.getBody() : List.of();
    }

    public List<Map<String, Object>> searchMovies(String query) {
        String url = UriComponentsBuilder
                .newInstance()
                .scheme("http")
                .host("localhost")
                .port(8000)
                .path("/search")
                .queryParam("q", query)
                .toUriString();

        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {
                }
        );

        return response.getBody() != null ? response.getBody() : List.of();
    }
}