// Mobile menu functionality
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add('hidden');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu after clicking a link
            mobileMenu.classList.add('hidden');
        }
    });
});

// Chat elements
const chatToggle = document.getElementById('chat-toggle');
const chatInterface = document.getElementById('chat-interface');
const closeChat = document.getElementById('close-chat');
const minimizeChat = document.getElementById('minimize-chat');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const voiceInput = document.getElementById('voice-input');
const typingIndicator = document.getElementById('typing-indicator');
const messageSentSound = document.getElementById('message-sent');
const messageReceivedSound = document.getElementById('message-received');

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
}

// Chat state
let isMinimized = false;
let isTyping = false;

// Initialize chat
function initializeChat() {
    chatToggle.addEventListener('click', toggleChat);
    closeChat.addEventListener('click', closeChattingInterface);
    minimizeChat?.addEventListener('click', minimizeChattingInterface);
    chatForm.addEventListener('submit', handleChatSubmit);
    voiceInput.addEventListener('click', toggleVoiceInput);
    
    // Handle mobile viewport height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.addEventListener('resize', () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
}

// Toggle chat interface
function toggleChat() {
    chatInterface.classList.toggle('hidden');
    if (!chatInterface.classList.contains('hidden')) {
        chatInput.focus();
        scrollToBottom();
    }
}

// Close chat interface
function closeChattingInterface() {
    chatInterface.classList.add('hidden');
    isMinimized = false;
    updateChatSize();
}

// Minimize chat interface
function minimizeChattingInterface() {
    isMinimized = !isMinimized;
    updateChatSize();
}

// Update chat size based on state
function updateChatSize() {
    if (window.innerWidth >= 640) return; // Only for mobile
    
    if (isMinimized) {
        chatInterface.style.height = '400px';
        chatMessages.style.height = 'calc(400px - 140px)';
        minimizeChat.innerHTML = '<i class="fas fa-expand"></i>';
    } else {
        chatInterface.style.height = '100vh';
        chatMessages.style.height = 'calc(100vh - 140px)';
        minimizeChat.innerHTML = '<i class="fas fa-minus"></i>';
    }
    scrollToBottom();
}

// Handle chat form submission
async function handleChatSubmit(e) {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Play send sound
    messageSentSound.play().catch(() => {});

    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';
    scrollToBottom();

    // Show typing indicator
    showTypingIndicator();

    // Get AI response
    const response = await getAIResponse(message);

    // Hide typing indicator and add AI response
    hideTypingIndicator();
    addMessage(response, 'ai');
    
    // Play receive sound
    messageReceivedSound.play().catch(() => {});
    
    scrollToBottom();
}

// Add message to chat
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start gap-2 animate-fade-in';

    if (sender === 'ai') {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-user-graduate text-accent text-sm"></i>
            </div>
            <div class="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm max-w-[80%]">
                <p class="text-gray-700">${message}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 ml-auto order-2">
                <i class="fas fa-user text-white text-sm"></i>
            </div>
            <div class="bg-accent/10 rounded-2xl rounded-tr-sm p-3 max-w-[80%] order-1">
                <p class="text-gray-700">${message}</p>
            </div>
        `;
    }

    chatMessages.appendChild(messageDiv);
}

// Show typing indicator
function showTypingIndicator() {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.classList.add('hidden');
}

// Scroll chat to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Toggle voice input
function toggleVoiceInput() {
    if (!recognition) {
        alert('Sorry, voice input is not supported in your browser.');
        return;
    }

    if (recognition.isStarted) {
        recognition.stop();
        voiceInput.classList.remove('bg-accent', 'text-white');
        voiceInput.classList.add('bg-gray-100', 'text-gray-600');
    } else {
        recognition.start();
        voiceInput.classList.remove('bg-gray-100', 'text-gray-600');
        voiceInput.classList.add('bg-accent', 'text-white');
    }
}

// Handle speech recognition
if (recognition) {
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        voiceInput.classList.remove('bg-accent', 'text-white');
        voiceInput.classList.add('bg-gray-100', 'text-gray-600');
    };

    recognition.onend = () => {
        recognition.isStarted = false;
        voiceInput.classList.remove('bg-accent', 'text-white');
        voiceInput.classList.add('bg-gray-100', 'text-gray-600');
    };

    recognition.onstart = () => {
        recognition.isStarted = true;
    };
}

// Initialize chat
initializeChat();

// Get AI response using pollinations.ai
async function getAIResponse(message) {
    try {
        const response = await fetch('https://text.pollinations.ai/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a friendly and supportive peer named Dostify. Act like a caring friend who happens to be really good at helping with studies and life advice. Use a casual, warm tone with occasional emojis. Show empathy, share relatable examples, and make the conversation feel natural - like chatting with a friend who truly cares. Keep responses concise (2-3 sentences max). Use phrases like 'I get that', 'You know what?', 'Hey!', and other friendly expressions. Avoid sounding too formal or robotic."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 150,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling AI API:', error);
        // Friendly fallback responses
        const fallbackResponses = {
            'hello': "Hey there! 👋 How's your day going?",
            'hi': "Hi friend! 😊 What's on your mind?",
            'how are you': "I'm doing great, thanks for asking! But more importantly, how are YOU doing? 💫",
            'help': "Hey! Of course I'm here to help - that's what friends are for! What's bothering you? 🤗",
            'bye': "Take care, friend! Remember, I'm always here when you need someone to talk to! 👋✨",
            'thanks': "Anytime! That's what friends are for! 💫",
            'thank you': "You're so welcome! Don't hesitate to reach out again, okay? 🌟",
            'study': "Hey! I totally get study stress. Want to talk about what's challenging you? We can figure this out together! 📚",
            'stress': "I hear you - stress can be really tough. Want to talk about what's on your mind? Sometimes just chatting helps! 💭",
            'career': "Thinking about the future? That's exciting! What kind of things interest you? Let's explore this together! 🌟",
            'exam': "Exams can be scary, I totally get that! But you know what? We can work on this together. What's worrying you the most? 📝"
        };

        // Check for keyword matches in fallback responses
        const lowercaseMessage = message.toLowerCase();
        for (const [key, value] of Object.entries(fallbackResponses)) {
            if (lowercaseMessage.includes(key)) {
                return value;
            }
        }

        // Friendly default fallback response
        return "Hey! Looks like I'm having a bit of trouble connecting right now 😅 But I still want to chat! Could you try saying that again in a different way? 💫";
    }
}

// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe sections for animation
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Handle scroll events for navbar
const navbar = document.querySelector('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('shadow-md');
    } else {
        navbar.classList.add('shadow-md');
    }
    
    lastScroll = currentScroll;
});

// Load animation for hero section
window.addEventListener('load', () => {
    const heroContent = document.querySelector('.hero-content');
    heroContent.style.opacity = '1';
    heroContent.style.transform = 'translateY(0)';
});
