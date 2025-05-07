// Global variables
let currentBgColor = "#0a0e14";
let currentTheme = "dark";
let inGameUI = false;
let loggedInUsername = "";
let panicKey = null;
const webhookUrl = "https://discord.com/api/webhooks/1369038865804824686/ARuFGJNLGAA47UM9kqocFE6zlFmhPRyxAzEgsy1PM_4FNzktR0gmpJ3KVMuBSN957mpN";

// GitHub Raw JSON URL containing user data
const githubJsonUrl = "https://raw.githubusercontent.com/vasilytroll/json2/refs/heads/main/users.json";

// User database (empty initially, populated by fetch)
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
const adminPanelButton = document.getElementById('admin-panel-btn');

// Send a webhook message
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
        users = data.users; // Assume the JSON structure contains a "users" array
        console.log('Users fetched:', users);
    } catch (error) {
        console.error("Failed to fetch users:", error);
    }
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

        // Show admin panel button if username is "qwiki"
        if (loggedInUsername.toLowerCase() === 'qwiki') {
            if (adminPanelButton) {
                adminPanelButton.style.display = 'block';
                adminPanelButton.textContent = 'Open Panel';
                adminPanelButton.onclick = () => {
                    window.location.href = '/admin-panel'; // Adjust the URL to your admin panel
                };
            }
        }
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();

    welcomeButton.addEventListener('click', () => {
        welcomeContainer.classList.add('fade-out');
        setTimeout(() => {
            welcomeContainer.style.display = 'none';
            loginOverlay.style.display = 'flex';
            setTimeout(() => {
                loginOverlay.classList.add('visible');
                emailInput.focus();
            }, 50);
        }, 500);
    });

    loginButton.addEventListener('click', submitLogin);

    emailInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') submitLogin();
    });

    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') submitLogin();
    });
});
