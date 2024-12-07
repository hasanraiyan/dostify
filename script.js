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

// Chat functionality
const chatToggle = document.getElementById('chat-toggle');
const chatInterface = document.getElementById('chat-interface');
const closeChat = document.getElementById('close-chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// Toggle chat interface
chatToggle.addEventListener('click', () => {
    chatInterface.classList.toggle('hidden');
    chatInput.focus();
});

// Close chat interface
closeChat.addEventListener('click', () => {
    chatInterface.classList.add('hidden');
});

// Handle chat form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    chatInput.value = '';

    // Simulate AI response (replace with actual API call)
    const response = await getAIResponse(message);
    addMessage(response, 'ai');
});

// Add message to chat interface
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start mb-4 animate-fade-in';
    
    const messageContent = document.createElement('div');
    messageContent.className = sender === 'user' 
        ? 'bg-accent/10 rounded-lg p-3 mr-auto max-w-[80%]'
        : 'bg-primary/10 rounded-lg p-3 ml-auto max-w-[80%]';
    
    const messageText = document.createElement('p');
    messageText.className = 'text-gray-700';
    messageText.textContent = message;
    
    messageContent.appendChild(messageText);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get AI response using pollinations.ai
async function getAIResponse(message) {
    try {
        const response = await fetch('https://text.pollinations.ai/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are Dostify, a friendly AI companion for students. Your purpose is to help students with academic pressure, mental health, career guidance, and social challenges. Keep responses concise, supportive, and focused on student well-being. Always maintain a positive, encouraging tone."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling AI API:', error);
        // Fallback responses if API fails
        const fallbackResponses = {
            'hello': 'Hi there! How can I help you today?',
            'hi': 'Hello! What can I do for you?',
            'how are you': "I'm doing great, thanks for asking! How can I assist you?",
            'help': 'I can help you with academic pressure, mental health, career guidance, and more. What specific area would you like to discuss?',
            'bye': 'Goodbye! Feel free to come back anytime you need help!',
            'thanks': "You're welcome! Is there anything else you'd like to discuss?",
            'thank you': "You're welcome! Let me know if you need any further assistance.",
            'study': "I can help you develop effective study strategies. What subject are you focusing on?",
            'stress': "I understand dealing with stress can be challenging. Let's work together on some stress management techniques.",
            'career': "I'd be happy to help you explore career options. What fields interest you the most?",
            'exam': "Exams can be stressful. I can help you with study planning and anxiety management. What specific concerns do you have?"
        };

        // Check for keyword matches in fallback responses
        const lowercaseMessage = message.toLowerCase();
        for (const [key, value] of Object.entries(fallbackResponses)) {
            if (lowercaseMessage.includes(key)) {
                return value;
            }
        }

        // Default fallback response
        return "I apologize, but I'm having trouble connecting right now. Please try again later or rephrase your question.";
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
