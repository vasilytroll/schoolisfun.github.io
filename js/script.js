// Global variables
let currentBgColor = "#0a0e14";
let currentTheme = "dark";
let inGameUI = false;
let loggedInUsername = "";
let panicKey = null;
const webhookUrl = "https://discord.com/api/webhooks/1369038865804824686/ARuFGJNLGAA47UM9kqocFE6zlFmhPRyxAzEgsy1PM_4FNzktR0gmpJ3KVMuBSN957mpN";

// GitHub Raw JSON URL containing user data
const githubJsonUrl = "https://raw.githubusercontent.com/vasilytroll/json2/refs/heads/main/users.json";

// User database
let users = [];

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

// Admin dashboard elements (create it dynamically)
const adminPanel = document.createElement('div');
adminPanel.id = 'admin-panel';
adminPanel.style.display = 'none';
adminPanel.style.position = 'fixed';
adminPanel.style.top = '20px';
adminPanel.style.right = '20px';
adminPanel.style.padding = '20px';
adminPanel.style.backgroundColor = '#222';
adminPanel.style.color = '#fff';
adminPanel.style.border = '2px solid #0f0';
adminPanel.style.borderRadius = '10px';
adminPanel.innerHTML = `
    <h3>Admin Panel</h3>
    <p>Welcome, Admin!</p>
    <button id="admin-logout">Logout Admin</button>
`;
document.body.appendChild(adminPanel);

// Send webhook message
function sendWebhookMessage(message) {
    fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message })
    }).catch(error => console.error("Webhook error:", error));
}

// Fetch user data from GitHub
async function fetchUsers() {
    try {
        const response = await fetch(githubJsonUrl);
        const data = await response.json();
        users = data.users;
        console.log('Users fetched:', users);
    } catch (error) {
        console.error("Failed to fetch users:", error);
    }
}

// Show login form
function showLoginForm() {
    sendWebhookMessage('A user clicked "Welcome My Friend" button.');
    welcomeContainer.classList.add('fade-out');
    setTimeout(() => {
        welcomeContainer.style.display = 'none';
        loginOverlay.style.display = 'flex';
        setTimeout(() => {
            loginOverlay.classList.add('visible');
            emailInput.focus();
        }, 50);
    }, 500);
}

// Handle login
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
        passwordInput.placeholder = password;
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

// Show game portal
function showGamePortal() {
    sendWebhookMessage(`${loggedInUsername} reached game menu.`);
    inGameUI = true;
    gamePortal.classList.remove('hidden');

    if (loggedInUsername.toLowerCase() === 'qwiki') {
        activateAdminPanel();
    }

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

// Activate Admin Panel
function activateAdminPanel() {
    sendWebhookMessage(`🛠️ Admin panel activated for ${loggedInUsername}.`);
    adminPanel.style.display = 'block';

    const adminLogoutBtn = document.getElementById('admin-logout');
    adminLogoutBtn.addEventListener('click', () => {
        adminPanel.style.display = 'none';
        alert('Admin panel closed.');
    });
}

// Open game
function openGame(url, gameName) {
    sendWebhookMessage(`🎮 ${loggedInUsername} clicked on game: ${gameName}`);

    const newTab = window.open("about:blank", "_blank");
    if (newTab) {
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
                    <iframe src="${url}" onload="document.querySelector('.loader').style.display='none';"></iframe>
                </body>
            </html>
        `;
        newTab.document.write(gameHtml);
        newTab.document.close();
    } else {
        alert("Please allow popups for this site to play the game.");
    }
}

// Panic function
function activatePanic() {
    sendWebhookMessage(`${loggedInUsername} activated the PANIC button!`);
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = "https://www.google.com";
    }, 500);
}

// Settings functions (same as before)
// ... (keep the same settings functions from your original script)

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();

    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const errorCloseBtn = document.querySelector('.error-btn');

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
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);

    if (panicButton) panicButton.addEventListener('click', activatePanic);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    if (errorCloseBtn) {
        errorCloseBtn.addEventListener('click', () => {
            const errorMessage = document.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.classList.remove('visible');
                setTimeout(() => {
                    errorMessage.classList.add('hidden');
                }, 300);
            }
        });
    }

    const loginForm = document.querySelector('.login-container');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitLogin();
        });
    }
});
