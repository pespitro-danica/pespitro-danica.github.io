// ---------------------------------------
// DOM ELEMENTS
// ---------------------------------------
const loginBtn = document.getElementById("loginBtn");
const createBtn = document.getElementById("createBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeMsg = document.getElementById("welcomeMsg");

const createModal = document.getElementById("createModal");
const goalModal = document.getElementById("goalModal");
const statsModal = document.getElementById("statsModal");
const loginModal = document.getElementById("loginModal");

const closeBtns = document.querySelectorAll(".closeModal");
const closeLoginModal = document.querySelector(".closeLoginModal");

const createAccountSubmit = document.getElementById("createAccountSubmit");
const goalNext = document.getElementById("goalNext");
const finishSetup = document.getElementById("finishSetup");
const loginSubmit = document.getElementById("loginSubmit");

const content = document.getElementById("content");
const navItems = document.querySelectorAll(".sidebar li");


// ---------------------------------------
// HELPER: Check login state
// ---------------------------------------
function userIsLoggedIn() {
    return localStorage.getItem("userName") !== null;
}


// ---------------------------------------
// OPEN CREATE ACCOUNT MODAL
// ---------------------------------------
createBtn.onclick = () => {
    createModal.style.display = "block";
};

// CLOSE CREATE ACCOUNT MODAL
closeBtns.forEach(btn => {
    btn.onclick = () => {
        createModal.style.display = "none";
    };
});


// ---------------------------------------
// CREATE ACCOUNT — STEP 1
// ---------------------------------------
createAccountSubmit.onclick = () => {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        alert("All fields required!");
        return;
    }

    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);

    createModal.style.display = "none";
    goalModal.style.display = "block";
};


// ---------------------------------------
// CREATE ACCOUNT — STEP 2 (GOAL)
// ---------------------------------------
goalNext.onclick = () => {
    const goal = document.getElementById("goalSelect").value;
    localStorage.setItem("userGoal", goal);

    goalModal.style.display = "none";
    statsModal.style.display = "block";
};


// ---------------------------------------
// CREATE ACCOUNT — STEP 3 (IMPERIAL STATS)
// ---------------------------------------
finishSetup.onclick = () => {
    const feet = document.getElementById("userHeightFeet").value;
    const inches = document.getElementById("userHeightInches").value;
    const weight = document.getElementById("userWeightLbs").value;
    const age = document.getElementById("userAge").value;

    if (!feet || !inches || !weight || !age) {
        alert("All fields required!");
        return;
    }

    const totalInches = (parseInt(feet) * 12) + parseInt(inches);

    localStorage.setItem("userHeightFeet", feet);
    localStorage.setItem("userHeightInches", inches);
    localStorage.setItem("userHeightTotalInches", totalInches);
    localStorage.setItem("userWeightLbs", weight);
    localStorage.setItem("userAge", age);

    statsModal.style.display = "none";
    showWelcome();
    highlightDashboard();
    loadPage("Dashboard");
};


// ---------------------------------------
// LOGIN MODAL CONTROL
// ---------------------------------------
loginBtn.onclick = () => {
    loginModal.style.display = "block";
};

closeLoginModal.onclick = () => {
    loginModal.style.display = "none";
};


// LOGIN VALIDATION
loginSubmit.onclick = () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const savedEmail = localStorage.getItem("userEmail");
    const savedPassword = localStorage.getItem("userPassword");

    if (email === savedEmail && password === savedPassword) {
        loginModal.style.display = "none";
        showWelcome();
        highlightDashboard();
        loadPage("Dashboard");
    } else {
        alert("Invalid email or password.");
    }
};


// ---------------------------------------
// SHOW WELCOME MESSAGE
// ---------------------------------------
function showWelcome() {
    const name = localStorage.getItem("userName");

    if (name) {
        welcomeMsg.textContent = "Hi, " + name;
        welcomeMsg.style.display = "inline";
        logoutBtn.style.display = "inline-block";

        loginBtn.style.display = "none";
        createBtn.style.display = "none";
    }
}

showWelcome();


// ---------------------------------------
// LOGOUT
// ---------------------------------------
logoutBtn.onclick = () => {
    localStorage.removeItem("userName");

    welcomeMsg.style.display = "none";
    logoutBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
    createBtn.style.display = "inline-block";

    removeAllHighlights();
    loadPage("Welcome");

    alert("You have been logged out.");
};


// ---------------------------------------
// SIDEBAR NAVIGATION
// ---------------------------------------
navItems.forEach(item => {
    item.addEventListener("click", () => {

        if (!userIsLoggedIn()) {
            loadPage("Welcome");
            return;
        }

        removeAllHighlights();
        item.classList.add("active");

        const page = item.textContent.trim();
        loadPage(page);
    });
});

function highlightDashboard() {
    removeAllHighlights();
    navItems[0].classList.add("active");
}

function removeAllHighlights() {
    navItems.forEach(i => i.classList.remove("active"));
}


// ---------------------------------------
// LOAD PAGE CONTENT
// ---------------------------------------
function loadPage(page) {

    if (!userIsLoggedIn()) {
        content.innerHTML = `
            <h2>Welcome!</h2>
            <p>Please login or create an account to continue.</p>
        `;
        return;
    }

    // DASHBOARD
    if (page === "Dashboard") {
        content.innerHTML = `
            <h2>Dashboard</h2>
            <p>Welcome to your fitness dashboard!</p>
        `;
    }

    // TRAINING LOG
    if (page === "Training Log") {
        content.innerHTML = `
            <h2>Training Log</h2>

            <div class="log-form">
                <h3>Add Workout</h3>

                <label>Date:</label>
                <input type="date" id="logDate">

                <label>Exercise Type:</label>
                <select id="logType">
                    <option value="">-- Select Exercise Type --</option>
                    <option value="running">Running</option>
                    <option value="walking">Walking</option>
                    <option value="cycling">Cycling</option>
                    <option value="lifting">Weight Lifting</option>
                    <option value="bodyweight">Bodyweight Training</option>
                    <option value="yoga">Yoga</option>
                    <option value="pilates">Pilates</option>
                </select>

                <div id="conditionalFields"></div>

                <label>Calories Burned (optional):</label>
                <input type="number" id="logCalories">

                <button id="addWorkoutBtn">Add Workout</button>
            </div>

            <h3>Your Logged Workouts</h3>
            <table id="workoutTable">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Duration</th>
                        <th>Calories</th>
                        <th>Details</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody id="workoutTableBody"></tbody>
            </table>
        `;

        loadWorkouts();
    }

    // PROGRESS
    if (page === "Progress") {
        content.innerHTML = `<h2>Progress</h2><p>Charts coming soon.</p>`;
    }

    // WORKOUT PLAN
    if (page === "Workout Plan") {
        content.innerHTML = `<h2>Workout Plan</h2><p>Your customized plan will appear here.</p>`;
    }
}



// ===========================================================
//             WORKOUT LOG + DYNAMIC FIELDS
// ===========================================================

// Dynamic field system based on exercise type
function updateConditionalFields() {
    const type = document.getElementById("logType").value;
    const container = document.getElementById("conditionalFields");

    if (!container) return;
    container.innerHTML = "";

    // CARDIO — Running, Walking, Cycling
    if (type === "running" || type === "walking" || type === "cycling") {
        container.innerHTML = `
            <label>Distance (miles):</label>
            <input type="number" id="logDistance">

            <label>Average Pace (min/mile):</label>
            <input type="text" id="logPace" placeholder="e.g., 10:30">

            <label>Duration (minutes):</label>
            <input type="number" id="logDuration">
        `;
    }

    // WEIGHT LIFTING
    if (type === "lifting") {
        container.innerHTML = `
            <label>Exercise Name:</label>
            <input type="text" id="logLiftName">

            <label>Sets:</label>
            <input type="number" id="logSets">

            <label>Reps per Set:</label>
            <input type="number" id="logReps">

            <label>Weight (lbs):</label>
            <input type="number" id="logLiftWeight">
        `;
    }

    // BODYWEIGHT
    if (type === "bodyweight") {
        container.innerHTML = `
            <label>Exercise Name:</label>
            <input type="text" id="bwName" placeholder="e.g., Push-ups">

            <label>Sets:</label>
            <input type="number" id="bwSets">

            <label>Reps per Set:</label>
            <input type="number" id="bwReps">

            <label>Difficulty:</label>
            <select id="bwDifficulty">
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
            </select>
        `;
    }

    // YOGA
    if (type === "yoga") {
        container.innerHTML = `
            <label>Session Type:</label>
            <input type="text" id="logYogaType">

            <label>Difficulty:</label>
            <select id="logDifficulty">
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
            </select>
        `;
    }

    // PILATES
    if (type === "pilates") {
        container.innerHTML = `
            <label>Class Type:</label>
            <input type="text" id="logPilatesType">

            <label>Intensity:</label>
            <select id="logPilatesIntensity">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
            </select>
        `;
    }
}



// Load workouts into the table
function loadWorkouts() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const table = document.getElementById("workoutTableBody");

    if (!table) return;
    table.innerHTML = "";

    workouts.forEach((w, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${w.date}</td>
            <td>${w.type}</td>
            <td>${w.duration ? w.duration + " min" : "-"}</td>
            <td>${w.calories || "-"}</td>

            <td>
                ${w.distance ? `Distance: ${w.distance} mi<br>` : ""}
                ${w.pace ? `Pace: ${w.pace}<br>` : ""}

                ${w.liftName ? `Exercise: ${w.liftName}<br>` : ""}
                ${w.sets ? `Sets: ${w.sets}<br>` : ""}
                ${w.reps ? `Reps: ${w.reps}<br>` : ""}
                ${w.weight ? `Weight: ${w.weight} lbs<br>` : ""}

                ${w.bwName ? `Exercise: ${w.bwName}<br>` : ""}
                ${w.bwSets ? `Sets: ${w.bwSets}<br>` : ""}
                ${w.bwReps ? `Reps: ${w.bwReps}<br>` : ""}
                ${w.bwDifficulty ? `Difficulty: ${w.bwDifficulty}<br>` : ""}

                ${w.yogaType ? `Yoga: ${w.yogaType}<br>` : ""}
                ${w.difficulty ? `Difficulty: ${w.difficulty}<br>` : ""}

                ${w.pilatesType ? `Pilates: ${w.pilatesType}<br>` : ""}
                ${w.pilatesIntensity ? `Intensity: ${w.pilatesIntensity}` : ""}
            </td>

            <td>
                <button class="deleteBtn" data-index="${index}">Delete</button>
            </td>
        `;

        table.appendChild(row);
    });

    // Attach delete listeners
    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.onclick = () => deleteWorkout(btn.dataset.index);
    });

    // Add workout listener
    const addBtn = document.getElementById("addWorkoutBtn");
    if (addBtn) addBtn.onclick = addWorkout;

    const typeSelect = document.getElementById("logType");
    if (typeSelect) typeSelect.onchange = updateConditionalFields;
}



// Add a workout
function addWorkout() {
    const date = document.getElementById("logDate").value;
    const type = document.getElementById("logType").value;
    const calories = document.getElementById("logCalories").value;

    if (!date || !type) {
        alert("Date and exercise type required.");
        return;
    }

    let duration = "";
    let extraData = {};

    // CARDIO duration
    if (type === "running" || type === "walking" || type === "cycling") {
        duration = document.getElementById("logDuration").value;
        if (!duration) {
            alert("Duration is required for this exercise.");
            return;
        }

        extraData.distance = document.getElementById("logDistance").value;
        extraData.pace = document.getElementById("logPace").value;
    }

    // WEIGHT LIFTING
    if (type === "lifting") {
        extraData.liftName = document.getElementById("logLiftName").value;
        extraData.sets = document.getElementById("logSets").value;
        extraData.reps = document.getElementById("logReps").value;
        extraData.weight = document.getElementById("logLiftWeight").value;
    }

    // BODYWEIGHT
    if (type === "bodyweight") {
        extraData.bwName = document.getElementById("bwName").value;
        extraData.bwSets = document.getElementById("bwSets").value;
        extraData.bwReps = document.getElementById("bwReps").value;
        extraData.bwDifficulty = document.getElementById("bwDifficulty").value;
    }

    // YOGA
    if (type === "yoga") {
        extraData.yogaType = document.getElementById("logYogaType").value;
        extraData.difficulty = document.getElementById("logDifficulty").value;
    }

    // PILATES
    if (type === "pilates") {
        extraData.pilatesType = document.getElementById("logPilatesType").value;
        extraData.pilatesIntensity = document.getElementById("logPilatesIntensity").value;
    }

    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];

    workouts.push({
        date,
        type,
        duration,
        calories,
        ...extraData
    });

    localStorage.setItem("workouts", JSON.stringify(workouts));
    loadPage("Training Log");
}



// Delete a workout
function deleteWorkout(index) {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    workouts.splice(index, 1);
    localStorage.setItem("workouts", JSON.stringify(workouts));
    loadPage("Training Log");
}



// ---------------------------------------
// INITIAL PAGE LOAD
// ---------------------------------------
if (userIsLoggedIn()) {
    highlightDashboard();
    loadPage("Dashboard");
} else {
    loadPage("Welcome");
}
