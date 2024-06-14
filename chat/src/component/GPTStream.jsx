import React, { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import MarkdownViewer from "./MarkdownViewer";
import "../css/GPTStream.css"

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
    const inputRef = useRef();

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
        setMessages([
            ...messages,
            { 'role': 'user', 'content': input },
        ]);

        if (input.trim() && !isLoading) {
            setIsLoading(true);
            getGPTResponse();
        }
        setInput('');
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
                            <MarkdownViewer markdownText={msg.content}></MarkdownViewer> :
                            msg.content
                        }
                    </div>
                ))}
                <div ref={messagesEndRef}></div>
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isLoading}
                    ref={inputRef}
                />
                <button onClick={handleSend}>입력</button>
            </div>
        </div>
    );
}

export default GPTStream;