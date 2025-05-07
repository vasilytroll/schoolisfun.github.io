// Global variables
let currentBgColor = "#121212";
let currentTheme = "dark";
let inGameUI = false;
let loggedInUsername = "";
let panicKey = null;
const webhookUrl = "https://discord.com/api/webhooks/1369038865804824686/ARuFGJNLGAA47UM9kqocFE6zlFmhPRyxAzEgsy1PM_4FNzktR0gmpJ3KVMuBSN957mpN";

// User database
const users = [
    { username: "gurt", password: "yo" },
    { username: "qwiki", password: "252500" },
    { username: "electron", password: "0909" },
    { username: "Genghis", password: "Khan" },
    { username: "Vas", password: "vasisthebestcoder" },
    { username: "greg", password: "saker" },
    { username: "stoj", password: "2508" }
];

// DOM elements
const $ = (id) => document.getElementById(id);
const welcomeContainer = $("welcome-container");
const welcomeButton = $("welcome-button");
const loginOverlay = $("login-overlay");
const emailInput = $("email-input");
const passwordInput = $("password-input");
const loginButton = $("login-button");
const loadingScreen = $("loading-screen");
const gamePortal = $("game-portal");
const settingsTab = $("settings-tab");
const settingsScreen = $("settings-screen");
const bgColorPicker = $("bg-color-picker");
const themeSelector = $("theme-selector");
const panicKeyInput = $("panic-key");
const closeSettingsBtn = $("close-settings-btn");
const colorPreview = document.querySelector(".color-preview");
const panicButton = $("panic-button");
const themeToggle = $("theme-toggle");

// Send webhook message
function sendWebhookMessage(message) {
    const content = `${message} : version 4.6`;
    fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    }).catch(console.error);
}

// Login handling
function showLoginForm() {
    sendWebhookMessage('A user clicked "Welcome My Friend" button.');
    welcomeContainer.classList.add("fade-out");
    setTimeout(() => {
        welcomeContainer.style.display = "none";
        loginOverlay.style.display = "flex";
        emailInput.focus();
    }, 500);
}

function submitLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const user = users.find(u => u.username === email && u.password === password);

    if (user) {
        loggedInUsername = user.username;
        sendWebhookMessage(`${loggedInUsername} successfully logged in.`);
        loginOverlay.classList.add("fade-out");
        setTimeout(() => {
            loginOverlay.style.display = "none";
            showLoadingScreen();
        }, 500);
    } else {
        sendWebhookMessage(`Failed login attempt for ${email}: Incorrect password.`);
        alert("Incorrect username or password!");
        passwordInput.value = "";
        passwordInput.placeholder = "Incorrect password...";
        setTimeout(() => {
            passwordInput.placeholder = "Enter password";
        }, 2000);
    }
}

// Loading & game portal
function showLoadingScreen() {
    loadingScreen.classList.remove("hidden");
    document.documentElement.style.setProperty("--bg-color", currentBgColor);

    setTimeout(() => {
        loadingScreen.classList.add("fade-out");
        setTimeout(() => {
            loadingScreen.classList.add("hidden");
            loadingScreen.classList.remove("fade-out");
            showGamePortal();
        }, 500);
    }, 2000);
}

function showGamePortal() {
    sendWebhookMessage(`${loggedInUsername} reached game menu.`);
    inGameUI = true;
    gamePortal.classList.remove("hidden");

    document.querySelectorAll(".game-card").forEach(card => {
        card.addEventListener("click", () => {
            openGame(card.dataset.url, card.dataset.name);
        });
    });

    document.addEventListener("keydown", function (event) {
        if (inGameUI && panicKey && event.key.toLowerCase() === panicKey.toLowerCase()) {
            activatePanic();
        }
    });
}

function openGame(url, gameName) {
    sendWebhookMessage(`🎮 ${loggedInUsername} clicked on game: ${gameName}`);
    window.location.href = url;
}

// Panic logic
function activatePanic() {
    sendWebhookMessage(`${loggedInUsername} activated the PANIC button!`);
    
    // Attempt to close the window
    window.close();

    // If it fails, fallback: redirect to a "safe" page
    setTimeout(() => {
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;font-family:sans-serif;">
                <h2>🔒 You are now safe.</h2>
                <p>Please close this tab manually.</p>
            </div>
        `;
    }, 300);
}

// Settings
function showSettings() {
    sendWebhookMessage(`${loggedInUsername} opened settings.`);
    settingsScreen.classList.remove("hidden");

    bgColorPicker.value = currentBgColor;
    colorPreview.style.backgroundColor = currentBgColor;
    themeSelector.value = currentTheme;
    panicKeyInput.value = panicKey || "";

    if (!panicKeyInput.dataset.listenerAdded) {
        panicKeyInput.addEventListener("input", e => {
            panicKey = e.target.value;
            if (panicKey) {
                sendWebhookMessage(`${loggedInUsername} set panic key to '${panicKey}'`);
            }
        });
        panicKeyInput.dataset.listenerAdded = "true";
    }
}

function closeSettings() {
    sendWebhookMessage(`${loggedInUsername} closed settings.`);
    settingsScreen.classList.add("fade-out");
    setTimeout(() => {
        settingsScreen.classList.remove("fade-out");
        settingsScreen.classList.add("hidden");
    }, 500);
}

function changeTheme(theme) {
    document.body.classList.remove("light-theme", "neon-theme");
    currentTheme = theme;

    if (theme === "light") {
        document.body.classList.add("light-theme");
        themeToggle.classList.add("light-mode");
    } else if (theme === "neon") {
        document.body.classList.add("neon-theme");
        themeToggle.classList.remove("light-mode");
    } else {
        themeToggle.classList.remove("light-mode");
    }

    sendWebhookMessage(`${loggedInUsername} changed theme to ${theme}.`);
}

function toggleTheme() {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    changeTheme(nextTheme);
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    welcomeButton.addEventListener("click", showLoginForm);
    loginButton.addEventListener("click", submitLogin);

    emailInput.addEventListener("keyup", e => {
        if (e.key === "Enter") submitLogin();
    });

    passwordInput.addEventListener("keyup", e => {
        if (e.key === "Enter") submitLogin();
    });

    if (settingsTab) settingsTab.addEventListener("click", showSettings);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener("click", closeSettings);

    if (bgColorPicker) {
        bgColorPicker.addEventListener("input", e => {
            const color = e.target.value;
            currentBgColor = color;
            document.documentElement.style.setProperty("--bg-color", color);
            colorPreview.style.backgroundColor = color;
        });
    }

    if (themeSelector) {
        themeSelector.addEventListener("change", e => {
            changeTheme(e.target.value);
        });
    }

    if (panicButton) panicButton.addEventListener("click", activatePanic);
    if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
});



