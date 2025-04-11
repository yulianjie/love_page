// Main JavaScript File

// Page transitions
document.addEventListener('DOMContentLoaded', function () {
    // Add page transition class to body
    document.body.classList.add('page-transition');

    // Handle link clicks for smooth page transitions
    document.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.getAttribute('href');

                // Fade out
                document.body.style.opacity = 0;

                // Navigate after animation
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            });
        }
    });

    // Animated entrance for elements as they scroll into view
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__fadeIn');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.function-card, .message-item, .photo-item, .list-item').forEach(item => {
        observer.observe(item);
    });

    // Form submission handling with animations
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
                submitBtn.disabled = true;
            }

            // For forms with AJAX submission
            if (form.dataset.ajax === 'true') {
                e.preventDefault();

                const formData = new FormData(form);
                const data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });

                fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            // Show success message
                            const successMsg = document.createElement('div');
                            successMsg.className = 'alert alert-success animate__animated animate__fadeIn';
                            successMsg.textContent = '提交成功！';
                            form.prepend(successMsg);

                            // Reset form
                            form.reset();

                            // Remove message after delay
                            setTimeout(() => {
                                successMsg.classList.replace('animate__fadeIn', 'animate__fadeOut');
                                setTimeout(() => {
                                    successMsg.remove();
                                }, 500);
                            }, 3000);

                            // Reload content if needed
                            if (form.dataset.reload === 'true') {
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1000);
                            }
                        }

                        // Re-enable submit button
                        if (submitBtn) {
                            submitBtn.innerHTML = '提交';
                            submitBtn.disabled = false;
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        // Show error message
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'alert alert-danger animate__animated animate__fadeIn';
                        errorMsg.textContent = '提交失败，请重试！';
                        form.prepend(errorMsg);

                        // Re-enable submit button
                        if (submitBtn) {
                            submitBtn.innerHTML = '提交';
                            submitBtn.disabled = false;
                        }
                    });
            }
        });
    });

    // List item toggle
    document.querySelectorAll('.list-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const listItem = this.closest('.list-item');
            const itemId = listItem.dataset.id;

            // Toggle completed class
            listItem.classList.toggle('completed');

            // Send request to server
            fetch(`/list/${itemId}/toggle`, {
                method: 'POST',
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Revert UI change on error
                    listItem.classList.toggle('completed');
                    this.checked = !this.checked;
                });
        });
    });

    // Photo hover effect with animation
    document.querySelectorAll('.photo-item').forEach(item => {
        item.addEventListener('mouseenter', function () {
            const image = this.querySelector('.photo-image');
            image.style.transform = 'scale(1.05)';
        });

        item.addEventListener('mouseleave', function () {
            const image = this.querySelector('.photo-image');
            image.style.transform = 'scale(1)';
        });
    });

    // Animate cat profile selection
    document.querySelectorAll('.profile').forEach(profile => {
        profile.addEventListener('click', function () {
            // Remove active class from all profiles
            document.querySelectorAll('.profile').forEach(p => {
                p.classList.remove('active');
            });

            // Add active class to clicked profile
            this.classList.add('active');

            // Heart animation
            const heart = document.querySelector('.heart i');
            heart.classList.add('animate__heartBeat');

            // Remove animation class after animation completes
            setTimeout(() => {
                heart.classList.remove('animate__heartBeat');
            }, 1000);
        });
    });

    // Timer animation
    const timerElements = document.querySelectorAll('.timer span');
    timerElements.forEach(element => {
        // Add pulse animation when value changes
        let lastValue = element.textContent;

        setInterval(() => {
            if (element.textContent !== lastValue) {
                element.classList.add('animate__heartBeat');
                lastValue = element.textContent;

                setTimeout(() => {
                    element.classList.remove('animate__heartBeat');
                }, 1000);
            }
        }, 1000);
    });
});

// Update timer function
function updateTimer() {
    // Set your relationship start date here
    const startDate = new Date('2022-01-01'); // Change this to your actual date
    const now = new Date();

    // Calculate difference in milliseconds
    const diff = now - startDate;

    // Convert to days, hours, minutes, seconds
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Update DOM elements
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

// Update timer every second
setInterval(updateTimer, 1000);