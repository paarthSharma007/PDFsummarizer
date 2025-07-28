'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Define types for retrieved documents and chat messages
interface Doc {
    pageContent?: string;
    metdata?: {
        loc?: {
            pageNumber?: number;
        };
        source?: string;
    };
}
interface IMessage {
    role: 'assistant' | 'user';
    content?: string;
    documents?: Doc[];
}

const ChatComponent: React.FC = () => {
    const [message, setMessage] = React.useState<string>('');
    const [messages, setMessages] = React.useState<IMessage[]>([]);

    console.log({ messages });

    const handleSendChatMessage = async () => {
        setMessages((prev) => [...prev, { role: 'user', content: message }]);
        const res = await fetch(`http://localhost:8000/chat?message=${message}`);
        const data = await res.json();
        setMessages((prev) => [
            ...prev,
            {
                role: 'assistant',
                content: data?.message,
                documents: data?.docs,
            },
        ]);
    };

    return (
        <div className="p-4">
            <div className="space-y-4 mb-24 max-h-[80vh] overflow-y-auto pr-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`rounded-xl p-4 max-w-[80%] ${msg.role === 'user'
                            ? 'ml-auto bg-blue-500 text-white'
                            : 'mr-auto bg-gray-100 text-gray-900'
                            }`}
                    >
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                            >
                                {msg.content || ''}
                            </ReactMarkdown>
                        </div>

                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex gap-3">
                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here"
                />
                <Button onClick={handleSendChatMessage} disabled={!message.trim()}>
                    Send
                </Button>
            </div>
        </div>
    );
};
export default ChatComponent;