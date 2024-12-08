document.addEventListener('DOMContentLoaded', () => {
    // Get all "try this" buttons
    const tryThisButtons = document.querySelectorAll('.try-this-btn');

    tryThisButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prompt = button.dataset.prompt;
            
            // Get chat interface and toggle button
            const chatInterface = document.getElementById('chat-interface');
            const chatInput = document.getElementById('chat-input');
            
            // Show chat interface if it's hidden
            if (chatInterface.classList.contains('hidden')) {
                chatInterface.classList.remove('hidden');
                chatInterface.classList.add('flex');
            }
            
            // Set the prompt in the chat input
            if (chatInput) {
                chatInput.value = prompt;
                
                // Trigger the form submission
                const chatForm = document.getElementById('chat-form');
                if (chatForm) {
                    // Create and dispatch submit event
                    const submitEvent = new Event('submit');
                    chatForm.dispatchEvent(submitEvent);
                }
            }
        });
    });
});
