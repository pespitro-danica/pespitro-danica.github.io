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
const editModal = document.getElementById("editModal");

const closeBtns = document.querySelectorAll(".closeModal");

const createAccountSubmit = document.getElementById("createAccountSubmit");
const goalNext = document.getElementById("goalNext");
const finishSetup = document.getElementById("finishSetup");
const loginSubmit = document.getElementById("loginSubmit");
const loginClose = document.getElementById("loginClose");

const content = document.getElementById("content");
const navItems = document.querySelectorAll(".sidebar li");

let currentEditIndex = null; // for editing workouts


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
createBtn.onclick = () => {
    createModal.style.display = "block";
};

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
// LOGIN
// ---------------------------------------
loginBtn.onclick = () => {
    loginModal.style.display = "block";
};

loginClose.onclick = () => {
    loginModal.style.display = "none";
};

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
// WELCOME + LOGOUT
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

    alert("You have been logged out.");
};


// ---------------------------------------
// SIDEBAR NAV
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
    if (navItems[0]) navItems[0].classList.add("active");
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
            <p>Please login or create an account to continue.</p>
        `;
        return;
    }

    // ----------------- WELCOME (no login) -----------------
    if (page === "Welcome") {
        content.innerHTML = `
            <h2>Welcome!</h2>
            <p>Please login or create an account to continue.</p>
        `;
    }

    // ----------------- DASHBOARD -----------------
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
            if (!w.date) return;
            const wDate = new Date(w.date);
            if (wDate >= oneWeekAgo) {
                weeklyCount++;
                if (w.duration) weeklyMinutes += Number(w.duration);
                if (w.distance) weeklyMiles += Number(w.distance);
            }
        });

        const weight = Number(localStorage.getItem("userWeightLbs"));
        const weightGoal = Number(localStorage.getItem("userWeightGoal"));
        let weightMsg = "";

        if (weightGoal) {
            const diff = weightGoal - weight;
            if (!weight) {
                weightMsg = "Update your current weight in Profile.";
            } else if (diff > 0) {
                weightMsg = `You are ${diff} lbs away from your goal.`;
            } else if (diff < 0) {
                weightMsg = `You passed your goal by ${Math.abs(diff)} lbs!`;
            } else {
                weightMsg = `You reached your goal weight! 🎉`;
            }
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
                    <p class="card-number">${weightGoal ? weightGoal + " lbs" : "Not set"}</p>
                    <span>${weightGoal ? weightMsg : "Set your goal in Profile."}</span>
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

    // ----------------- TRAINING LOG -----------------
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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="workoutTableBody"></tbody>
            </table>
        `;

        loadWorkouts();
    }

    // ----------------- PROGRESS -----------------
    if (page === "Progress") {
        content.innerHTML = `
            <h2>Progress</h2>

            <canvas id="weeklyWorkoutsChart"></canvas>
            <canvas id="weeklyDistanceChart" style="margin-top: 40px;"></canvas>
        `;

        generateCharts();
    }

    // ----------------- WORKOUT PLAN -----------------
    if (page === "Workout Plan") {
        const goal = localStorage.getItem("userGoal");
        let plan = "";

        if (goal === "lose") {
            plan = `
                <h3>Weight Loss Plan</h3>
                <ul>
                    <li>4× Cardio (20–30 minutes each)</li>
                    <li>2× Bodyweight strength sessions</li>
                    <li>Daily steps: 7,000–10,000</li>
                </ul>
            `;
        } else if (goal === "maintain") {
            plan = `
                <h3>Maintenance Plan</h3>
                <ul>
                    <li>2× Cardio sessions</li>
                    <li>2× Light strength sessions</li>
                    <li>1× Active recovery day (yoga or stretching)</li>
                </ul>
            `;
        } else if (goal === "gain") {
            plan = `
                <h3>Weight Gain Plan</h3>
                <ul>
                    <li>3× Strength training per week</li>
                    <li>1× Light cardio</li>
                    <li>Eat 200–300 extra calories/day</li>
                </ul>
            `;
        } else if (goal === "muscle") {
            plan = `
                <h3>Muscle Building Plan</h3>
                <ul>
                    <li>4× Strength split (e.g., Upper / Lower / Push / Pull)</li>
                    <li>1–2× light cardio for heart health</li>
                    <li>Focus on progressive overload each week</li>
                </ul>
            `;
        } else {
            plan = `
                <p>No goal set yet. Go to your Profile and select a fitness goal.</p>
            `;
        }

        content.innerHTML = `
            <h2>Workout Plan</h2>
            <p>Your customized plan based on your goals:</p>
            <div class="plan-box">${plan}</div>
        `;
    }

    // ----------------- PROFILE -----------------
    if (page === "Profile") {
        const name = localStorage.getItem("userName") || "";
        const email = localStorage.getItem("userEmail") || "";
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
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Height:</strong> ${feet} ft ${inches} in</p>
                <p><strong>Weight:</strong> ${weight} lbs</p>
                <p><strong>Age:</strong> ${age}</p>
                <p><strong>Fitness Goal:</strong> ${formatGoal(goal)}</p>
                <p><strong>Weight Goal:</strong> ${weightGoal || "Not set"} lbs</p>

                <button id="editProfileBtn">Edit Profile</button>
            </div>

            <div id="profileEdit" class="profile-box" style="display:none;">
                <label>Name:</label>
                <input type="text" id="profileName" value="${name}">

                <label>Email:</label>
                <input type="email" id="profileEmail" value="${email}">

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
                <input type="number" id="profileWeightGoal" value="${weightGoal}" placeholder="Goal Weight">

                <button id="saveProfileBtn">Save</button>
                <button id="cancelProfileBtn" class="cancel-btn">Cancel</button>

            </div>

        `;

        // Activate buttons
        document.getElementById("editProfileBtn").onclick = () => {
            document.getElementById("profileView").style.display = "none";
            document.getElementById("profileEdit").style.display = "block";
        };

        document.getElementById("cancelProfileBtn").onclick = () => {
            loadPage("Profile");
        };

        document.getElementById("saveProfileBtn").onclick = saveProfileChanges;
    }

}


// ---------------------------------------
// PROFILE SAVE
// ---------------------------------------
function saveProfileChanges() {
    localStorage.setItem("userName", document.getElementById("profileName").value);
    localStorage.setItem("userEmail", document.getElementById("profileEmail").value);
    localStorage.setItem("userHeightFeet", document.getElementById("profileHeightFeet").value);
    localStorage.setItem("userHeightInches", document.getElementById("profileHeightInches").value);
    localStorage.setItem("userAge", document.getElementById("profileAge").value);
    localStorage.setItem("userWeightLbs", document.getElementById("profileWeight").value);
    localStorage.setItem("userGoal", document.getElementById("profileGoal").value);
    localStorage.setItem("userWeightGoal", document.getElementById("profileWeightGoal").value);

    alert("Profile updated!");
    showWelcome();
}


// ---------------------------------------
// TRAINING LOG – DYNAMIC FIELDS
// ---------------------------------------
function updateConditionalFields() {
    const type = document.getElementById("logType").value;
    const container = document.getElementById("conditionalFields");

    if (!container) return;
    container.innerHTML = "";

    // CARDIO — Running / Walking / Cycling
    if (type === "running" || type === "walking" || type === "cycling") {
        container.innerHTML = `
            <label>Distance (miles):</label>
            <input type="number" id="logDistance">

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


// ---------------------------------------
// TRAINING LOG – LOAD TABLE
// ---------------------------------------
function loadWorkouts() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const table = document.getElementById("workoutTableBody");

    if (!table) return;
    table.innerHTML = "";

    workouts.forEach((w, index) => {
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
                <button class="editBtn" data-index="${index}">Edit</button>
                <button class="deleteBtn" data-index="${index}">Delete</button>
            </td>
        `;

        table.appendChild(row);
    });

    // Delete listeners
    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.onclick = () => deleteWorkout(btn.dataset.index);
    });

    // Edit listeners
    document.querySelectorAll(".editBtn").forEach(btn => {
        btn.onclick = () => openEditModal(btn.dataset.index);
    });

    // Add workout listener
    const addBtn = document.getElementById("addWorkoutBtn");
    if (addBtn) addBtn.onclick = addWorkout;

    // Dynamic fields
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
    let extraData = {};

    // CARDIO – Duration required
    if (type === "running" || type === "walking" || type === "cycling") {
        const durField = document.getElementById("logDuration");
        if (!durField) {
            alert("Error: Duration field missing. Try reselecting exercise type.");
            return;
        }

        duration = durField.value;
        if (!duration) {
            alert("Duration is required for this exercise.");
            return;
        }

        extraData.distance = document.getElementById("logDistance").value;
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


// ---------------------------------------
// TRAINING LOG – DELETE WORKOUT
// ---------------------------------------
function deleteWorkout(index) {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    workouts.splice(index, 1);
    localStorage.setItem("workouts", JSON.stringify(workouts));
    loadPage("Training Log");
}


// ---------------------------------------
// EDIT WORKOUT – OPEN MODAL
// ---------------------------------------
function openEditModal(index) {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const w = workouts[index];
    if (!w) return;

    currentEditIndex = index;

    editModal.style.display = "block";

    document.getElementById("editDate").value = w.date;
    document.getElementById("editType").value = w.type;
    document.getElementById("editCalories").value = w.calories || "";

    renderEditConditionalFields(w.type, w);

    const editTypeSelect = document.getElementById("editType");
    if (editTypeSelect) {
        editTypeSelect.onchange = () => {
            const newType = editTypeSelect.value;
            renderEditConditionalFields(newType, {});
        };
    }

    document.getElementById("saveEditBtn").onclick = saveWorkoutEdit;
}


// ---------------------------------------
// EDIT WORKOUT – RENDER DYNAMIC FIELDS
// ---------------------------------------
function renderEditConditionalFields(type, w) {
    const container = document.getElementById("editConditionalFields");
    if (!container) return;
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
            <label>Exercise Name:</label>
            <input type="text" id="editLiftName" value="${w.liftName || ""}">

            <label>Sets:</label>
            <input type="number" id="editSets" value="${w.sets || ""}">

            <label>Reps per Set:</label>
            <input type="number" id="editReps" value="${w.reps || ""}">

            <label>Weight (lbs):</label>
            <input type="number" id="editLiftWeight" value="${w.weight || ""}">
        `;
    }

    if (type === "bodyweight") {
        container.innerHTML = `
            <label>Exercise Name:</label>
            <input type="text" id="editBwName" value="${w.bwName || ""}">

            <label>Sets:</label>
            <input type="number" id="editBwSets" value="${w.bwSets || ""}">

            <label>Reps per Set:</label>
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
            <label>Session Type:</label>
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
            <label>Class Type:</label>
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


// Close Edit modal
document.getElementById("editClose").onclick = () => {
    editModal.style.display = "none";
};


// ---------------------------------------
// EDIT WORKOUT – SAVE
// ---------------------------------------
function saveWorkoutEdit() {
    if (currentEditIndex === null) return;

    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const old = workouts[currentEditIndex];
    if (!old) return;

    const updatedType = document.getElementById("editType").value;

    const updated = {
        date: document.getElementById("editDate").value,
        type: updatedType,
        calories: document.getElementById("editCalories").value || ""
    };

    let duration = "";
    let extraData = {};

    if (updatedType === "running" || updatedType === "walking" || updatedType === "cycling") {
        const durField = document.getElementById("editDuration");
        const distField = document.getElementById("editDistance");
        if (durField) {
            duration = durField.value;
            if (!duration) {
                alert("Duration is required for this exercise.");
                return;
            }
        }
        extraData.distance = distField ? distField.value : "";
    }

    if (updatedType === "lifting") {
        extraData.liftName = document.getElementById("editLiftName").value;
        extraData.sets = document.getElementById("editSets").value;
        extraData.reps = document.getElementById("editReps").value;
        extraData.weight = document.getElementById("editLiftWeight").value;
    }

    if (updatedType === "bodyweight") {
        extraData.bwName = document.getElementById("editBwName").value;
        extraData.bwSets = document.getElementById("editBwSets").value;
        extraData.bwReps = document.getElementById("editBwReps").value;
        extraData.bwDifficulty = document.getElementById("editBwDifficulty").value;
    }

    if (updatedType === "yoga") {
        extraData.yogaType = document.getElementById("editYogaType").value;
        extraData.difficulty = document.getElementById("editDifficulty").value;
    }

    if (updatedType === "pilates") {
        extraData.pilatesType = document.getElementById("editPilatesType").value;
        extraData.pilatesIntensity = document.getElementById("editPilatesIntensity").value;
    }

    updated.duration = duration;
    Object.assign(updated, extraData);

    workouts[currentEditIndex] = updated;
    localStorage.setItem("workouts", JSON.stringify(workouts));

    alert("Workout updated!");
    editModal.style.display = "none";
    currentEditIndex = null;
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
        if (!w.date) return;
        const entry = last7.find(d => d.dateString === w.date);
        if (entry) {
            entry.workouts++;
            if (w.distance) entry.miles += Number(w.distance);
        }
    });

    const labels = last7.map(d => d.dateString.substring(5));
    const workoutData = last7.map(d => d.workouts);
    const distanceData = last7.map(d => d.miles);

    const workoutsCanvas = document.getElementById("weeklyWorkoutsChart");
    const distanceCanvas = document.getElementById("weeklyDistanceChart");

    if (workoutsCanvas) {
        new Chart(workoutsCanvas, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Workouts per day",
                    data: workoutData,
                }]
            }
        });
    }

    if (distanceCanvas) {
        new Chart(distanceCanvas, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Miles per day",
                    data: distanceData,
                }]
            }
        });
    }
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
