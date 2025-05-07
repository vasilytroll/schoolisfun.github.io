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
let onlineUsers = []; // To keep track of online users (localStorage simulation)

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
const saveSettingsBtn = document.getElementById('save-settings-btn');

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
    <button id="open-panel-btn">Open Panel</button>
`;
document.body.appendChild(adminPanel);

// User List Box (create it dynamically)
const userListBox = document.createElement('div');
userListBox.id = 'user-list-box';
userListBox.style.display = 'none';
userListBox.style.position = 'fixed';
userListBox.style.top = '0';
userListBox.style.right = '0';
userListBox.style.width = '250px';
userListBox.style.height = '100vh';
userListBox.style.backgroundColor = '#111';
userListBox.style.color = '#0f0';
userListBox.style.borderLeft = '2px solid #0f0';
userListBox.style.padding = '20px';
userListBox.style.overflowY = 'auto';
userListBox.innerHTML = `<h4>Online Users:</h4><ul id="user-list"></ul>`;
document.body.appendChild(userListBox);

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
        addUserToOnline(loggedInUsername);  // Add to online users (localStorage simulation)

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

// Add user to online users (localStorage simulation)
function addUserToOnline(user) {
    let storedUsers = JSON.parse(localStorage.getItem('onlineUsers')) || [];
    if (!storedUsers.includes(user)) {
        storedUsers.push(user);
        localStorage.setItem('onlineUsers', JSON.stringify(storedUsers));
    }
}

// Remove user from online users (when window closes)
window.addEventListener('beforeunload', () => {
    if (loggedInUsername) {
        let storedUsers = JSON.parse(localStorage.getItem('onlineUsers')) || [];
        storedUsers = storedUsers.filter(u => u !== loggedInUsername);
        localStorage.setItem('onlineUsers', JSON.stringify(storedUsers));
    }
});

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

    const openPanelBtn = document.getElementById('open-panel-btn');
    openPanelBtn.addEventListener('click', () => {
        userListBox.style.display = userListBox.style.display === 'none' ? 'block' : 'none';
        updateUserList();
    });
}

// Update the user list box dynamically
function updateUserList() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = ''; // Clear the current list

    let storedUsers = JSON.parse(localStorage.getItem('onlineUsers')) || [];

    if (storedUsers.length === 0) {
        userList.innerHTML = '<li>No users online.</li>';
    } else {
        storedUsers.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;
            userList.appendChild(li);
        });
    }
}

// Refresh user list every 5 seconds
setInterval(updateUserList, 5000);

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

// Settings screen handlers
function showSettings() {
    settingsScreen.classList.remove('hidden');
    bgColorPicker.value = currentBgColor;
    themeSelector.value = currentTheme;
    panicKeyInput.value = panicKey || '';
}

function closeSettings() {
    settingsScreen.classList.add('hidden');
}

function toggleTheme() {
    if (currentTheme === 'light') {
        currentTheme = 'dark';
        document.body.classList.remove('light');
        document.body.classList.add('dark');
    } else {
        currentTheme = 'light';
        document.body.classList.remove('dark');
        document.body.classList.add('light');
    }
    themeSelector.value = currentTheme;
}

// Save settings
function saveSettings() {
    currentBgColor = bgColorPicker.value;
    currentTheme = themeSelector.value;
    panicKey = panicKeyInput.value;
    document.documentElement.style.setProperty('--bg-color', currentBgColor);
    toggleTheme();
    closeSettings();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    welcomeButton.addEventListener('click', showLoginForm);
    loginButton.addEventListener('click', submitLogin);
    settingsTab.addEventListener('click', showSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    if (panicButton) panicButton.addEventListener('click', activatePanic);

    emailInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') submitLogin(); });
    passwordInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') submitLogin(); });
});
