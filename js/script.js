<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Portal</title>
    <style>
        /* Add your previous styles here */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            background-color: #0a0e14;
            color: #fff;
        }
        #welcome-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
            padding: 20px;
        }
        #login-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
        }
        #login-overlay.visible {
            display: flex;
        }
        #loading-screen {
            display: none;
            background-color: rgba(0, 0, 0, 0.9);
            color: #fff;
            text-align: center;
            padding: 50px;
        }
        #game-portal {
            display: none;
        }
        .game-card {
            background-color: #333;
            padding: 20px;
            margin: 10px;
            cursor: pointer;
            border-radius: 10px;
            transition: background-color 0.3s;
        }
        .game-card:hover {
            background-color: #555;
        }
        /* More styles... */
    </style>
</head>
<body>

    <div id="welcome-container">
        <button id="welcome-button">Welcome My Friend</button>
    </div>

    <div id="login-overlay">
        <div>
            <input type="text" id="email-input" placeholder="Enter username" />
            <input type="password" id="password-input" placeholder="Enter password" />
            <button id="login-button">Login</button>
        </div>
    </div>

    <div id="loading-screen" class="hidden">
        <div class="loader">Loading...</div>
    </div>

    <div id="game-portal" class="hidden">
        <h1>Game Portal</h1>
        <div class="game-card" data-url="https://example.com/game1" data-name="Game 1">Game 1</div>
        <div class="game-card" data-url="https://example.com/game2" data-name="Game 2">Game 2</div>
        <!-- Add more game cards here -->
    </div>

    <div id="settings-tab">Settings</div>

    <div id="settings-screen">
        <h3>Settings</h3>
        <button id="close-settings-btn">Close Settings</button>
        <div>
            <label for="bg-color-picker">Background Color:</label>
            <input type="color" id="bg-color-picker" />
            <div class="color-preview"></div>
        </div>
        <div>
            <label for="theme-selector">Theme:</label>
            <select id="theme-selector">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
            </select>
        </div>
        <div>
            <label for="panic-key">Panic Key:</label>
            <input type="text" id="panic-key" />
        </div>
        <button id="save-settings-btn">Save Settings</button>
    </div>

    <div id="admin-panel">
        <h3>Admin Panel</h3>
        <button id="open-panel-btn">Open Panel</button>
        <div id="user-list-box">
            <button id="close-panel-btn">Close Panel</button>
            <h4>Online Users:</h4>
            <ul id="user-list"></ul>
        </div>
    </div>

    <script>
        // Global variables
        let currentBgColor = "#0a0e14";
        let currentTheme = "dark";
        let inGameUI = false;
        let loggedInUsername = "";
        const webhookUrl = "https://discord.com/api/webhooks/1369038865804824686/ARuFGJNLGAA47UM9kqocFE6zlFmhPRyxAzEgsy1PM_4FNzktR0gmpJ3KVMuBSN957mpN";
        const githubJsonUrl = "https://raw.githubusercontent.com/vasilytroll/json2/refs/heads/main/users.json";
        let users = [];
        let onlineUsers = [];

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

        // Admin panel logic
        const adminPanel = document.getElementById('admin-panel');
        const openPanelBtn = document.getElementById('open-panel-btn');
        const closePanelBtn = document.getElementById('close-panel-btn');
        const userListBox = document.getElementById('user-list-box');
        const userList = document.getElementById('user-list');

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
            welcomeContainer.style.display = 'none';
            loginOverlay.style.display = 'flex';
            emailInput.focus();
        }

        // Handle login
        function submitLogin() {
            const email = emailInput.value;
            const password = passwordInput.value;

            const user = users.find(u => u.username === email && u.password === password);

            if (user) {
                loggedInUsername = user.username;
                if (!onlineUsers.includes(loggedInUsername)) {
                    onlineUsers.push(loggedInUsername);
                }
                sendWebhookMessage(`${loggedInUsername} successfully logged in.`);

                loginOverlay.style.display = 'none';
                showLoadingScreen();
            } else {
                sendWebhookMessage(`Failed login attempt for ${email}: Incorrect password.`);
                alert("Incorrect username or password!");
                passwordInput.value = '';
                passwordInput.placeholder = 'Enter password';
            }
        }

        // Show loading screen
        function showLoadingScreen() {
            loadingScreen.style.display = 'block';

            setTimeout(() => {
                loadingScreen.style.display = 'none';
                showGamePortal();
            }, 2000);
        }

        // Show game portal
        function showGamePortal() {
            sendWebhookMessage(`${loggedInUsername} reached game menu.`);
            inGameUI = true;
            gamePortal.style.display = 'block';

            if (loggedInUsername.toLowerCase() === 'admin') {
                adminPanel.style.display = 'block';
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
                if (inGameUI && panicKeyInput.value && event.key.toLowerCase() === panicKeyInput.value.toLowerCase()) {
                    activatePanic();
                }
            });
        }

        // Activate admin panel
        openPanelBtn.addEventListener('click', () => {
            userListBox.style.display = userListBox.style.display === 'none' ? 'block' : 'none';
            openPanelBtn.textContent = userListBox.style.display === 'none' ? 'Open Panel' : 'Close Panel';
            if (userListBox.style.display === 'block') updateUserList();
        });

        // Update the user list box
        function updateUserList() {
            userList.innerHTML = '';

            if (onlineUsers.length === 0) {
                userList.innerHTML = '<li>No users online.</li>';
            } else {
                onlineUsers.forEach(user => {
                    const li = document.createElement('li');
                    li.textContent = user;

                    const kickButton = document.createElement('button');
                    kickButton.textContent = 'Kick';
                    kickButton.style.marginLeft = '10px';
                    kickButton.addEventListener('click', () => kickUser(user));

                    li.appendChild(kickButton);
                    userList.appendChild(li);
                });
            }
        }

        // Kick user function
        function kickUser(username) {
            sendWebhookMessage(`${loggedInUsername} kicked ${username} from the website.`);
            onlineUsers = onlineUsers.filter(user => user !== username);
            updateUserList();
        }

        // Open game
        function openGame(url, gameName) {
            sendWebhookMessage(`🎮 ${loggedInUsername} clicked on game: ${gameName}`);
            const newTab = window.open(url, "_blank");
            if (newTab) {
                newTab.focus();
            } else {
                alert("Please allow popups for this site to play the game.");
            }
        }

        // Panic function
        function activatePanic() {
            sendWebhookMessage(`${loggedInUsername} activated the PANIC button!`);
            window.location.href = "https://www.google.com";
        }

        // Event listeners
        welcomeButton.addEventListener('click', showLoginForm);
        loginButton.addEventListener('click', submitLogin);

        // Fetch users on page load
        fetchUsers();

    </script>

</body>
</html>
