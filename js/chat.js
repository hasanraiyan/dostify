import CONFIG from './config.js';

class DostifyChat {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatForm = document.getElementById('chat-form');
        this.chatInput = document.getElementById('chat-input');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.messageHistory = [];
        this.aiMemory = this.loadAIMemory();
        this.recognition = null;
        this.isListening = false;
        this.initializeEventListeners();
        this.loadChatHistory();
        this.initializeSpeechRecognition();
    }

    initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn('Speech recognition is not supported in this browser');
            return;
        }

        try {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                // console.log('Speech recognition started');
                this.isListening = true;
                const micButton = document.getElementById('voice-input');
                if (micButton) {
                    micButton.classList.add('bg-accent', 'text-white');
                    micButton.classList.remove('bg-gray-100', 'hover:bg-gray-200/80');
                    micButton.querySelector('i').classList.add('text-white');
                    micButton.querySelector('i').classList.remove('text-gray-600');
                }
            };

            this.recognition.onend = () => {
                // console.log('Speech recognition ended');
                this.isListening = false;
                const micButton = document.getElementById('voice-input');
                if (micButton) {
                    micButton.classList.remove('bg-accent', 'text-white');
                    micButton.classList.add('bg-gray-100', 'hover:bg-gray-200/80');
                    micButton.querySelector('i').classList.remove('text-white');
                    micButton.querySelector('i').classList.add('text-gray-600');
                }
            };

            this.recognition.onresult = (event) => {
                // console.log('Speech recognition result received', event);
                const transcript = event.results[0][0].transcript;
                // console.log('Transcript:', transcript);
                if (this.chatInput) {
                    this.chatInput.value = transcript;
                    this.chatForm.dispatchEvent(new Event('submit'));
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                const micButton = document.getElementById('voice-input');
                if (micButton) {
                    micButton.classList.remove('bg-accent', 'text-white');
                    micButton.classList.add('bg-gray-100', 'hover:bg-gray-200/80');
                    micButton.querySelector('i').classList.remove('text-white');
                    micButton.querySelector('i').classList.add('text-gray-600');
                }
                alert('Speech recognition error: ' + event.error);
            };
        } catch (error) {
            console.error('Error initializing speech recognition:', error);
        }
    }

    initializeEventListeners() {
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.chatForm.dispatchEvent(new Event('submit'));
            }
        });

        // Add voice input button listener
        const voiceInputButton = document.getElementById('voice-input');
        if (voiceInputButton) {
            voiceInputButton.addEventListener('click', () => this.toggleVoiceInput());
        }

        // Add clear chat button listener
        const clearChatButton = document.getElementById('clear-chat');
        if (clearChatButton) {
            clearChatButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear the chat history?')) {
                    this.clearChatHistory();
                }
            });
        }
    }

    toggleVoiceInput() {
        // console.log('Toggling voice input');
        if (!this.recognition) {
            alert('Speech recognition is not supported in your browser. Please try using Chrome.');
            return;
        }

        try {
            if (this.isListening) {
                // console.log('Stopping recognition');
                this.recognition.stop();
            } else {
                // console.log('Starting recognition');
                this.recognition.start();
            }
        } catch (error) {
            console.error('Error toggling voice input:', error);
            alert('Error with voice input: ' + error.message);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.playMessageSound('message-sent');

        // Show typing indicator
        this.showTypingIndicator();

        // Get AI response
        this.getAIResponse(message)
            .catch(error => {
                console.error('Error:', error);
                this.addMessage('Sorry, I encountered an error. Please try again.', 'ai', true);
            })
            .finally(() => {
                this.hideTypingIndicator();
            });
    }

    loadChatHistory() {
        try {
            const savedMessages = localStorage.getItem('dostifyChatHistory');
            if (savedMessages) {
                const messages = JSON.parse(savedMessages);
                // Clear default welcome message if there's history
                this.chatMessages.innerHTML = '';
                messages.forEach(msg => {
                    this.addMessage(msg.content, msg.sender, msg.isError, false);
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    saveChatHistory(message, sender, isError = false) {
        try {
            const savedMessages = localStorage.getItem('dostifyChatHistory');
            let messages = savedMessages ? JSON.parse(savedMessages) : [];
            messages.push({ content: message, sender, isError, timestamp: new Date().toISOString() });
            
            // Keep only last 50 messages
            if (messages.length > 50) {
                messages = messages.slice(-50);
            }
            
            localStorage.setItem('dostifyChatHistory', JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    clearChatHistory() {
        try {
            localStorage.removeItem('dostifyChatHistory');
            this.chatMessages.innerHTML = '';
            // Add back the welcome message
            this.addMessage("👋 Hi there! I'm Dostify, your AI companion. 😊", 'ai');
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    }

    addMessage(message, sender, isError = false, saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start gap-3 ${sender === 'user' ? 'flex-row-reverse user-message' : 'ai-message'} ${sender === 'user' ? 'mb-3' : 'mb-[2px]'} w-full`;
        
        const lastMessage = this.chatMessages.lastElementChild;
        const isConsecutiveAI = lastMessage && 
            lastMessage.classList.contains('ai-message') && 
            sender === 'ai';

        const messageWrapper = document.createElement('div');
        messageWrapper.className = isConsecutiveAI 
            ? 'ml-[3.5rem] mt-[2px] w-full' 
            : (sender === 'user' ? 'ml-auto' : 'flex-1');

        if (!isConsecutiveAI) {
            const iconDiv = document.createElement('div');
            iconDiv.className = `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
                sender === 'user' 
                    ? 'bg-primary/10 border-primary/20' 
                    : 'bg-accent/10 border-accent/20'
            }`;
            
            if (sender === 'user') {
                const icon = document.createElement('i');
                icon.className = 'fas fa-user text-primary text-sm';
                iconDiv.appendChild(icon);
            } else {
                const img = document.createElement('img');
                img.src = 'icon.png';
                img.alt = 'AI Avatar';
                img.className = 'w-full h-full object-cover rounded-full';
                iconDiv.appendChild(img);
            }
            
            messageDiv.appendChild(iconDiv);
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = `rounded-2xl py-2.5 px-4 shadow-sm transition-all ${
            sender === 'user'
                ? 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-tr-sm w-[85%] hover:shadow-md ml-auto'
                : 'bg-white text-gray-700 rounded-tl-sm w-[85%] border border-gray-100 hover:shadow-md' +
                  (isError ? ' border-red-300 bg-red-50' : '')
        }`;
        
        const messageText = document.createElement('p');
        messageText.className = 'leading-relaxed text-[15px]';
        messageText.textContent = message;
        
        messageContent.appendChild(messageText);
        messageWrapper.appendChild(messageContent);
        messageDiv.appendChild(messageWrapper);
        
        this.chatMessages.appendChild(messageDiv);
        
        if (saveToHistory) {
            this.saveChatHistory(message, sender, isError);
        }
        
        this.chatMessages.scrollTo({
            top: this.chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    showTypingIndicator() {
        this.typingIndicator.classList.remove('hidden');
        this.typingIndicator.classList.add('animate-fade-in');
        this.chatMessages.scrollTo({
            top: this.chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    hideTypingIndicator() {
        this.typingIndicator.classList.add('animate-fade-out');
        setTimeout(() => {
            this.typingIndicator.classList.add('hidden');
            this.typingIndicator.classList.remove('animate-fade-out');
        }, 300);
    }

    playMessageSound(elementId) {
        const audio = document.getElementById(elementId);
        if (audio) {
            audio.volume = 0.5; // Lower volume
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play error:', e));
        }
    }

    // AI Memory Management
    loadAIMemory() {
        try {
            const savedMemory = localStorage.getItem('dostifyAIMemory');
            return savedMemory ? this.deduplicateMemory(JSON.parse(savedMemory)) : [];
        } catch (error) {
            console.error('Error loading AI memory:', error);
            return [];
        }
    }

    deduplicateMemory(memory) {
        const uniqueMemory = Array.from(
            new Set(memory.map(item => JSON.stringify(item)))
        ).map(item => JSON.parse(item));

        return uniqueMemory
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, 100);
    }

    saveToAIMemory(data) {
        try {
            const currentMemory = this.loadAIMemory();
            const newMemoryItem = {
                content: typeof data === 'string' ? data : data.content,
                timestamp: Date.now(),
                type: typeof data === 'string' ? 'text' : (data.type || 'text')
            };

            const updatedMemory = this.deduplicateMemory([...currentMemory, newMemoryItem]);
            localStorage.setItem('dostifyAIMemory', JSON.stringify(updatedMemory));
            this.aiMemory = updatedMemory;
            this.showMemoryNotification('Memory Added', '💭');
        } catch (error) {
            console.error('Error saving to AI memory:', error);
        }
    }

    clearAIMemory() {
        try {
            localStorage.removeItem('dostifyAIMemory');
            this.aiMemory = [];
            this.showMemoryNotification('Memory Cleared', '🧹');
        } catch (error) {
            console.error('Error clearing AI memory:', error);
        }
    }

    async getAIResponse(message) {
        try {
            // Get recent and relevant memories
            const recentMemories = this.aiMemory
                .slice(0, 5)
                .map(mem => mem.content)
                .join('\n');

            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: CONFIG.MODEL,
                    messages: [
                        {
                            role: 'system',
                            content: `${CONFIG.SYSTEM_PROMPT}\n\nRecent Memories:\n${recentMemories}\n\nYou can use <add_memory></add_memory> to store important information and <remove_memory></remove_memory> to remove it.`
                        },
                        ...this.messageHistory,
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: CONFIG.MAX_TOKENS,
                    temperature: CONFIG.TEMPERATURE
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 429 || errorData.error?.includes('rate limit')) {
                    throw new Error('RATE_LIMIT');
                }
                throw new Error('API request failed');
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            // console.log('AI Response:', aiResponse);

            await this.processAIResponse(aiResponse);

            this.messageHistory.push(
                { role: 'user', content: message }
            );

            if (this.messageHistory.length > 10) {
                this.messageHistory = this.messageHistory.slice(-10);
            }

            return '';
        } catch (error) {
            console.error('API Error:', error);
            if (error.message === 'RATE_LIMIT') {
                this.addMessage(
                    "🎓 Demo Version: I'm currently experiencing high traffic. Please wait a moment and try again. This is a demonstration limitation. 🕒",
                    'ai',
                    true
                );
                // Add a retry button after a delay
                setTimeout(() => {
                    const retryMessage = document.createElement('div');
                    retryMessage.className = 'flex justify-center my-4';
                    retryMessage.innerHTML = `
                        <div class="text-center">
                            <p class="text-sm text-gray-500 mb-2">This is a demo version limitation</p>
                            <button class="bg-accent/10 hover:bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2">
                                <i class="fas fa-redo-alt"></i>
                                Try Again
                            </button>
                        </div>
                    `;
                    retryMessage.querySelector('button').addEventListener('click', () => {
                        retryMessage.remove();
                        this.handleSubmit(new Event('submit'));
                    });
                    this.chatMessages.appendChild(retryMessage);
                }, 1000);
            } else {
                this.addMessage(
                    "🎓 Demo Version: I apologize, but I encountered an error. This is a demonstration version limitation. Please try again or refresh the page. 🔄",
                    'ai',
                    true
                );
            }
            throw error;
        }
    }

    async processAIResponse(response) {
        // Extract memory commands
        const addMemoryRegex = /<add_memory>([\s\S]*?)<\/add_memory>/g;
        const removeMemoryRegex = /<remove_memory>([\s\S]*?)<\/remove_memory>/g;
        
        // Process add memory commands
        const addMemoryMatches = Array.from(response.matchAll(addMemoryRegex));
        addMemoryMatches.forEach(match => {
            const memory = match[1].trim();
            if (memory) {
                this.saveToAIMemory(memory);
            }
        });

        // Process remove memory commands
        const removeMemoryMatches = Array.from(response.matchAll(removeMemoryRegex));
        removeMemoryMatches.forEach(match => {
            const memory = match[1].trim();
            if (memory) {
                this.removeAIMemory(memory);
            }
        });

        // Remove memory commands from response
        let cleanResponse = response.replace(addMemoryRegex, '').replace(removeMemoryRegex, '').trim();

        // Use regex to match content between message tags
        const messageRegex = /<message>([\s\S]*?)<\/message>/g;
        const matches = Array.from(cleanResponse.matchAll(messageRegex));
        
        // console.log('Original Response:', response);
        // console.log('Found Messages:', matches);

        if (matches.length === 0) {
            // If no message tags found, treat the entire response as one message
            this.addMessage(cleanResponse.trim(), 'ai');
            this.messageHistory.push({
                role: 'assistant',
                content: cleanResponse.trim()
            });
            return;
        }

        for (let i = 0; i < matches.length; i++) {
            const messageContent = matches[i][1].trim();
            if (messageContent) {
                // Add delay between messages
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                // Add message to chat
                this.addMessage(messageContent, 'ai');
                
                // Add to message history
                this.messageHistory.push({
                    role: 'assistant',
                    content: messageContent
                });

                // Play sound for all but the last message
                if (i < matches.length - 1) {
                    this.playMessageSound('message-receive');
                }
            }
        }
    }

    removeAIMemory(memory) {
        try {
            const initialLength = this.aiMemory.length;
            this.aiMemory = this.aiMemory.filter(m => m.content !== memory);
            localStorage.setItem('dostifyAIMemory', JSON.stringify(this.aiMemory));
            
            // Only show notification if a memory was actually removed
            if (initialLength !== this.aiMemory.length) {
                this.showMemoryNotification('Memory Removed', '🗑️');
            }
        } catch (error) {
            console.error('Error removing AI memory:', error);
        }
    }

    showMemoryNotification(text, emoji) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-accent/90 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 flex items-center gap-2';
        notification.style.zIndex = '1000';
        notification.innerHTML = `
            <span class="text-lg">${emoji}</span>
            <span class="text-sm font-medium">${text}</span>
        `;
        
        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        });

        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(20px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dostifyChat = new DostifyChat();
});
