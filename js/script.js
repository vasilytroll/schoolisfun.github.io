// Global variables
let currentBgColor = "#121212";
let currentTheme = "dark";
let inGameUI = false;
let loggedInUsername = "";
let panicKey = null;
const webhookUrl = "https://discord.com/api/webhooks/1369038865804824686/ARuFGJNLGAA47UM9kqocFE6zlFmhPRyxAzEgsy1PM_4FNzktR0gmpJ3KVMuBSN957mpN";

// User database
const users = [
    { "username": "Woh", "password": "Anything" },
    { "username": "qwiki", "password": "252500" },
    { "username": "electron", "password": "0909" },
    { "username": "Genghis", "password": "Khan" },
    { "username": "Vas", "password": "vasisthebestcoder" }
]

// DOM elements
const welcomeContainer = document.getElementById('welcome-container');
const welcomeButton = document.getElementById('welcome-button');
const loginOverlay = document.getElementById('login-overlay');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginButton = document.getElementById('login-button');
const loadingScreen = document.getElementById('loading-screen');
const gamePortal = document.getElementById('game-portal');
const settingsTab = document.getElementById('settings-tab');
const settingsScreen = document.getElementById('settings-screen');
const bgColorPicker = document.getElementById('bg-color-picker');
const themeSelector = document.getElementById('theme-selector');
const panicKeyInput = document.getElementById('panic-key');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const colorPreview = document.querySelector('.color-preview');
const panicButton = document.getElementById('panic-button');
const themeToggle = document.getElementById('theme-toggle');

// Send a webhook message
function sendWebhookMessage(message) {
    fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message })
    }).catch(error => console.error("Webhook error:", error));
}

// Display login form and hide welcome button
function showLoginForm() {
    sendWebhookMessage('A user clicked "Welcome My Friend" button.');
    welcomeContainer.classList.add('fade-out');
    setTimeout(() => {
        welcomeContainer.style.display = 'none';
        loginOverlay.style.display = 'flex';
        emailInput.focus();
    }, 500);
}

// Handle login submission
function submitLogin() {
    const email = emailInput.value;
    const password = passwordInput.value;

    const user = users.find(u => u.username === email && u.password === password);

    if (user) {
        loggedInUsername = user.username;
        sendWebhookMessage(`${loggedInUsername} successfully logged in.`);

        loginOverlay.classList.add('fade-out');
        setTimeout(() => {
            loginOverlay.style.display = 'none';
            showLoadingScreen();
        }, 500);
    } else {
        sendWebhookMessage(`Failed login attempt for ${email}: Incorrect password.`);
        alert("Incorrect username or password!");
        passwordInput.value = '';
        passwordInput.placeholder = 'Incorrect password...';
        setTimeout(() => {
            passwordInput.placeholder = 'Enter password';
        }, 2000);
    }
}

// Show loading screen
function showLoadingScreen() {
    loadingScreen.classList.remove('hidden');
    document.documentElement.style.setProperty('--bg-color', currentBgColor);

    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            loadingScreen.classList.remove('fade-out');
            showGamePortal();
        }, 500);
    }, 2000);
}

// Show the game portal after successful login
function showGamePortal() {
    sendWebhookMessage(`${loggedInUsername} reached game menu.`);
    inGameUI = true;
    gamePortal.classList.remove('hidden');

    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameUrl = card.getAttribute('data-url');
            const gameName = card.getAttribute('data-name');
            openGame(gameUrl, gameName);
        });
    });

    document.addEventListener('keydown', function (event) {
        if (inGameUI && panicKey && event.key.toLowerCase() === panicKey.toLowerCase()) {
            activatePanic();
        }
    });
}

// ✅ FIXED: Open game using about:blank technique (embedding game via iframe)
function openGame(url, gameName) {
    sendWebhookMessage(`🎮 ${loggedInUsername} clicked on game: ${gameName}`);

    // Open a new tab with about:blank
    const newTab = window.open("about:blank", "_blank");
    if (newTab) {
        // Inject HTML that includes the game in an iframe
        const gameHtml = `
            <html>
                <head>
                    <title>${gameName}</title>
                    <style>
                        body {
                            margin: 0;
                            background: #000;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            overflow: hidden;
                        }
                        .loader {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            font-family: monospace;
                            color: #0f0;
                            font-size: 1.5em;
                            animation: blink 1s infinite;
                        }
                        iframe {
                            border: none;
                            width: 100vw;
                            height: 100vh;
                        }
                        @keyframes blink {
                            0% { opacity: 1; }
                            50% { opacity: 0; }
                            100% { opacity: 1; }
                        }
                    </style>
                </head>
                <body>
                    <div class="loader">Loading <strong>${gameName}</strong>...</div>
                    <iframe src="" onload="this.previousElementSibling.style.display='none'; this.src='${url}';"></iframe>
                </body>
            </html>
        `;
        newTab.document.write(gameHtml);
        newTab.document.close();
    } else {
        alert("Please allow popups for this site to play the game.");
    }
}

// Activate panic function
function activatePanic() {
    sendWebhookMessage(`${loggedInUsername} activated the PANIC button!`);
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = "https://www.google.com";
    }, 500);
}

// Show settings screen
function showSettings() {
    sendWebhookMessage(`${loggedInUsername} opened settings.`);
    settingsScreen.classList.remove('hidden');

    bgColorPicker.value = currentBgColor;
    colorPreview.style.backgroundColor = currentBgColor;

    themeSelector.value = currentTheme;

    if (panicKey) {
        panicKeyInput.value = panicKey;
    }

    panicKeyInput.addEventListener('input', function (event) {
        panicKey = event.target.value;
        if (panicKey) {
            sendWebhookMessage(`${loggedInUsername} set panic key to '${panicKey}'`);
        }
    });
}

// Close settings screen
function closeSettings() {
    sendWebhookMessage(`${loggedInUsername} closed settings.`);
    settingsScreen.classList.add('fade-out');
    setTimeout(() => {
        settingsScreen.classList.remove('fade-out');
        settingsScreen.classList.add('hidden');
    }, 500);
}

// Change theme
function changeTheme(theme) {
    document.body.classList.remove('light-theme', 'neon-theme');
    currentTheme = theme;

    if (theme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.classList.add('light-mode');
    } else if (theme === 'dark') {
        themeToggle.classList.remove('light-mode');
    } else if (theme === 'neon') {
        document.body.classList.add('neon-theme');
        themeToggle.classList.remove('light-mode');
    }

    sendWebhookMessage(`${loggedInUsername} changed theme to ${theme}.`);
}

// Toggle theme (optional)
function toggleTheme() {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    changeTheme(nextTheme);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    welcomeButton.addEventListener('click', showLoginForm);
    loginButton.addEventListener('click', submitLogin);

    emailInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') submitLogin();
    });

    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') submitLogin();
    });

    if (settingsTab) settingsTab.addEventListener('click', showSettings);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);

    if (bgColorPicker) {
        bgColorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            currentBgColor = color;
            document.documentElement.style.setProperty('--bg-color', color);
            colorPreview.style.backgroundColor = color;
        });
    }

    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            const theme = e.target.value;
            changeTheme(theme);
        });
    }

    if (panicButton) panicButton.addEventListener('click', activatePanic);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
});
