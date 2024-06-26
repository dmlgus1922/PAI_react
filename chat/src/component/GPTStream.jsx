import React, { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import MarkdownViewer from "./MarkdownViewer";
import "../css/GPTStream.css"
import gptLogo from '../images/gpt_logo.png';

// 서버 없이 클라이언트에서 바로 key를 적용, openai API 연동해보기
const openAIKey = '';
const openai = new OpenAI({ apiKey: openAIKey, dangerouslyAllowBrowser: true });
const model = 'gpt-4o'
const markdownPrompt = '일상 대화를 하되, 설명을 하는 부분이 있다면 마크다운 형식으로 제공해야 한다.';
const gptWelcomeText = '안녕하세요. 무엇을 도와드릴까요?';

const GPTStream = () => {
    const [messages, setMessages] = useState([
        { 'role': 'system', 'content': markdownPrompt },
        { 'role': 'assistant', 'content': gptWelcomeText },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const getGPTResponse = async () => {
        try {
            const stream = await openai.chat.completions.create({
                model: model,
                messages: [
                    ...messages,
                    { role: 'user', content: input }
                ],
                stream: true,
                // max_tokens: 150,
            });

            const gptMessage = { 'role': 'assistant', 'content': '' };
            setMessages([
                ...messages,
                gptMessage
            ]);

            let gptContent = '';
            // const stopWord = '```markdown';
            for await (const chunk of stream) {
                let word = chunk.choices[0]?.delta?.content || '';
                // word = word.includes(stopWord) ? word.replace(stopWord, '') : word;

                gptContent += word;
                setMessages([
                    ...messages,
                    { 'role': 'user', 'content': input },
                    { 'role': 'assistant', 'content': gptContent }
                ]);
            }

        } catch (err) {
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {

        if (input.trim() && !isLoading) {
            setMessages([
                ...messages,
                { 'role': 'user', 'content': input },
            ]);
            setIsLoading(true);
            getGPTResponse();
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect(() => {
        scrollToBottom();
        inputRef.current.focus();
    }, [messages]);

    return (
        <div className="chat-window">
            <div className="messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.role === 'assistant' ?
                            <>
                                <img className="gpt-logo" src={gptLogo}></img>
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
                    rows='1'
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                >입력</button>
            </div>
        </div>
    );
}

export default GPTStream;