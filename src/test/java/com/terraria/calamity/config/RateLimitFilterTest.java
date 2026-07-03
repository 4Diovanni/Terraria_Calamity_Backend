package com.terraria.calamity.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class RateLimitFilterTest {

    @Test
    void withinLimit_passesRequestThrough() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/weapons");
        request.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void exceedingAuthLimit_returns429WithRetryAfter() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 5; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            request.setRemoteAddr("10.0.0.2");
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, chain);
            assertThat(response.getStatus()).isEqualTo(200);
        }

        MockHttpServletRequest sixthRequest = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        sixthRequest.setRemoteAddr("10.0.0.2");
        MockHttpServletResponse sixthResponse = new MockHttpServletResponse();
        filter.doFilter(sixthRequest, sixthResponse, chain);

        assertThat(sixthResponse.getStatus()).isEqualTo(429);
        assertThat(sixthResponse.getHeader("Retry-After")).isNotNull();
        assertThat(sixthResponse.getContentAsString()).contains("Muitas requisições");
    }

    @Test
    void differentIps_haveIndependentBuckets() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 5; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            request.setRemoteAddr("10.0.0.3");
            filter.doFilter(request, new MockHttpServletResponse(), chain);
        }

        MockHttpServletRequest otherIpRequest = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        otherIpRequest.setRemoteAddr("10.0.0.4");
        MockHttpServletResponse otherIpResponse = new MockHttpServletResponse();
        filter.doFilter(otherIpRequest, otherIpResponse, chain);

        assertThat(otherIpResponse.getStatus()).isEqualTo(200);
    }
}
