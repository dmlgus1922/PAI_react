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

const gptWelcomeText = '안녕하세요. 무엇을 도와드릴까요?';

const ChatCompo = () => {
    const [messages, setMessages] = useState<Message[]>([
        { 'role': 'assistant', 'content': gptWelcomeText },
    ]);
    const [input, setInput] = useState<string>('');
    const [hcxContent, setHcxContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        socket = new WebSocket('ws://localhost:9999/hcx');
        socket.onopen = () => {
            console.log('Connected to server');
        };

        socket.onmessage = (event) => {
            const msg = event.data;
            if (msg !== 'hcx finished') {
                setHcxContent(hcxContent + msg);
                console.log(hcxContent);
                setIsLoading(false);

            } else {
                // 파이썬 서버에서 메시지를 모두 보냄을 확인했을 때 load false임을 전송
                setIsLoading(false);
            }
        }

        socket.onclose = () => {
            console.log('disconnected from server');
        }
        
        scrollToBottom();
        inputRef.current.focus();
        // return () => {
        //     socket.close();
        // }
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