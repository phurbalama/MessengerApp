package com.phurbalama.chatroom.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        //adding stomp endpoint to /ws prefix and allowing resources from all origin with sockjs which provides websocket like object and gives low latency durring communication
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        //application destination prefix with /app
        registry.setApplicationDestinationPrefixes("/app");
        //all topic prefix which is for chatroom for public and private for user
        registry.enableSimpleBroker("/chatroom","/user");
        //user destination prefix to /user
        registry.setUserDestinationPrefix("/user");
    }
}
