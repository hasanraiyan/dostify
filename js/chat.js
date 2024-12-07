import CONFIG from './config.js';

class DostifyChat {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatForm = document.getElementById('chat-form');
        this.chatInput = document.getElementById('chat-input');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.messageHistory = [];
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.chatForm.dispatchEvent(new Event('submit'));
            }
        });
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

    addMessage(message, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start gap-3 ${sender === 'user' ? 'flex-row-reverse user-message' : 'ai-message'}`;
        
        // Only add icon for user messages or the first AI message in a sequence
        const lastMessage = this.chatMessages.lastElementChild;
        const isConsecutiveAI = lastMessage && 
            lastMessage.classList.contains('ai-message') && 
            sender === 'ai';

        if (!isConsecutiveAI) {
            const iconDiv = document.createElement('div');
            iconDiv.className = `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
                sender === 'user' 
                    ? 'bg-primary/10 border-primary/20' 
                    : 'bg-accent/10 border-accent/20'
            }`;
            
            const icon = document.createElement('i');
            icon.className = sender === 'user' 
                ? 'fas fa-user text-primary text-sm'
                : 'fas fa-robot text-accent text-sm';
            
            iconDiv.appendChild(icon);
            messageDiv.appendChild(iconDiv);
        } else {
            // Add spacing for consecutive AI messages
            messageDiv.style.marginLeft = '3.5rem';
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = `rounded-2xl p-4 shadow-sm transition-all ${
            sender === 'user'
                ? 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-tr-sm max-w-[85%] hover:shadow-md'
                : 'bg-white text-gray-700 rounded-tl-sm max-w-[85%] border border-gray-100 hover:shadow-md' +
                  (isError ? ' border-red-300 bg-red-50' : '')
        }`;
        
        const messageText = document.createElement('p');
        messageText.className = 'leading-relaxed';
        messageText.textContent = message;
        
        messageContent.appendChild(messageText);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageDiv);
        
        // Smooth scroll with animation
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

    async getAIResponse(message) {
        try {
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
                            content: CONFIG.SYSTEM_PROMPT
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
            console.log('AI Response:', aiResponse);

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
        // Use regex to match content between message tags
        const messageRegex = /<message>([\s\S]*?)<\/message>/g;
        const matches = Array.from(response.matchAll(messageRegex));
        
        console.log('Original Response:', response);
        console.log('Found Messages:', matches);

        if (matches.length === 0) {
            // If no message tags found, treat the entire response as one message
            this.addMessage(response.trim(), 'ai');
            this.messageHistory.push({
                role: 'assistant',
                content: response.trim()
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
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dostifyChat = new DostifyChat();
});
