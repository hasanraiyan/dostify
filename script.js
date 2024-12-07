// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Chat widget toggle functionality
const chatToggle = document.querySelector('.chat-toggle');
let isChatOpen = false;

chatToggle.addEventListener('click', () => {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        // Here you would typically show your chat interface
        console.log('Open chat interface');
        chatToggle.innerHTML = '<i class="fas fa-times"></i>';
    } else {
        // Here you would typically hide your chat interface
        console.log('Close chat interface');
        chatToggle.innerHTML = '<i class="fas fa-comments"></i>';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections for fade-in animation
document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-out');
    observer.observe(section);
});

// Mobile navigation toggle (to be implemented)
function toggleMobileNav() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('show-mobile-nav');
}

// Form submission handling (for future implementation)
function handleFormSubmission(event) {
    event.preventDefault();
    // Add form handling logic here
}

// Testimonial slider functionality (to be implemented)
class TestimonialSlider {
    constructor() {
        this.testimonials = document.querySelectorAll('.testimonial');
        this.currentIndex = 0;
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.updateSlider();
    }

    previous() {
        this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
        this.updateSlider();
    }

    updateSlider() {
        // Add slider update logic here
    }
}

// Initialize testimonial slider
const testimonialSlider = new TestimonialSlider();

// Add scroll-based animations
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const header = document.querySelector('.header');

    // Add sticky header on scroll
    if (scrollPosition > 100) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});

// Load animation for hero section
window.addEventListener('load', () => {
    const heroContent = document.querySelector('.hero-content');
    heroContent.style.opacity = '1';
    heroContent.style.transform = 'translateY(0)';
});
