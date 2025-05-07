<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Portal</title>
    <style>
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
        #settings-tab {
            position: fixed;
            top: 20px;
            left: 20px;
            background: #fff;
            color: #333;
            padding: 10px;
            cursor: pointer;
            border-radius: 5px;
        }
        #settings-screen {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            color: #333;
            padding: 20px;
            border-radius: 10px;
        }
        .color-preview {
            width: 50px;
            height: 50px;
            border: 2px solid #000;
            margin-top: 10px;
        }
        #admin-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 20px;
            background-color: #f0f0f0;
            color: #333;
            border: 2px solid #ccc;
            border-radius: 10px;
            z-index: 9999;
            display: none;
        }
        #user-list-box {
            position: fixed;
            top: 0;
            right: 0;
            width: 250px;
            height: 100vh;
            background-color: #fff;
            color: #333;
            border-left: 2px solid #ccc;
            padding: 20px;
            overflow-y: auto;
            z-index: 10000;
            display: none;
        }
        #user-list {
            list-style: none;
            padding: 0;
        }
        #user-list li {
            margin: 10px 0;
        }
        button {
            padding: 10px;
            margin-top: 10px;
            cursor: pointer;
            border: none;
            border-radius: 5px;
            transition: background-color 0.3s;
        }
        #close-panel-btn, #open-panel-btn {
            background: #fff;
            border: 1px solid #ccc;
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
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
        }
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

        // Admin panel elements
        const adminPanel = document.getElementById('admin-panel');
        const userListBox = document.getElementById('user-list-box');
        const userList = document.getElementById('user-list');
        const openPanelBtn = document.getElementById('open-panel-btn');
        const closePanelBtn = document.getElementById('close-panel-btn');

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

                loginOverlay.style.display = 'none';
                gamePortal.style.display = 'block';
                fetchUsers();
            } else {
                alert("Invalid username or password.");
            }
        }

        // Handle game portal card click
        function openGamePortal(event) {
            const gameUrl = event.target.dataset.url;
            window.open(gameUrl, '_blank');
        }

        // Show settings screen
        function openSettings() {
            settingsScreen.style.display = 'block';
        }

        // Close settings screen
        function closeSettings() {
            settingsScreen.style.display = 'none';
        }

        // Save settings
        function saveSettings() {
            currentBgColor = bgColorPicker.value;
            currentTheme = themeSelector.value;
            document.body.style.backgroundColor = currentBgColor;
            document.body.className = currentTheme;
            closeSettings();
        }

        // Handle panic key
        function triggerPanicMode() {
            const panicKey = panicKeyInput.value;
            if (panicKey === "panic") {
                alert("Panic mode triggered!");
            }
        }

        // Handle admin panel opening
        function openAdminPanel() {
            adminPanel.style.display = 'block';
            userListBox.style.display = 'block';
            const onlineUsersList = onlineUsers.map(user => `<li>${user}</li>`).join('');
            userList.innerHTML = onlineUsersList;
        }

        // Handle admin panel closing
        function closeAdminPanel() {
            adminPanel.style.display = 'none';
            userListBox.style.display = 'none';
        }

        // Event listeners
        welcomeButton.addEventListener('click', showLoginForm);
        loginButton.addEventListener('click', submitLogin);
        openPanelBtn.addEventListener('click', openAdminPanel);
        closePanelBtn.addEventListener('click', closeAdminPanel);
        settingsTab.addEventListener('click', openSettings);
        closeSettingsBtn.addEventListener('click', closeSettings);
        saveSettingsBtn.addEventListener('click', saveSettings);

        // Fetch users on page load
        window.onload = fetchUsers;
    </script>
</body>
</html>
