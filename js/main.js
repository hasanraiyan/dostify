import { DostifyChat } from './chat.js';

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const chatWidget = document.getElementById('chat-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    let isChatOpen = false;

    // Mobile menu toggle
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });

    // Handle Get Started buttons
    const getStartedButtons = document.querySelectorAll('.get-started-btn');
    getStartedButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Smooth scroll to chat widget
            chatWidget.scrollIntoView({ behavior: 'smooth' });
            // Open chat window after scrolling
            setTimeout(() => {
                if (!isChatOpen) {
                    openChat();
                }
            }, 1000);
        });
    });

    // Chat widget functionality
    function openChat() {
        chatWindow.classList.remove('hidden');
        chatWindow.classList.add('animate-fade-in-up');
        isChatOpen = true;
        chatToggle.innerHTML = '<i class="fas fa-times text-xl sm:text-2xl"></i>';
    }

    function closeChat() {
        chatWindow.classList.add('hidden');
        chatWindow.classList.remove('animate-fade-in-up');
        isChatOpen = false;
        chatToggle.innerHTML = '<i class="fas fa-comments text-xl sm:text-2xl"></i>';
    }

    chatToggle.addEventListener('click', () => {
        if (isChatOpen) {
            closeChat();
        } else {
            openChat();
        }
    });

    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
        if (isChatOpen && !chatWidget.contains(e.target)) {
            closeChat();
        }
    });

    // Handle smooth scrolling for all navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu after clicking a link
                mobileMenu.classList.add('hidden');
            }
        });
    });

    // Get all "Talk to Dostify" buttons
    const talkButtons = document.querySelectorAll('.talk-to-dostify');
    const chatInterface = document.getElementById('chat-interface');

    // Function to open chat
    const openDostifyChat = () => {
        chatWidget.classList.add('active');
        chatInterface.classList.remove('hidden');
        chatToggle.classList.add('hidden');
        // Focus on input field
        const inputField = document.getElementById('chat-input');
        if (inputField) {
            inputField.focus();
        }
        // Add welcome message if it's the first time

        if (!sessionStorage.getItem('welcomed')) {
            const chat = new DostifyChat();
            chat.addMessage("👋 Hi there! I'm Dostify, your AI student companion. How can I help you today?", 'ai');
            sessionStorage.setItem('welcomed', 'true');
        }
    };

    // Add click event to all Talk to Dostify buttons
    talkButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            openDostifyChat();
            // Smooth scroll to top if needed
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Handle chat toggle button
    chatToggle.addEventListener('click', () => {
        openDostifyChat();
    });

    // Handle close button
    const closeButton = document.getElementById('close-chat');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            chatInterface.classList.add('hidden');
            chatToggle.classList.remove('hidden');
        });
    }

     // Handle memory button (moved initialization to chat.js)
    const memoryButton = document.getElementById('memory-button');
    const memoryModal = document.getElementById('memory-modal');
    if (memoryButton && memoryModal) {
        memoryButton.addEventListener('click', () => {
            memoryModal.style.display = "block";
        });
    }

    // Initialize chat functionality
    const chat = new DostifyChat();
});