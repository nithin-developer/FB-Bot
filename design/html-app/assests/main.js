/**
 * Main Script - Essential Functions Only
 * - Countdown Timer
 * - Input Validation
 * - Password Toggle
 * - Loading Progress Bar
 */

(function() {
    'use strict';

    // ================================
    // COUNTDOWN TIMER
    // ================================
    function initCountdownTimer() {
        const secondsElement = document.getElementById('seconds');
        if (!secondsElement) return;

        // Parse initial time from element (format: "MM:SS")
        let timeText = secondsElement.textContent.trim();
        let parts = timeText.split(':');
        let totalSeconds = parseInt(parts[0] || 0) * 60 + parseInt(parts[1] || 0);

        if (totalSeconds <= 0) totalSeconds = 120; // Default 2 minutes

        const countdownInterval = setInterval(function() {
            totalSeconds--;
            
            if (totalSeconds <= 0) {
                clearInterval(countdownInterval);
                secondsElement.textContent = '00:00';
                // Optionally show "Request new code" link
                const showSecondsElement = document.getElementById('showSeconds');
                if (showSecondsElement) {
                    showSecondsElement.innerHTML = '<span style="color:#0064e0;font-weight:600;cursor:pointer;">Request new code</span>';
                }
                return;
            }

            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            secondsElement.textContent = 
                String(minutes).padStart(2, '0') + ':' + 
                String(seconds).padStart(2, '0');
        }, 1000);
    }

    // ================================
    // INPUT VALIDATION
    // ================================
    function initInputValidation() {
        const form = document.querySelector('form');
        const codeInput = document.getElementById('authenticator');
        const errorSpan = document.querySelector('.error');

        if (!form || !codeInput) return;

        form.addEventListener('submit', function(e) {
            const value = codeInput.value.trim();
            
            // Validate code length (6-8 digits)
            if (value.length < 6 || value.length > 8 || !/^\d+$/.test(value)) {
                e.preventDefault();
                if (errorSpan) {
                    errorSpan.style.display = 'block';
                }
                codeInput.focus();
                return false;
            }

            // Hide error if valid
            if (errorSpan) {
                errorSpan.style.display = 'none';
            }

            // Show loading
            showLoading();
        });

        // Hide error on input
        codeInput.addEventListener('input', function() {
            if (errorSpan) {
                errorSpan.style.display = 'none';
            }
        });
    }

    // ================================
    // LOGIN FORM VALIDATION
    // ================================
    function initLoginValidation() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const errorSpans = document.querySelectorAll('.error');

        loginForm.addEventListener('submit', function(e) {
            let hasError = false;

            // Reset errors
            errorSpans.forEach(span => span.style.display = 'none');

            // Validate email
            if (!emailInput || !emailInput.value.trim()) {
                hasError = true;
            }

            // Validate password
            if (!passwordInput || !passwordInput.value.trim()) {
                if (errorSpans[0]) {
                    errorSpans[0].style.display = 'block';
                }
                hasError = true;
            }

            if (hasError) {
                e.preventDefault();
                return false;
            }

            // Show loading
            showLoading();
        });
    }

    // ================================
    // PASSWORD TOGGLE
    // ================================
    function initPasswordToggle() {
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');
        
        if (!togglePassword || !passwordInput) return;

        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    // ================================
    // LOADING PROGRESS BAR
    // ================================
    function showLoading() {
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(function(bar) {
            bar.style.display = 'block';
        });
        document.body.classList.add('body-loading');
    }

    function hideLoading() {
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(function(bar) {
            bar.style.display = 'none';
        });
        document.body.classList.remove('body-loading');
    }

    // ================================
    // INITIALIZE ON DOM READY
    // ================================
    document.addEventListener('DOMContentLoaded', function() {
        initCountdownTimer();
        initInputValidation();
        initLoginValidation();
        initPasswordToggle();
    });

    // Expose functions globally if needed
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;

})();
