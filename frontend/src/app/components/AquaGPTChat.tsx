import { useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export function AquaGPTChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "Hello! I'm AquaGPT, your aquaculture AI assistant. How can I help you optimize your farm today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "I understand your question. Based on current water parameters, I recommend monitoring dissolved oxygen levels closely. Would you like specific recommendations for your current setup?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900/95 backdrop-blur-xl border border-teal-500/30 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Glass effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-teal-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AquaGPT Assistant</h3>
                  <p className="text-xs text-teal-400">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.type === "user"
                      ? "bg-purple-500/20"
                      : "bg-teal-500/20"
                  }`}>
                    {message.type === "user" ? (
                      <User className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-teal-400" />
                    )}
                  </div>
                  <div className={`flex-1 max-w-[80%] ${message.type === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block px-4 py-2 rounded-lg ${
                      message.type === "user"
                        ? "bg-purple-500/20 text-white"
                        : "bg-slate-800/50 text-slate-200"
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-teal-500/20">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask AquaGPT anything..."
                  className="flex-1 bg-slate-800/50 border-teal-500/30 text-white placeholder:text-slate-500"
                />
                <Button
                  onClick={handleSend}
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
