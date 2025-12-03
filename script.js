// ---------------------------------------
// DOM ELEMENTS
// ---------------------------------------
const loginBtn = document.getElementById("loginBtn");
const createBtn = document.getElementById("createBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeMsg = document.getElementById("welcomeMsg");

const loginModal = document.getElementById("loginModal");
const createModal = document.getElementById("createModal");
const goalModal = document.getElementById("goalModal");
const statsModal = document.getElementById("statsModal");
const editModal = document.getElementById("editModal");
const weightModal = document.getElementById("weightModal");

const closeBtns = document.querySelectorAll(".closeModal");

const createAccountSubmit = document.getElementById("createAccountSubmit");
const goalNext = document.getElementById("goalNext");
const finishSetup = document.getElementById("finishSetup");
const loginSubmit = document.getElementById("loginSubmit");

const content = document.getElementById("content");
const navItems = document.querySelectorAll(".sidebar li");

let currentEditIndex = null;


// ---------------------------------------
// HELPERS
// ---------------------------------------
function userIsLoggedIn() {
    return localStorage.getItem("userName") !== null;
}

closeBtns.forEach(btn => {
    btn.onclick = () => {
        const modal = btn.closest(".modal");
        if (modal) modal.style.display = "none";
    };
});

function formatGoal(goal) {
    switch (goal) {
        case "lose": return "Lose Weight";
        case "maintain": return "Maintain Weight";
        case "gain": return "Gain Weight";
        case "muscle": return "Gain Muscle";
        default: return "Not Set";
    }
}


// ---------------------------------------
// CREATE ACCOUNT FLOW
// ---------------------------------------
createBtn.onclick = () => createModal.style.display = "block";

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

goalNext.onclick = () => {
    const goal = document.getElementById("goalSelect").value;
    localStorage.setItem("userGoal", goal);

    goalModal.style.display = "none";
    statsModal.style.display = "block";
};

finishSetup.onclick = () => {
    const feet = document.getElementById("userHeightFeet").value;
    const inches = document.getElementById("userHeightInches").value;
    const weight = document.getElementById("userWeightLbs").value;
    const weightGoal = document.getElementById("regWeightGoal").value;
    const age = document.getElementById("userAge").value;

    if (!feet || !inches || !weight || !weightGoal || !age) {
        alert("All fields required!");
        return;
    }

    const totalInches = (Number(feet) * 12) + Number(inches);

    localStorage.setItem("userHeightFeet", feet);
    localStorage.setItem("userHeightInches", inches);
    localStorage.setItem("userHeightTotalInches", totalInches);
    localStorage.setItem("userWeightLbs", weight);
    localStorage.setItem("userWeightGoal", weightGoal);
    localStorage.setItem("userAge", age);

    // Initialize weight history with first weight
    const firstEntry = [{
        date: new Date().toISOString().split("T")[0],
        weight: Number(weight)
    }];
    localStorage.setItem("weightHistory", JSON.stringify(firstEntry));

    statsModal.style.display = "none";
    showWelcome();
    highlightDashboard();
    loadPage("Dashboard");
};


// ---------------------------------------
// LOGIN
// ---------------------------------------
loginBtn.onclick = () => loginModal.style.display = "block";

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
// WELCOME / LOGOUT
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

logoutBtn.onclick = () => {
    localStorage.removeItem("userName");
    welcomeMsg.style.display = "none";
    logoutBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
    createBtn.style.display = "inline-block";

    removeAllHighlights();
    loadPage("Welcome");
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

        let page;
        if (item.id === "accountSettingsNav") {
            page = "Account Settings";
        } else {
            page = item.textContent.trim();
        }

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

    if (!userIsLoggedIn() && page !== "Welcome") {
        content.innerHTML = `
            <h2>Welcome!</h2>
            <p>Please login or create an account to start your journey.</p>
        `;
        return;
    }

    // ---------- WELCOME ----------
    if (page === "Welcome") {
        content.innerHTML = `
            <h2>Welcome!</h2>
            <p>Please login or create an account to continue.</p>
        `;
    }

    // ---------- DASHBOARD ----------
    if (page === "Dashboard") {
        const name = localStorage.getItem("userName") || "User";
        const workouts = JSON.parse(localStorage.getItem("workouts")) || [];

        const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null;

        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        let weeklyCount = 0;
        let weeklyMinutes = 0;
        let weeklyMiles = 0;

        workouts.forEach(w => {
            const wDate = new Date(w.date);
            if (wDate >= oneWeekAgo) {
                weeklyCount++;
                if (w.duration) weeklyMinutes += Number(w.duration);
                if (w.distance) weeklyMiles += Number(w.distance);
            }
        });

        const weightCurr = Number(localStorage.getItem("userWeightLbs"));
        const weightGoal = Number(localStorage.getItem("userWeightGoal"));
        const diff = weightCurr - weightGoal;

        let weightMsg = "";
        if (!weightGoal) {
            weightMsg = "Set your goal in Profile.";
        } else if (diff > 0) {
            weightMsg = `${diff} lbs above goal`;
        } else if (diff < 0) {
            weightMsg = `${Math.abs(diff)} lbs below goal`;
        } else {
            weightMsg = "Goal reached!";
        }

        content.innerHTML = `
            <h2>Dashboard</h2>
            <p class="welcome-msg">Welcome back, ${name}!</p>

            <div class="dashboard-grid">
                <div class="card">
                    <h3>Weekly Workouts</h3>
                    <p class="card-number">${weeklyCount}</p>
                    <span>Workouts this week</span>
                </div>

                <div class="card">
                    <h3>Weekly Duration</h3>
                    <p class="card-number">${weeklyMinutes} min</p>
                    <span>Total minutes</span>
                </div>

                <div class="card">
                    <h3>Weekly Distance</h3>
                    <p class="card-number">${weeklyMiles.toFixed(1)} mi</p>
                    <span>Total miles</span>
                </div>

                <div class="card">
                    <h3>Weight Goal</h3>
                    <p class="card-number">${weightGoal || "Not set"}</p>
                    <span>${weightMsg}</span>
                </div>
            </div>

            <h3 style="margin-top: 30px;">Last Logged Workout</h3>
            ${
                lastWorkout
                ? `
                <div class="last-workout-card">
                    <p><strong>Date:</strong> ${lastWorkout.date}</p>
                    <p><strong>Type:</strong> ${lastWorkout.type.charAt(0).toUpperCase() + lastWorkout.type.slice(1)}</p>
                    ${lastWorkout.duration ? `<p><strong>Duration:</strong> ${lastWorkout.duration} min</p>` : ""}
                    ${lastWorkout.distance ? `<p><strong>Distance:</strong> ${lastWorkout.distance} mi</p>` : ""}
                    <p><strong>Calories:</strong> ${lastWorkout.calories || "-"}</p>
                </div>`
                : `<p>No workouts logged yet.</p>`
            }
        `;
    }

    // ---------- TRAINING LOG ----------
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
            <table id="workoutTable" class="workout-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Duration</th>
                        <th>Calories</th>
                        <th>Details</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="workoutTableBody"></tbody>
            </table>
        `;

        loadWorkouts();
    }

    // ---------- PROGRESS ----------
    if (page === "Progress") {
        content.innerHTML = `
            <h2>Progress</h2>

            <canvas id="weeklyWorkoutsChart"></canvas>
            <canvas id="weeklyDistanceChart" style="margin-top: 40px;"></canvas>

            <h3 style="margin-top: 40px;">Weight Progress</h3>
            <canvas id="weightProgressChart" height="120"></canvas>
        `;

        generateCharts();
        generateWeightChart();

        // Weight Summary + Table
        const weight = Number(localStorage.getItem("userWeightLbs"));
        const goal = Number(localStorage.getItem("userWeightGoal"));
        const history = JSON.parse(localStorage.getItem("weightHistory")) || [];

        const startWeight = history.length ? history[0].weight : weight;
        const diff = weight - goal;

        let diffMsg = "";
        if (diff > 0) diffMsg = `${diff} lbs above goal`;
        else if (diff < 0) diffMsg = `${Math.abs(diff)} lbs below goal`;
        else diffMsg = "Goal reached!";

        content.innerHTML += `
            <div class="plan-box" style="margin-top:20px;">
                <h4>Weight Summary</h4>
                <p><strong>Start Weight:</strong> ${startWeight} lbs</p>
                <p><strong>Current Weight:</strong> ${weight} lbs</p>
                <p><strong>Goal Weight:</strong> ${goal} lbs</p>
                <p><strong>Difference:</strong> ${diffMsg}</p>
            </div>

            <h3 style="margin-top:30px;">Weight Log</h3>
            <table class="workout-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Weight</th>
                        <th>Difference from Goal</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        history.map(h => {
                            const d = h.weight - goal;
                            return `
                                <tr>
                                    <td>${h.date}</td>
                                    <td>${h.weight}</td>
                                    <td>${
                                        d > 0
                                        ? d + " above goal"
                                        : d < 0
                                            ? Math.abs(d) + " below goal"
                                            : "at goal"
                                    }</td>
                                </tr>
                            `;
                        }).join("")
                    }
                </tbody>
            </table>
        `;
    }

    // ---------- WORKOUT PLAN ----------
    if (page === "Workout Plan") {
        const goal = localStorage.getItem("userGoal");
        let plan = "";

        if (goal === "lose") {
            plan = `
                <h3>Weight Loss Plan</h3>
                <ul>
                    <li>4× Cardio (20–30 minutes)</li>
                    <li>2× Strength sessions</li>
                    <li>7k–10k daily steps</li>
                </ul>
            `;
        }

        else if (goal === "maintain") {
            plan = `
                <h3>Maintenance Plan</h3>
                <ul>
                    <li>2× Cardio</li>
                    <li>2× Light strength days</li>
                    <li>1× Active recovery</li>
                </ul>
            `;
        }

        else if (goal === "gain") {
            plan = `
                <h3>Weight Gain Plan</h3>
                <ul>
                    <li>3× Strength training</li>
                    <li>1× Light cardio</li>
                    <li>+200–300 calories per day</li>
                </ul>
            `;
        }

        else if (goal === "muscle") {
            plan = `
                <h3>Muscle Building Plan</h3>
                <ul>
                    <li>4× Strength Split (Upper/Lower/Push/Pull)</li>
                    <li>1× Low-intensity cardio</li>
                    <li>Progressive overload</li>
                </ul>
            `;
        }

        else {
            plan = `<p>No goal set. Update in Profile.</p>`;
        }

        content.innerHTML = `
            <h2>Workout Plan</h2>
            <div class="plan-box">${plan}</div>
        `;
    }

    // ---------- PROFILE ----------
    if (page === "Profile") {
        const name = localStorage.getItem("userName") || "";
        const feet = localStorage.getItem("userHeightFeet") || "";
        const inches = localStorage.getItem("userHeightInches") || "";
        const weight = localStorage.getItem("userWeightLbs") || "";
        const age = localStorage.getItem("userAge") || "";
        const goal = localStorage.getItem("userGoal") || "";
        const weightGoal = localStorage.getItem("userWeightGoal") || "";

        content.innerHTML = `
            <h2>User Profile</h2>

            <div id="profileView" class="profile-box">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Height:</strong> ${feet} ft ${inches} in</p>
                <p><strong>Weight:</strong> ${weight} lbs</p>
                <p><strong>Age:</strong> ${age}</p>
                <p><strong>Fitness Goal:</strong> ${formatGoal(goal)}</p>
                <p><strong>Weight Goal:</strong> ${weightGoal || "Not set"} lbs</p>

                <button id="updateWeightBtn">Update Weight</button>
                <button id="editProfileBtn">Edit Profile</button>
            </div>

            <div id="profileEdit" class="profile-box" style="display:none;">

                <label>Name:</label>
                <input type="text" id="profileName" value="${name}">

                <label>Height:</label>
                <div class="height-row">
                    <input type="number" id="profileHeightFeet" value="${feet}" placeholder="Feet">
                    <input type="number" id="profileHeightInches" value="${inches}" placeholder="Inches">
                </div>

                <label>Weight (lbs):</label>
                <input type="number" id="profileWeight" value="${weight}">

                <label>Age:</label>
                <input type="number" id="profileAge" value="${age}">

                <label>Fitness Goal:</label>
                <select id="profileGoal">
                    <option value="lose" ${goal==="lose"?"selected":""}>Lose Weight</option>
                    <option value="maintain" ${goal==="maintain"?"selected":""}>Maintain Weight</option>
                    <option value="gain" ${goal==="gain"?"selected":""}>Gain Weight</option>
                    <option value="muscle" ${goal==="muscle"?"selected":""}>Gain Muscle</option>
                </select>

                <label>Weight Goal (lbs):</label>
                <input type="number" id="profileWeightGoal" value="${weightGoal || ""}">

                <button id="saveProfileBtn">Save</button>
                <button id="cancelProfileBtn" class="cancel-btn">Cancel</button>
            </div>
        `;

        document.getElementById("editProfileBtn").onclick = () => {
            document.getElementById("profileView").style.display = "none";
            document.getElementById("profileEdit").style.display = "block";
        };

        document.getElementById("cancelProfileBtn").onclick = () => loadPage("Profile");

        document.getElementById("saveProfileBtn").onclick = saveProfileChanges;

        document.getElementById("updateWeightBtn").onclick = () => {
            weightModal.style.display = "block";
        };
    }

    // ---------- ACCOUNT SETTINGS ----------
    if (page === "Account Settings") {
        const email = localStorage.getItem("userEmail") || "";
        content.innerHTML = `
            <h2>Account Settings</h2>

            <div class="settings-box">
                <label>Change Email:</label>
                <input type="email" id="settingsEmail" value="${email}">

                <label>Change Password:</label>
                <input type="password" id="settingsPassword" placeholder="New password">

                <button id="saveSettingsBtn">Save Changes</button>
            </div>
        `;

        document.getElementById("saveSettingsBtn").onclick = saveAccountSettings;
    }
}


// ---------------------------------------
// PROFILE SAVE
// ---------------------------------------
function saveProfileChanges() {
    localStorage.setItem("userName", document.getElementById("profileName").value);
    localStorage.setItem("userHeightFeet", document.getElementById("profileHeightFeet").value);
    localStorage.setItem("userHeightInches", document.getElementById("profileHeightInches").value);
    localStorage.setItem("userAge", document.getElementById("profileAge").value);
    localStorage.setItem("userGoal", document.getElementById("profileGoal").value);

    const newGoal = document.getElementById("profileWeightGoal").value;
    if (newGoal) localStorage.setItem("userWeightGoal", newGoal);

    const newWeight = document.getElementById("profileWeight").value;
    localStorage.setItem("userWeightLbs", newWeight);

    if (newWeight) {
        const history = JSON.parse(localStorage.getItem("weightHistory")) || [];
        history.push({
            date: new Date().toISOString().split("T")[0],
            weight: Number(newWeight)
        });
        localStorage.setItem("weightHistory", JSON.stringify(history));
    }

    alert("Profile updated!");
    showWelcome();
    loadPage("Profile");
}


// ---------------------------------------
// ACCOUNT SETTINGS SAVE
// ---------------------------------------
function saveAccountSettings() {
    const email = document.getElementById("settingsEmail").value;
    const password = document.getElementById("settingsPassword").value;

    if (!email) {
        alert("Email cannot be empty.");
        return;
    }

    localStorage.setItem("userEmail", email);
    if (password.trim() !== "") {
        localStorage.setItem("userPassword", password);
    }

    alert("Account settings updated.");
}


// ---------------------------------------
// UPDATE WEIGHT MODAL SAVE
// ---------------------------------------
document.getElementById("saveNewWeightBtn").onclick = () => {
    const newWeight = document.getElementById("newWeightInput").value;

    if (!newWeight) {
        alert("Please enter a valid weight.");
        return;
    }

    localStorage.setItem("userWeightLbs", newWeight);

    const history = JSON.parse(localStorage.getItem("weightHistory")) || [];
    history.push({
        date: new Date().toISOString().split("T")[0],
        weight: Number(newWeight)
    });
    localStorage.setItem("weightHistory", JSON.stringify(history));

    weightModal.style.display = "none";
    alert("Weight updated!");
    loadPage("Profile");
};


// ---------------------------------------
// TRAINING LOG – CONDITIONAL FIELDS
// ---------------------------------------
function updateConditionalFields() {
    const type = document.getElementById("logType").value;
    const container = document.getElementById("conditionalFields");
    container.innerHTML = "";

    if (type === "running" || type === "walking" || type === "cycling") {
        container.innerHTML = `
            <label>Distance (miles):</label>
            <input type="number" id="logDistance">

            <label>Duration (minutes):</label>
            <input type="number" id="logDuration">
        `;
    }

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

    if (type === "bodyweight") {
        container.innerHTML = `
            <label>Exercise Name:</label>
            <input type="text" id="bwName">

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


// ---------------------------------------
// TRAINING LOG – LOAD TABLE
// ---------------------------------------
function loadWorkouts() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const body = document.getElementById("workoutTableBody");
    body.innerHTML = "";

    workouts.forEach((w, i) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${w.date}</td>
            <td>${w.type.charAt(0).toUpperCase() + w.type.slice(1)}</td>
            <td>${w.duration ? w.duration + " min" : "-"}</td>
            <td>${w.calories || "-"}</td>
            <td>
                ${w.distance ? `Distance: ${w.distance} mi<br>` : ""}
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
                <button class="editBtn" data-index="${i}">Edit</button>
                <button class="deleteBtn" data-index="${i}">Delete</button>
            </td>
        `;

        body.appendChild(row);
    });

    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.onclick = () => deleteWorkout(btn.dataset.index);
    });

    document.querySelectorAll(".editBtn").forEach(btn => {
        btn.onclick = () => openEditModal(btn.dataset.index);
    });

    const addBtn = document.getElementById("addWorkoutBtn");
    if (addBtn) addBtn.onclick = addWorkout;

    const typeSelect = document.getElementById("logType");
    if (typeSelect) typeSelect.onchange = updateConditionalFields;
}


// ---------------------------------------
// TRAINING LOG – ADD WORKOUT
// ---------------------------------------
function addWorkout() {
    const date = document.getElementById("logDate").value;
    const type = document.getElementById("logType").value;
    const calories = document.getElementById("logCalories").value;

    if (!date || !type) {
        alert("Date and exercise type required.");
        return;
    }

    let duration = "";
    let extra = {};

    if (type === "running" || type === "walking" || type === "cycling") {
        const dur = document.getElementById("logDuration");
        const dist = document.getElementById("logDistance");

        if (!dur.value) {
            alert("Duration required for this exercise.");
            return;
        }

        duration = dur.value;
        extra.distance = dist.value;
    }

    if (type === "lifting") {
        extra.liftName = document.getElementById("logLiftName").value;
        extra.sets = document.getElementById("logSets").value;
        extra.reps = document.getElementById("logReps").value;
        extra.weight = document.getElementById("logLiftWeight").value;
    }

    if (type === "bodyweight") {
        extra.bwName = document.getElementById("bwName").value;
        extra.bwSets = document.getElementById("bwSets").value;
        extra.bwReps = document.getElementById("bwReps").value;
        extra.bwDifficulty = document.getElementById("bwDifficulty").value;
    }

    if (type === "yoga") {
        extra.yogaType = document.getElementById("logYogaType").value;
        extra.difficulty = document.getElementById("logDifficulty").value;
    }

    if (type === "pilates") {
        extra.pilatesType = document.getElementById("logPilatesType").value;
        extra.pilatesIntensity = document.getElementById("logPilatesIntensity").value;
    }

    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];

    workouts.push({ date, type, duration, calories, ...extra });
    localStorage.setItem("workouts", JSON.stringify(workouts));

    loadPage("Training Log");
}


// ---------------------------------------
// TRAINING LOG – DELETE
// ---------------------------------------
function deleteWorkout(i) {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    workouts.splice(i, 1);
    localStorage.setItem("workouts", JSON.stringify(workouts));
    loadPage("Training Log");
}


// ---------------------------------------
// EDIT WORKOUT – OPEN MODAL
// ---------------------------------------
function openEditModal(i) {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const w = workouts[i];
    currentEditIndex = i;

    editModal.style.display = "block";

    document.getElementById("editDate").value = w.date;
    document.getElementById("editType").value = w.type;
    document.getElementById("editCalories").value = w.calories || "";

    renderEditConditionalFields(w.type, w);

    const editTypeSelect = document.getElementById("editType");
    editTypeSelect.onchange = () => {
        renderEditConditionalFields(editTypeSelect.value, {});
    };

    document.getElementById("saveEditBtn").onclick = saveWorkoutEdit;
}


// ---------------------------------------
// RENDER CONDITIONAL FIELDS FOR EDIT
// ---------------------------------------
function renderEditConditionalFields(type, w) {
    const container = document.getElementById("editConditionalFields");
    container.innerHTML = "";

    if (type === "running" || type === "walking" || type === "cycling") {
        container.innerHTML = `
            <label>Distance (miles):</label>
            <input type="number" id="editDistance" value="${w.distance || ""}">
            <label>Duration (minutes):</label>
            <input type="number" id="editDuration" value="${w.duration || ""}">
        `;
    }

    if (type === "lifting") {
        container.innerHTML = `
            <label>Exercise:</label>
            <input type="text" id="editLiftName" value="${w.liftName || ""}">
            <label>Sets:</label>
            <input type="number" id="editSets" value="${w.sets || ""}">
            <label>Reps:</label>
            <input type="number" id="editReps" value="${w.reps || ""}">
            <label>Weight:</label>
            <input type="number" id="editLiftWeight" value="${w.weight || ""}">
        `;
    }

    if (type === "bodyweight") {
        container.innerHTML = `
            <label>Exercise:</label>
            <input type="text" id="editBwName" value="${w.bwName || ""}">
            <label>Sets:</label>
            <input type="number" id="editBwSets" value="${w.bwSets || ""}">
            <label>Reps:</label>
            <input type="number" id="editBwReps" value="${w.bwReps || ""}">
            <label>Difficulty:</label>
            <select id="editBwDifficulty">
                <option value="easy" ${w.bwDifficulty==="easy"?"selected":""}>Easy</option>
                <option value="moderate" ${w.bwDifficulty==="moderate"?"selected":""}>Moderate</option>
                <option value="intense" ${w.bwDifficulty==="intense"?"selected":""}>Intense</option>
            </select>
        `;
    }

    if (type === "yoga") {
        container.innerHTML = `
            <label>Session:</label>
            <input type="text" id="editYogaType" value="${w.yogaType || ""}">
            <label>Difficulty:</label>
            <select id="editDifficulty">
                <option value="easy" ${w.difficulty==="easy"?"selected":""}>Easy</option>
                <option value="moderate" ${w.difficulty==="moderate"?"selected":""}>Moderate</option>
                <option value="intense" ${w.difficulty==="intense"?"selected":""}>Intense</option>
            </select>
        `;
    }

    if (type === "pilates") {
        container.innerHTML = `
            <label>Class:</label>
            <input type="text" id="editPilatesType" value="${w.pilatesType || ""}">
            <label>Intensity:</label>
            <select id="editPilatesIntensity">
                <option value="beginner" ${w.pilatesIntensity==="beginner"?"selected":""}>Beginner</option>
                <option value="intermediate" ${w.pilatesIntensity==="intermediate"?"selected":""}>Intermediate</option>
                <option value="advanced" ${w.pilatesIntensity==="advanced"?"selected":""}>Advanced</option>
            </select>
        `;
    }
}


// ---------------------------------------
// SAVE EDITED WORKOUT
// ---------------------------------------
function saveWorkoutEdit() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const type = document.getElementById("editType").value;

    const updated = {
        date: document.getElementById("editDate").value,
        type,
        calories: document.getElementById("editCalories").value || ""
    };

    let duration = "";
    let extra = {};

    if (type === "running" || type === "walking" || type === "cycling") {
        const dur = document.getElementById("editDuration");
        const dist = document.getElementById("editDistance");

        if (!dur.value) {
            alert("Duration required.");
            return;
        }

        duration = dur.value;
        extra.distance = dist.value;
    }

    if (type === "lifting") {
        extra.liftName = document.getElementById("editLiftName").value;
        extra.sets = document.getElementById("editSets").value;
        extra.reps = document.getElementById("editReps").value;
        extra.weight = document.getElementById("editLiftWeight").value;
    }

    if (type === "bodyweight") {
        extra.bwName = document.getElementById("editBwName").value;
        extra.bwSets = document.getElementById("editBwSets").value;
        extra.bwReps = document.getElementById("editBwReps").value;
        extra.bwDifficulty = document.getElementById("editBwDifficulty").value;
    }

    if (type === "yoga") {
        extra.yogaType = document.getElementById("editYogaType").value;
        extra.difficulty = document.getElementById("editDifficulty").value;
    }

    if (type === "pilates") {
        extra.pilatesType = document.getElementById("editPilatesType").value;
        extra.pilatesIntensity = document.getElementById("editPilatesIntensity").value;
    }

    updated.duration = duration;
    Object.assign(updated, extra);

    workouts[currentEditIndex] = updated;
    localStorage.setItem("workouts", JSON.stringify(workouts));

    alert("Workout updated!");
    editModal.style.display = "none";
    loadPage("Training Log");
}


// ---------------------------------------
// PROGRESS CHARTS
// ---------------------------------------
function generateCharts() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];

    const today = new Date();
    const last7 = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split("T")[0];
        last7.push({
            dateString,
            workouts: 0,
            miles: 0
        });
    }

    workouts.forEach(w => {
        const entry = last7.find(d => d.dateString === w.date);
        if (entry) {
            entry.workouts++;
            if (w.distance) entry.miles += Number(w.distance);
        }
    });

    const labels = last7.map(d => d.dateString.substring(5));
    const workoutData = last7.map(d => d.workouts);
    const distanceData = last7.map(d => d.miles);

    new Chart(document.getElementById("weeklyWorkoutsChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Workouts per Day",
                data: workoutData,
                backgroundColor: "#2563eb"
            }]
        }
    });

    new Chart(document.getElementById("weeklyDistanceChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Miles per Day",
                data: distanceData,
                borderColor: "#ff5722",
                borderWidth: 2
            }]
        }
    });
}


// ---------------------------------------
// WEIGHT PROGRESS CHART
// ---------------------------------------
function generateWeightChart() {
    const weightHistory = JSON.parse(localStorage.getItem("weightHistory")) || [];
    if (weightHistory.length === 0) return;

    new Chart(document.getElementById("weightProgressChart"), {
        type: "line",
        data: {
            labels: weightHistory.map(w => w.date),
            datasets: [{
                label: "Weight (lbs)",
                data: weightHistory.map(w => w.weight),
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.2)",
                borderWidth: 2,
                tension: 0.3
            }]
        }
    });
}


// ---------------------------------------
// FINAL INITIAL LOAD
// ---------------------------------------
if (userIsLoggedIn()) {
    highlightDashboard();
    loadPage("Dashboard");
} else {
    loadPage("Welcome");
}
