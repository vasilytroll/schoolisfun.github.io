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
        const panicButton = document.getElementById('panic-button');
        const themeToggle = document.getElementById('theme-toggle');

        // Admin dashboard elements
        const adminPanel = document.createElement('div');
        adminPanel.id = 'admin-panel';
        adminPanel.style.display = 'none';
        adminPanel.style.position = 'fixed';
        adminPanel.style.top = '20px';
        adminPanel.style.right = '20px';
        adminPanel.style.padding = '20px';
        adminPanel.style.backgroundColor = '#f0f0f0';
        adminPanel.style.color = '#333';
        adminPanel.style.border = '2px solid #ccc';
        adminPanel.style.borderRadius = '10px';
        adminPanel.style.zIndex = '9999';
        adminPanel.innerHTML = `
            <h3>Admin Panel</h3>
            <p>Welcome, Admin!</p>
            <button id="open-panel-btn" style="
                padding: 10px 20px;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            ">Open Panel</button>
        `;
        document.body.appendChild(adminPanel);

        // User List Box
        const userListBox = document.createElement('div');
        userListBox.id = 'user-list-box';
        userListBox.style.display = 'none';
        userListBox.style.position = 'fixed';
        userListBox.style.top = '0';
        userListBox.style.right = '0';  
        userListBox.style.width = '250px';
        userListBox.style.height = '100vh';
        userListBox.style.backgroundColor = '#fff';
        userListBox.style.color = '#333';
        userListBox.style.borderLeft = '2px solid #ccc';
        userListBox.style.padding = '20px';
        userListBox.style.overflowY = 'auto';
        userListBox.style.zIndex = '10000';
        userListBox.innerHTML = `
            <button id="close-panel-btn" style="
                width: 100%;
                padding: 10px;
                margin-bottom: 10px;
                background: #eee;
                border: 1px solid #ccc;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            ">Close Panel</button>
            <h4 style="margin-top: 0;">Online Users:</h4>
            <ul id="user-list" style="list-style: none; padding: 0;"></ul>
        `;
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
                if (!onlineUsers.includes(loggedInUsername)) {
                    onlineUsers.push(loggedInUsername);
                }
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

            const openPanelBtn = document.getElementById('open-panel-btn');
            const closePanelBtn = userListBox.querySelector('#close-panel-btn');

            openPanelBtn.addEventListener('click', () => {
                const isHidden = userListBox.style.display === 'none';
                userListBox.style.display = isHidden ? 'block' : 'none';
                openPanelBtn.textContent = isHidden ? 'Close Panel' : 'Open Panel';
                if (isHidden) updateUserList();
            });

            closePanelBtn.addEventListener('click', () => {
                userListBox.style.display = 'none';
                openPanelBtn.textContent = 'Open Panel';
            });
        }

        // Update the user list box and add Kick buttons
        function updateUserList() {
            const userList = document.getElementById('user-list');
            userList.innerHTML = '';

            if (onlineUsers.length === 0) {
                userList.innerHTML = '<li>No users online.</li>';
            } else {
                onlineUsers.forEach(user => {
                    const li = document.createElement('li');
                    li.textContent = user;

                    // Create Kick button
                    const kickButton = document.createElement('button');
                    kickButton.textContent = 'Kick';
                    kickButton.style.marginLeft = '10px';
                    kickButton.style.padding = '5px';
                    kickButton.style.backgroundColor = '#ff4747';
                    kickButton.style.border = 'none';
                    kickButton.style.color = '#fff';
                    kickButton.style.cursor = 'pointer';
                    kickButton.addEventListener('click', () => kickUser(user));

                    li.appendChild(kickButton);
                    userList.appendChild(li);
                });
            }
        }

        // Kick user function
        function kickUser(username) {
            sendWebhookMessage(`${loggedInUsername} kicked ${username} from the website.`);

            // Remove user from onlineUsers array
            onlineUsers = onlineUsers.filter(user => user !== username);

            // Update the user list
            updateUserList();

            // Optionally, you could also log out the kicked user or do other actions
            alert(`${username} has been kicked.`);
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

        //
