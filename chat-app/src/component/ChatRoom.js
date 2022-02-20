import React, { useEffect, useState } from 'react'
import {over} from 'stompjs'
import SockJS from 'sockjs-client'

var stompClient = null;
function ChatRoom() {
    const [publicChats, setPublicChats] = useState([])
    const [privateChats, setPrivateChats] = useState(new Map())
    //tab to keep track of user and public chatbox
    const [tab, setTab] = useState("CHATROOM")
    const[userData,setUserData] = useState({
        username:"",
        receiverName:"",
        connected:false,
        message:""
    })

    useEffect(() => {
      console.log(privateChats)
        
    }, [userData])
    

    const handleValue = (event) =>{
        const {value,name} = event.target;
        setUserData({...userData,[name]:value})
    }

     const handleMessage = (event) =>{
        const {value} = event.target;
        setUserData({...userData,"message":value})
    }
    //first time registering to the chat app 
    const registerUser = ()=>{
        //connects to stomp endpoint /ws creating instance of SockJS and connect using stomp client
        let Sock = new SockJS("http://localhost:8080/ws");
        stompClient = over(Sock);
        stompClient.connect({},onConnected,onError);

    }
    const onError = (err) =>{
        console.log(err);
    }

    const onConnected = () =>{
        //when user first connects, updates the connected to true
        setUserData({...userData,"connected":true});
        //subscribes to the public chat
        stompClient.subscribe('/chatroom/public',onPublicMessageReceived);
        //subscribes to private user
        stompClient.subscribe('/user/'+userData.username+'/private',onPrivateMessageReceived);
        userJoin();

    }

    const userJoin = () =>{
        let chatMessage={
            senderName:userData.username,
            status:"JOIN"
        };
        stompClient.send("/app/message",{},JSON.stringify(chatMessage));
    }

    const onPublicMessageReceived = (payload) =>{
        let payloadData = JSON.parse(payload.body);
        //using switch condition to check whether the payload status is message or join
        switch(payloadData.status){
            case "JOIN":
                if(!privateChats.get(payloadData.senderName)){
                privateChats.set(payloadData.senderName,[]);
                setPrivateChats(new Map(privateChats));
        }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
        }
    }

    const onPrivateMessageReceived = (payload) =>{
        let payloadData = JSON.parse(payload.body);
        if(privateChats.get(payloadData.senderName)){
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        }else{
            let list = [];
            list.push(payloadData);
            privateChats.set(payloadData.senderName,list);
            setPrivateChats(new Map(privateChats));
        }

    }

    const sendPublicMessage=()=>{
        if(stompClient){
            let chatMessage={
                senderName:userData.username,
                message:userData.message,
                status:"MESSAGE"
            };
            stompClient.send("/app/message",{},JSON.stringify(chatMessage));
            setUserData({...userData,"message":""});

        }

    }

    const sendPrivateMessage=()=>{
        if(stompClient){
            let chatMessage={
                senderName:userData.username,
                receiverName:tab,
                message:userData.message,
                status:"MESSAGE"
            };
            if(userData.username !== tab){
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.send("/app/private-message",{},JSON.stringify(chatMessage));
            setUserData({...userData,"message":""});

        }

    }
  return (
    <div className="container">
         
        {userData.connected?
        <div className="chat-box">
            <div className="member-list">
                <ul>
                    <li onClick={()=>{setTab("CHATROOM")}} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
                    {[...privateChats.keys()].map((name,index)=>(
                        <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>
                            {name}
                        </li>
                    ))}

                </ul>
            </div>
            {
            //if current Tab is Chat room then publicChatData will be populated 
            tab==="CHATROOM" && <div className="chat-content">
                <ul className="chat-messages">
                {publicChats.map((chat,index)=>(
                    <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                        {chat.senderName !==userData.username && <div className="avatar">{chat.senderName}</div>}
                        <div className="message-data">{chat.message}</div>
                        {chat.senderName ===userData.username && <div className="avatar self">{chat.senderName}</div>}
                    </li>
                ))}
                </ul>

                {
                //Input messages sent on public chat room by user
                }
                <div className="send-message">
                    <input type="text" className="input-message" placeholder="enter public message" value={userData.message} onChange={handleMessage}/>
                    <button type="button" className="send-button" onClick={sendPublicMessage}>send</button>
                </div>
            </div>}
            {tab!=="CHATROOM" && <div className="chat-content">
                <ul className="chat-messages">
                {//if the current tab is not public ChatRoom then it accesses the specific private user Chat
                [...privateChats.get(tab)].map((chat,index)=>(
                    <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                        {chat.senderName !==userData.username && <div className="avatar">{chat.senderName}</div>}
                        <div className="message-data">{chat.message}</div>
                        {chat.senderName ===userData.username && <div className="avatar self">{chat.senderName}</div>}
                    </li>
                ))}
                </ul>
                {
                //Input messages sent on public chat room by user
                }
                <div className="send-message">
                    <input type="text" className="input-message" name="message" placeholder={`enter private message for ${tab}`} value={userData.message} onChange={handleMessage}/>
                    <button type="button" className="send-button" onClick={sendPrivateMessage}>send</button>
                </div>

            </div>}
        </div>
        :
        <div className="register">
            <input
            id="user-name"
            name="username"
            placeholder="Enter the user name"
            value={userData.username}
            onChange={handleValue}
            />
            <button type='button' onClick={registerUser}>Connect</button>
            
        </div>    }

    </div>
  )
}

export default ChatRoom