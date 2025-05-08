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
const bgColorPicker = document.getElementById('bg-color-picker');
const themeSelector = document.getElementById('theme-selector');
const panicKeyInput = document.getElementById('panic-key');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const colorPreview = document.querySelector('.color-preview');
const panicButton = document.getElementById('panic-button');
const themeToggle = document.getElementById('theme-toggle');
function handleAdminVisibility() {
    const allowedUsers = ["qwiki", "Genghis", "Vas"];
    const adminButton = document.getElementById("admin-panel-button");

    if (!allowedUsers.includes(loggedInUsername)) {
        adminButton.style.display = "none";
    } else {
        adminButton.style.display = "inline-block"; // or "block" depending on your layout
    }
}
 // Toggle the admin panel visibility when the button is clicked
      document.getElementById("admin-panel-button").addEventListener("click", function() {
        const panel = document.getElementById("admin-panel");
        panel.style.display = (panel.style.display === "block") ? "none" : "block";
      });

      // Firebase and redirect logic as before
      const firebaseConfig = {
        apiKey: "AIzaSyDUE1Ek5Kl09_EFCqpcOylJ0K57NK2Tclw",
        authDomain: "thing-3e66e.firebaseapp.com",
        databaseURL: "https://thing-3e66e-default-rtdb.firebaseio.com",
        projectId: "thing-3e66e",
        storageBucket: "thing-3e66e.appspot.com",
        messagingSenderId: "934769419903",
        appId: "1:934769419903:web:734bd6213b3b8eb3d2014a",
        measurementId: "G-FBTD02E8T6"
      };

      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      const db = firebase.database();
      const redirectRef = db.ref("redirect");

// Watch the "redirect" flag in the database
redirectRef.on("value", snapshot => {
    const shouldRedirect = snapshot.val();
    // Check if the logged-in user is not in the allowed list
    const allowedUsers = ["qwiki", "Genghis", "Vas"];
    if (shouldRedirect && !allowedUsers.includes(loggedInUsername) && window.location.pathname !== "/maintenance.html") {
        
    }
});


      // Toggle the redirect flag when admin presses the button
      function toggleRedirect() {
        redirectRef.once("value").then(snapshot => {
          const current = snapshot.val();
          redirectRef.set(!current);
        });
      }
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
        users = data.users;  // Assume the JSON structure contains a "users" array
        console.log('Users fetched:', users);
    } catch (error) {
        console.error("Failed to fetch users:", error);
    }
}

// Display login form and hide welcome button
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

// Handle login submission
function submitLogin() {
    const email = emailInput.value;
    const password = passwordInput.value;

    const user = users.find(u => u.username === email && u.password === password);

    if (user) {
        loggedInUsername = user.username;
        sendWebhookMessage(`${loggedInUsername} successfully logged in.`);
        if (user) {
            loggedInUsername = user.username;
            sendWebhookMessage(`${loggedInUsername} successfully logged in.`);

            handleAdminVisibility(); // ← call the new function here

            loginOverlay.classList.add('fade-out');
            setTimeout(() => {
                loginOverlay.style.display = 'none';
                showLoadingScreen();
            }, 500);
        }


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

// ✅ FIXED: Open game (no reload issue)
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

    setTimeout(() => {
        settingsScreen.classList.add('visible');
    }, 50);

    bgColorPicker.value = currentBgColor;
    colorPreview.style.backgroundColor = currentBgColor;

    themeSelector.value = currentTheme;

    if (panicKey) {
        panicKeyInput.value = panicKey;
    }

    panicKeyInput.addEventListener('blur', function (event) {
        panicKey = event.target.value.trim();
        if (panicKey) {
            sendWebhookMessage(`${loggedInUsername} set panic key to '${panicKey}'`);
        }
    });
}

// Close settings screen
function closeSettings() {
    sendWebhookMessage(`${loggedInUsername} closed settings without saving.`);
    settingsScreen.classList.remove('visible');
    setTimeout(() => {
        settingsScreen.classList.add('hidden');
    }, 300);
}

function saveSettings() {
    sendWebhookMessage(`${loggedInUsername} saved settings.`);

    // Save panic key
    const newPanicKey = panicKeyInput.value.trim();
    if (newPanicKey) {
        panicKey = newPanicKey;
        sendWebhookMessage(`${loggedInUsername} set panic key to '${panicKey}'`);
    }

    // Save theme
    const theme = themeSelector.value;
    changeTheme(theme);

    // Close settings
    settingsScreen.classList.remove('visible');
    setTimeout(() => {
        settingsScreen.classList.add('hidden');
    }, 300);
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
    // Fetch users before initializing the rest of the page
    fetchUsers();

    // DOM elements that weren't defined at the top
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

    if (bgColorPicker) {
        bgColorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            currentBgColor = color;
            document.documentElement.style.setProperty('--bg-primary', color);
            colorPreview.style.backgroundColor = color;
        });
    }

    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            const theme = e.target.value;
            // Just update the UI, don't actually change theme yet
            // Full theme change happens on save
        });
    }

    if (panicButton) panicButton.addEventListener('click', activatePanic);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Error message close handler
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

    // Handle login on submit
    const loginForm = document.querySelector('.login-container');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitLogin();
        });
    }
});
