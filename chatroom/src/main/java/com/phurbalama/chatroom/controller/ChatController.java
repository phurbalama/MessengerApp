package com.phurbalama.chatroom.controller;

import com.phurbalama.chatroom.controller.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/message") // clinet sends message through this prefix /app/message
    @SendTo("/chatroom/public") // sends the received message to /chatroom/public prefix
    public Message receivePublicMessage(@Payload Message message){
        return message;
    }

    @MessageMapping("/private-message") // client send private message here
    public Message receivePrivateMessage(@Payload Message message){
        //automatically takes user destination prefix that was provided in websocket config and send to the prefix
        simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(),"/private",message); // /user/lama/private
        return message;
    }
}
