document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const messageTextarea = document.getElementById('message');
    const notificationModal = document.getElementById('notificationModal');
    const closeModalBtn = document.getElementById('closeModal');

    // Handle form submission
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Clear the message
        messageTextarea.value = '';
        
        // Show the notification modal
        showNotification();
    });

    // Show notification modal
    function showNotification() {
        notificationModal.style.display = 'block';
        
        // Add some dramatic effects
        setTimeout(() => {
            const modalContent = document.querySelector('.modal-content');
            modalContent.style.animation = 'shake 0.5s ease-in-out';
        }, 100);
    }

    // Close modal when clicking the close button
    closeModalBtn.addEventListener('click', () => {
        closeNotification();
    });

    // Close modal when clicking outside the modal content
    notificationModal.addEventListener('click', (e) => {
        if (e.target === notificationModal) {
            closeNotification();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && notificationModal.style.display === 'block') {
            closeNotification();
        }
    });

    function closeNotification() {
        notificationModal.style.display = 'none';
        
        // Reset modal animations
        setTimeout(() => {
            const modalContent = document.querySelector('.modal-content');
            modalContent.style.animation = '';
        }, 300);
    }

    // Add some hover effects to the textarea
    messageTextarea.addEventListener('focus', () => {
        messageTextarea.style.borderColor = '#ffcc00';
        messageTextarea.style.boxShadow = '0 0 15px rgba(255, 204, 0, 0.3)';
    });

    messageTextarea.addEventListener('blur', () => {
        messageTextarea.style.borderColor = '#666';
        messageTextarea.style.boxShadow = 'none';
    });

    // Add typing sound effect (optional)
    messageTextarea.addEventListener('keydown', () => {
        playTypingSound();
    });

    function playTypingSound() {
        // Simple click sound using Web Audio API
        if (window.AudioContext || window.webkitAudioContext) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 200;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        }
    }

    // Add some random badger facts as placeholder text
    const badgerFacts = [
        "Tell us what's on your mind...",
        "Honey Badger is listening... maybe...",
        "Share your thoughts, but remember - Honey Badger Don't Care!",
        "Got feedback? We'll file it under 'Don't Care'...",
        "Message us! (We might not respond because... you know why)",
        "What's bothering you today?"
    ];

    // Randomly change placeholder text
    setInterval(() => {
        if (messageTextarea.value === '' && document.activeElement !== messageTextarea) {
            const randomFact = badgerFacts[Math.floor(Math.random() * badgerFacts.length)];
            messageTextarea.placeholder = randomFact;
        }
    }, 5000);
});