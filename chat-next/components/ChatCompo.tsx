'use client';

import React, { useState, useEffect, useRef, MutableRefObject } from "react";
import MarkdownViewer from "./MarkdownViewer";

import gptLogo from '../public/images/gpt_logo.png';
import Image from "next/image";
import "../styles/GPTStream.css"

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

let socket: WebSocket;
// let hcxContent: string = '';
const gptWelcomeText = '안녕하세요. 무엇을 도와드릴까요?';

const ChatCompo = () => {
    const [messages, setMessages] = useState<Message[]>([
        { 'role': 'assistant', 'content': gptWelcomeText },
    ]);
    const [input, setInput] = useState<string>('');
    const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
    const [hcxContent, setHcxContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleSetMessages = () => {
        console.log('handleSetMessages 호출')
        setMessages([
            ...messages,
            { role: 'user', content: input },
            { 'role': 'assistant', 'content': hcxContent }
        ]);
    };

    useEffect(() => {
        socket = new WebSocket('ws://localhost:9999/hcx');
        socket.onopen = () => {
            console.log('Connected to server');
            // setIsWsConnected(true);
        };
        // onmessage 때마다 messages상태가 바뀌어야 함
        // 첫 onmessage 이후 ㄹ
        socket.onmessage = (event) => {
            const msg = event.data;
            console.log('received_msg:', msg, '  시각:', Date.now(), '\ninput:', input);
            if (msg !== 'hcx finished') {
                // setHcxContent(msg);
                const msgData = JSON.parse(msg)
                setMessages(msgData.msgs);
                // handleSetMessages();
            } else {
                // 파이썬 서버에서 메시지를 모두 보냄을 확인했을 때 load false임을 전송
                setIsLoading(false);
            }

        }

        socket.onclose = () => {
            console.log('disconnected from server');
            setIsWsConnected(!isWsConnected);
            setInput('');
            // console.log(messages);
        
        }

    }, [isWsConnected, hcxContent]);

    useEffect(() => {
        scrollToBottom();
        inputRef.current.focus();
        
    }, [messages]);

    const sendMessage = (jsonData: string) => {
        // 서버에 데이터(대화 내역)를 전송할 때에는 
        // 클라이언트에서 모두 작업이 끝난 후여야 함
        socket.send(jsonData);
    }

    const getHCXResponse = () => {
        const messagesData = [...messages, { role: 'user', content: input }];
        const jsonData = JSON.stringify({ msgs: messagesData });
        sendMessage(jsonData);
        // setIsLoading(false);
    };

    const handleSend = async () => {
        if (input.trim() && !isLoading) {
            setMessages([
                ...messages,
                { 'role': 'user', 'content': input },
            ]);
            setIsLoading(true);
            getHCXResponse();
        }
        setInput('');
        inputRef.current.style.height = 'auto';
    }

    const handleInputChange = (e) => {
        setInput(e.target.value);
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
            e.preventDefault();
            handleSend();
        }
    }

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    return (
        <div className="chat-window">
            <div className="messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.role === 'assistant' ?
                            <>
                                <Image src={gptLogo} alt="gpt-logo" className="gpt-logo"></Image>
                                <MarkdownViewer markdownText={msg.content}></MarkdownViewer>
                            </> :
                            msg.content
                        }
                    </div>
                ))}
                <div ref={messagesEndRef}></div>
            </div>
            <div className="input-area">
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    // disabled={isLoading}
                    ref={inputRef}
                    rows={1}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                >입력</button>
            </div>
        </div>
    );
}

export default ChatCompo;