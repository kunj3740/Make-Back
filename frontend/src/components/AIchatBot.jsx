import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader, Sparkles, Database, Copy, Check, AlertCircle } from 'lucide-react';
import { BACKEND_URL } from '../config';

const AIChatbot = ({ isOpen, onClose, onGenerateDiagram, entities, setEntities }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI Database Schema Generator. Describe your database requirements and I'll create the diagram for you.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // API base URL - adjust this to your backend URL
  const API_BASE_URL = BACKEND_URL;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update welcome message based on existing entities
  useEffect(() => {
    if (isOpen) {
      const hasExistingEntities = entities && entities.length > 0;
      const welcomeMessage = hasExistingEntities
        ? `Hi! I'm your AI Database Schema Generator. I can see you already have ${entities.length} table(s) in your diagram: ${entities.map(e => e.name).join(', ')}. Describe what you'd like to add or modify, and I'll update your schema accordingly.`
        : "Hi! I'm your AI Database Schema Generator. Describe your database requirements and I'll create the diagram for you.";
      
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: welcomeMessage,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, entities]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = inputValue;
    setInputValue('');
    setIsGenerating(true);
    setError(null);

    try {
      // Prepare the request payload with existing entities as context
      const requestPayload = {
        prompt: currentPrompt
      };

      // Add existing entities as context if they exist
      if (entities && entities.length > 0) {
        requestPayload.existingEntities = entities;
        requestPayload.contextPrompt = `Current database schema contains ${entities.length} table(s): ${entities.map(e => `${e.name} (${e.attributes.length} attributes)`).join(', ')}. Please consider this existing schema when processing the new request.`;
      }

      // Call the backend API
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-schema`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to generate schema');
      }

      const data = await response.json();
      
      if (!data.success || !data.schema) {
        throw new Error('Invalid response from server');
      }

      const generatedEntities = data.schema;
      
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Great! I've generated a database schema based on your requirements. Here's what I created:\n\n${getSchemaDescription(generatedEntities)}`,
        timestamp: new Date(),
        schema: generatedEntities
      };

      setMessages(prev => [...prev, botResponse]);
      setGeneratedSchema(generatedEntities);
      
    } catch (error) {
      console.error('Error generating schema:', error);
      setError(error.message);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Sorry, I encountered an error while generating your schema: ${error.message}. Please try again with a more specific description.`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const getSchemaDescription = (entities) => {
    return entities.map(entity => {
      const attributeCount = entity.attributes.length;
      const relationships = entity.attributes.filter(attr => attr.ref).length;
      return `• **${entity.name}** table with ${attributeCount} attributes${relationships > 0 ? ` and ${relationships} relationship(s)` : ''}`;
    }).join('\n');
  };

  const handleApplySchema = () => {
    if (generatedSchema) {
      // Option 1: Replace existing entities with new schema
      setEntities(generatedSchema);
      
      // Option 2: Merge with existing entities (uncomment if you prefer this approach)
      // const mergedEntities = [...entities];
      // generatedSchema.forEach(newEntity => {
      //   const existingIndex = mergedEntities.findIndex(e => e.name === newEntity.name);
      //   if (existingIndex >= 0) {
      //     mergedEntities[existingIndex] = newEntity; // Replace existing
      //   } else {
      //     mergedEntities.push(newEntity); // Add new
      //   }
      // });
      // setEntities(mergedEntities);
      
      onGenerateDiagram(generatedSchema);
      
      // Show success message
      const successMessage = {
        id: Date.now(),
        type: 'bot',
        content: "Perfect! I've applied the schema to your diagram. You can now see and edit the generated database structure.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleRetry = () => {
    setError(null);
    // Re-trigger the last user message
    const lastUserMessage = messages.filter(m => m.type === 'user').pop();
    if (lastUserMessage) {
      setInputValue(lastUserMessage.content);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Schema Generator</h2>
              <p className="text-sm text-slate-400">
                Powered by OpenAI • 
                {entities && entities.length > 0 
                  ? ` Current schema: ${entities.length} table(s)`
                  : ' Describe your database needs'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Schema Info */}
        {entities && entities.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">Current Schema Context</span>
            </div>
            <p className="text-blue-100 text-sm">
              {entities.map(e => e.name).join(', ')} • {entities.reduce((sum, e) => sum + e.attributes.length, 0)} total attributes
            </p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="text-red-300 hover:text-red-200 text-sm underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : message.isError
                    ? 'bg-red-900/30 border border-red-700 text-red-200'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                {message.type === 'bot' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Bot className={`w-4 h-4 ${message.isError ? 'text-red-400' : 'text-purple-400'}`} />
                    <span className={`text-xs font-medium ${message.isError ? 'text-red-300' : 'text-slate-400'}`}>
                      AI Assistant
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                {message.schema && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowJsonPreview(!showJsonPreview)}
                        className="text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded-lg text-slate-200 transition-colors"
                      >
                        {showJsonPreview ? 'Hide JSON' : 'Show JSON'}
                      </button>
                      <button
                        onClick={handleApplySchema}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                      >
                        <Database className="w-4 h-4" />
                        <span>Apply to Diagram</span>
                      </button>
                    </div>
                    
                    {showJsonPreview && (
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 font-medium">Generated Schema JSON</span>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(message.schema, null, 2))}
                            className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
                          >
                            {copiedToClipboard ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span className="text-xs">{copiedToClipboard ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="text-xs text-slate-300 overflow-x-auto">
                          {JSON.stringify(message.schema, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-slate-700 rounded-2xl px-4 py-3 max-w-[80%]">
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-400 font-medium">AI Assistant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-sm text-slate-300">
                    {entities && entities.length > 0 
                      ? 'Analyzing your existing schema and generating updates with OpenAI...'
                      : 'Generating your database schema with OpenAI...'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-700">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  entities && entities.length > 0
                    ? "Modify existing schema or add new tables (e.g., 'Add a comments table', 'Update user table with email field')"
                    : "Describe your database (e.g., 'Create a blog system with users and posts', 'E-commerce with customers, products, and orders')"
                }
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all placeholder-slate-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isGenerating}
              />
              <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center space-x-2"
            >
              {isGenerating ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
            </button>
            </div>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-500">
              ✨ Powered by OpenAI GPT-4 • 
              {entities && entities.length > 0
                ? ' Try: "Add comments table", "Update user fields", "Create orders system"'
                : ' Try: "Blog with users and posts", "E-commerce store", "Social media platform"'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;