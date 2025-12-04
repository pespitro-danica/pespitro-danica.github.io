/* ---------------------------
   GLOBAL STATE & HELPERS
--------------------------- */

// Range for dashboard totals: "week" or "month"
let dashboardRange = "week";
// Profile editing toggle
let profileEditing = false;
// Calendar month offset from current month
let calendarMonthOffset = 0;
// Allows app to store multi-user storage
let currentUser = localStorage.getItem("loggedInUser") || "";


// Helper: capitalize / pretty name for types
function formatType(type) {
    switch (type) {
        case "running": return "Running";
        case "walking": return "Walking";
        case "cycling": return "Cycling";
        case "lifting": return "Weight Lifting";
        case "bodyweight": return "Bodyweight Training";
        case "yoga": return "Yoga";
        case "pilates": return "Pilates";
        default:
            return type ? type.charAt(0).toUpperCase() + type.slice(1) : "";
    }
}

// Helper: convert "YYYY-MM-DD" -> "MM/DD/YYYY"
function formatDateDisplay(iso) {
    if (!iso || typeof iso !== "string" || !iso.includes("-")) return iso || "";
    const [y, m, d] = iso.split("-");
    return `${m}/${d}/${y}`;
}

// Helper: build text/HTML details for a workout
function buildWorkoutDetails(w) {
    const lines = [];

    // Cardio
    if (["running", "walking", "cycling"].includes(w.type)) {
        if (w.distance) lines.push(`Distance: ${w.distance} mi`);
        if (w.duration) lines.push(`Duration: ${w.duration} min`);
    }

    // Lifting
    if (w.type === "lifting") {
        if (w.liftName) lines.push(`Exercise: ${w.liftName}`);
        if (w.sets || w.reps) {
            const s = w.sets ? w.sets : "?";
            const r = w.reps ? w.reps : "?";
            lines.push(`Sets × Reps: ${s} × ${r}`);
        }
        if (w.weight) lines.push(`Weight: ${w.weight} lbs`);
    }

    // Bodyweight
    if (w.type === "bodyweight") {
        if (w.bwName) lines.push(`Exercise: ${w.bwName}`);
        if (w.bwSets || w.bwReps) {
            const s = w.bwSets ? w.bwSets : "?";
            const r = w.bwReps ? w.bwReps : "?";
            lines.push(`Sets × Reps: ${s} × ${r}`);
        }
    }

    // Yoga
    if (w.type === "yoga") {
        if (w.yogaType) lines.push(`Yoga Type: ${w.yogaType}`);
        if (w.difficulty) lines.push(`Difficulty: ${w.difficulty}`);
        if (w.duration) lines.push(`Duration: ${w.duration} min`);
    }

    // Pilates
    if (w.type === "pilates") {
        if (w.pilatesType) lines.push(`Pilates Type: ${w.pilatesType}`);
        if (w.pilatesIntensity) lines.push(`Intensity: ${w.pilatesIntensity}`);
        if (w.duration) lines.push(`Duration: ${w.duration} min`);
    }

    // Calories for everything
    if (w.calories) lines.push(`Calories: ${w.calories}`);

    if (!lines.length) return "-";
    return lines.join("<br>");
}

/* ---------------------------
   DOM ELEMENTS
--------------------------- */

// Header elements
const loginBtn = document.getElementById("loginBtn");
const createBtn = document.getElementById("createBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeMsg = document.getElementById("welcomeMsg");

// Modals
const loginModal = document.getElementById("loginModal");
const createModal = document.getElementById("createModal");
const goalModal = document.getElementById("goalModal");
const statsModal = document.getElementById("statsModal");
const weightModal = document.getElementById("weightModal");
const editModal = document.getElementById("editModal");

const closeBtns = document.querySelectorAll(".closeModal");

// Modal buttons
const loginSubmit = document.getElementById("loginSubmit");
const createAccountSubmit = document.getElementById("createAccountSubmit");
const goalNext = document.getElementById("goalNext");
const finishSetup = document.getElementById("finishSetup");
const saveNewWeightBtn = document.getElementById("saveNewWeightBtn");
const saveEditBtn = document.getElementById("saveEditBtn");

// Sidebar
const content = document.getElementById("content");
const navItems = document.querySelectorAll(".sidebar li");

// Account settings (sidebar)
const accountSettingsNav = document.getElementById("accountSettingsNav");

/* ---------------------------
   LOGIN SYSTEM
--------------------------- */

loginBtn.onclick = () => {
    loginModal.style.display = "block";
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

};

createBtn.onclick = () => {
    createModal.style.display = "block";
    document.getElementById("regName").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPassword").value = "";

};

closeBtns.forEach(btn => {
    btn.onclick = () => {
        loginModal.style.display = "none";
        createModal.style.display = "none";
        goalModal.style.display = "none";
        statsModal.style.display = "none";
        weightModal.style.display = "none";
        editModal.style.display = "none";
    };
});

/* ---------- APP INIT ON PAGE LOAD ---------- */
function initializeApp() {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const savedUser = localStorage.getItem("loggedInUser");

    if (isLoggedIn && savedUser) {
        // Restore current user
        currentUser = savedUser;

        // Header UI: show welcome + logout, hide login/create
        showWelcome();

        // Enable sidebar
        document.querySelectorAll(".sidebar li").forEach(item => {
            item.style.pointerEvents = "auto";
            item.style.opacity = "1";
        });

        // Load their dashboard instead of welcome screen
        loadPage("Dashboard");
    } else {
        // Treat as logged out
        currentUser = "";

        // Header UI: hide welcome, show login/create
        welcomeMsg.style.display = "none";
        loginBtn.style.display = "inline";
        createBtn.style.display = "inline";
        logoutBtn.style.display = "none";

        // Disable sidebar
        document.querySelectorAll(".sidebar li").forEach(item => {
            item.style.pointerEvents = "none";
            item.style.opacity = "0.5";
        });

        // Show welcome screen
        loadPageWelcome();
    }
}

// Run this once when the script loads
initializeApp();


/* ---------- CREATE ACCOUNT: STEP 1 ---------- */
createAccountSubmit.onclick = () => {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        alert("All fields required!");
        return;
    }

    localStorage.setItem(email + "_userName", name);
    localStorage.setItem(email + "_userEmail", email);
    localStorage.setItem(email + "_userPassword", password);

    localStorage.setItem("pendingEmail", email);
    createModal.style.display = "none";
    goalModal.style.display = "block";
};

/* ---------- CREATE ACCOUNT: STEP 2 ---------- */
goalNext.onclick = () => {
    const email = localStorage.getItem("pendingEmail");
    const goal = document.getElementById("goalSelect").value;
    localStorage.setItem(email + "_userGoal", goal);

    localStorage.setItem("pendingEmail", email);

    goalModal.style.display = "none";
    statsModal.style.display = "block";

    document.getElementById("userHeightFeet").value = "";
    document.getElementById("userHeightInches").value = "";
    document.getElementById("userWeightLbs").value = "";
    document.getElementById("regWeightGoal").value = "";
    document.getElementById("userAge").value = "";

};

/* ---------- CREATE ACCOUNT: STEP 3 ---------- */
finishSetup.onclick = () => {
    const email = localStorage.getItem("pendingEmail");
    const feet = document.getElementById("userHeightFeet").value;
    const inches = document.getElementById("userHeightInches").value;
    const weight = document.getElementById("userWeightLbs").value;
    const goalWeight = document.getElementById("regWeightGoal").value;
    const age = document.getElementById("userAge").value;

    if (!feet || !inches || !weight || !goalWeight || !age) {
        alert("All fields required!");
        return;
    }

    const totalHeight = Number(feet) * 12 + Number(inches);

    localStorage.setItem(email + "_userHeightInches", totalHeight);
    localStorage.setItem(email + "_userWeightLbs", weight);
    localStorage.setItem(email + "_userWeightGoal", goalWeight);
    localStorage.setItem(email + "_userAge", age);

    const history = [{
        date: new Date().toISOString().split("T")[0],
        weight: Number(weight)
    }];
    localStorage.setItem(email + "_weightHistory", JSON.stringify(history));


    statsModal.style.display = "none";
    showWelcome();
    loadPage("Dashboard");

    localStorage.removeItem("pendingEmail");
};

/* ---------- LOGIN HANDLER ---------- */
loginSubmit.onclick = () => {
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPassword").value;

    const storedEmail = localStorage.getItem(email + "_userEmail");
    const storedPass = localStorage.getItem(email + "_userPassword");


    if (email === storedEmail && pass === storedPass) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("loggedInUser", email);
        currentUser = email;


        document.querySelectorAll(".sidebar li").forEach(item => {
          item.style.pointerEvents = "auto";
        });

        loginModal.style.display = "none";
        showWelcome();
        loadPage("Dashboard");
    } else {
        alert("Invalid login.");
    }
};


/* ---------- LOGOUT ---------- */
logoutBtn.onclick = () => {
    // Remove login flag
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    currentUser = "";


    // Disable sidebar navigation
    document.querySelectorAll(".sidebar li").forEach(item => {
        item.style.pointerEvents = "none";
        item.style.opacity = "0.5";
    });

    // Reset header UI
    welcomeMsg.style.display = "none";
    loginBtn.style.display = "inline";
    createBtn.style.display = "inline";
    logoutBtn.style.display = "none";

    // Load welcome screen after UI reset
    setTimeout(() => {
        loadPageWelcome();
    }, 20);
};



/* ---------- WELCOME DISPLAY ---------- */
function showWelcome() {
    const name = localStorage.getItem(currentUser + "_userName");


    if (name) {
        welcomeMsg.textContent = "Hi, " + name;
        welcomeMsg.style.display = "inline";
        loginBtn.style.display = "none";
        createBtn.style.display = "none";
        logoutBtn.style.display = "inline";
    }
}

/* ---------------------------
   SIDEBAR NAVIGATION
--------------------------- */

accountSettingsNav.addEventListener("click", () => {
    // Prevent navigation if logged out
    if (!currentUser) {
        alert("Please log in first.");
        return;
    }

    // Remove active class from other nav items
    navItems.forEach(i => i.classList.remove("active"));

    // Add active class to Account Settings
    accountSettingsNav.classList.add("active");

    // Load the Account Settings page
    loadAccountSettings();
});

/* ---------------------------
   INITIAL PAGE FOR LOGGED-OUT USERS
--------------------------- */

function loadPageWelcome() {
    content.innerHTML = `
        <h2>Welcome to Witness My Fitness</h2>
        <p>Please log in or create an account to begin tracking your fitness journey.</p>
    `;
}

/* ---------------------------
   MAIN PAGE LOADER
--------------------------- */

function loadPage(page) {
    if (!localStorage.getItem(currentUser + "_userName")) {
        loadPageWelcome();
        return;
    }

    if (page === "Dashboard") loadDashboard();
    if (page === "Progress") loadProgress();
    if (page === "Training Log") loadTrainingLog();
    if (page === "Workout Plan") loadWorkoutPlan();
    if (page === "Profile") loadProfilePage();
}

/* ---------------------------
   DASHBOARD HELPERS
--------------------------- */

function getDashboardStats(range) {
    const workouts = JSON.parse(localStorage.getItem(currentUser + "_workouts") || "[]");

    const now = new Date();
    let start, end;

    if (range === "week") {
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - start.getDay()); // Sunday
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
    } else { // "month"
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    let totalWorkouts = 0;
    let totalDistance = 0;
    let totalMinutes = 0;
    let totalCalories = 0;

    workouts.forEach(w => {
        if (!w.date) return;
        const d = new Date(w.date);
        if (isNaN(d)) return;
        if (d < start || d > end) return;

        totalWorkouts += 1;

        if (w.distance) totalDistance += Number(w.distance) || 0;
        if (w.duration) totalMinutes += Number(w.duration) || 0;
        if (w.calories) totalCalories += Number(w.calories) || 0;
    });

    return { totalWorkouts, totalDistance, totalMinutes, totalCalories };
}

/* ---------------------------
   DASHBOARD
--------------------------- */

function loadDashboard() {
    const workouts = JSON.parse(localStorage.getItem(currentUser + "_workouts") || "[]");

    const lastWorkout = workouts.length ? workouts[workouts.length - 1] : null;
    const stats = getDashboardStats(dashboardRange);

    content.innerHTML = `
        <h2>Dashboard</h2>

        <div class="dashboard-toggle">
            <button id="dashWeekBtn" class="toggle-btn ${dashboardRange === "week" ? "active" : ""}">This Week</button>
            <button id="dashMonthBtn" class="toggle-btn ${dashboardRange === "month" ? "active" : ""}">This Month</button>
        </div>

        <div class="dashboard-grid">
            <div class="card">
                <h3>Total Workouts</h3>
                <div class="card-number">${stats.totalWorkouts}</div>
            </div>

            <div class="card">
                <h3>Total Distance (mi)</h3>
                <div class="card-number">${stats.totalDistance.toFixed(1)}</div>
            </div>

            <div class="card">
                <h3>Total Minutes</h3>
                <div class="card-number">${stats.totalMinutes}</div>
            </div>

            <div class="card">
                <h3>Calories Burned</h3>
                <div class="card-number">${stats.totalCalories}</div>
            </div>
        </div>

        <h3 style="margin-top:25px;">Last Logged Workout</h3>

        ${
            lastWorkout ? `
            <div class="last-workout-card">
                <strong>${formatType(lastWorkout.type).toUpperCase()}</strong>
                on ${formatDateDisplay(lastWorkout.date)}<br>
                ${buildWorkoutDetails(lastWorkout)}
            </div>` : `<p>No workouts logged yet.</p>`
        }

        <h3 style="margin-top:40px;">Workout Calendar</h3>
        <div id="calendarContainer"></div>
        <div id="calendarDetails" class="plan-box" style="display:none; margin-top:20px;"></div>
    `;

    document.getElementById("dashWeekBtn").onclick = () => {
        dashboardRange = "week";
        loadDashboard();
    };
    document.getElementById("dashMonthBtn").onclick = () => {
        dashboardRange = "month";
        loadDashboard();
    };

    renderCalendar();
}

/* ---------------------------
   CALENDAR
--------------------------- */

function renderCalendar() {
    const container = document.getElementById("calendarContainer");
    const workouts = JSON.parse(localStorage.getItem(currentUser + "_workouts") || "[]");

    const today = new Date();
    const displayDate = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset, 1);
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const monthName = displayDate.toLocaleString("default", { month: "long" });

    container.innerHTML = `
        <div class="calendar-header">
            <button id="prevMonthBtn" class="cal-btn">←</button>
            <h3>${monthName} ${year}</h3>
            <button id="nextMonthBtn" class="cal-btn">→</button>
        </div>

        <div class="calendar-grid" id="calendarGrid">
            ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
                .map(d => `<div class="calendar-day-name">${d}</div>`).join("")}
        </div>
    `;

    const grid = document.getElementById("calendarGrid");

    // Empty cells before day 1
    for (let i = 0; i < firstDay.getDay(); i++) {
        grid.innerHTML += `<div class="calendar-day empty"></div>`;
    }

    // Days
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const dateString = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const todaysWorkouts = workouts.filter(w => w.date === dateString);

        grid.innerHTML += `
            <div class="calendar-day ${todaysWorkouts.length ? "has-workout" : ""}"
                 data-date="${dateString}">
                <span>${d}</span>
                ${todaysWorkouts.length ? `<div class="dot"></div>` : ""}
            </div>
        `;
    }

    document.getElementById("prevMonthBtn").onclick = () => {
        calendarMonthOffset--;
        renderCalendar();
    };
    document.getElementById("nextMonthBtn").onclick = () => {
        calendarMonthOffset++;
        renderCalendar();
    };

    document.querySelectorAll(".calendar-day.has-workout").forEach(day => {
        day.onclick = () => showWorkoutsForDay(day.dataset.date);
    });
}

function showWorkoutsForDay(date) {
    const box = document.getElementById("calendarDetails");
    const workouts = JSON.parse(localStorage.getItem(currentUser + "_workouts") || "[]");
    const todays = workouts.filter(w => w.date === date);

    if (!todays.length) return;

    box.style.display = "block";
    box.innerHTML = `
        <h3>Workouts on ${formatDateDisplay(date)}</h3>
        ${
            todays.map(w => `
                <div class="calendar-workout-card">
                    <p><strong>${formatType(w.type)}</strong></p>
                    <p>${buildWorkoutDetails(w)}</p>
                </div>
            `).join("")
        }
    `;
}

/* ---------------------------
   TRAINING LOG PAGE
--------------------------- */
function loadTrainingLog() {
    content.innerHTML = `
        <h2>Training Log</h2>

        <div class="plan-box">
            <h2>Add Workout</h2>

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

        <h3 style="margin-top:25px;">Your Logged Workouts</h3>
        <table class="workout-table">
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

    setupDynamicWorkoutFields();
    loadWorkouts();
}


/* ---------------------------
   WORKOUT DYNAMIC FIELDS
--------------------------- */

function setupDynamicWorkoutFields() {
    const typeSelect = document.getElementById("logType");
    const fieldsBox = document.getElementById("conditionalFields");

    typeSelect.onchange = () => {
        const type = typeSelect.value;
        fieldsBox.innerHTML = "";

        if (["running","walking","cycling"].includes(type)) {
            fieldsBox.innerHTML = `
                <label>Distance (miles):</label>
                <input type="number" id="logDistance">

                <label>Duration (minutes):</label>
                <input type="number" id="logDuration">
            `;
        }

        if (type === "lifting") {
            fieldsBox.innerHTML = `
                <label>Exercise Name:</label>
                <input type="text" id="liftName">

                <label>Sets:</label>
                <input type="number" id="sets">

                <label>Reps:</label>
                <input type="number" id="reps">

                <label>Weight (lbs):</label>
                <input type="number" id="liftWeight">
            `;
        }

        if (type === "bodyweight") {
            fieldsBox.innerHTML = `
                <label>Exercise Name:</label>
                <input type="text" id="bwName">

                <label>Sets:</label>
                <input type="number" id="bwSets">

                <label>Reps:</label>
                <input type="number" id="bwReps">
            `;
        }

        if (type === "yoga") {
            fieldsBox.innerHTML = `
                <label>Yoga Type:</label>
                <input type="text" id="yogaType">

                <label>Difficulty:</label>
                <select id="yogaDifficulty">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
            `;
        }

        if (type === "pilates") {
            fieldsBox.innerHTML = `
                <label>Pilates Type:</label>
                <input type="text" id="pilatesType">

                <label>Intensity:</label>
                <select id="pilatesIntensity">
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                </select>
            `;
        }
    };

    document.getElementById("addWorkoutBtn").onclick = addWorkout;
}

/* ---------------------------
   ADD WORKOUT
--------------------------- */

function addWorkout() {
    const date = document.getElementById("logDate").value;
    const type = document.getElementById("logType").value;
    const calories = Number(document.getElementById("logCalories").value);

    if (!date || !type) {
        alert("Please fill out all required fields.");
        return;
    }

    let newWorkout = { date, type, calories };

    if (["running","walking","cycling"].includes(type)) {
        newWorkout.distance = Number(document.getElementById("logDistance").value);
        newWorkout.duration = Number(document.getElementById("logDuration").value);
    }

    if (type === "lifting") {
        newWorkout.liftName = document.getElementById("liftName").value;
        newWorkout.sets = Number(document.getElementById("sets").value);
        newWorkout.reps = Number(document.getElementById("reps").value);
        newWorkout.weight = Number(document.getElementById("liftWeight").value);
    }

    if (type === "bodyweight") {
        newWorkout.bwName = document.getElementById("bwName").value;
        newWorkout.bwSets = Number(document.getElementById("bwSets").value);
        newWorkout.bwReps = Number(document.getElementById("bwReps").value);
    }

    if (type === "yoga") {
        newWorkout.yogaType = document.getElementById("yogaType").value;
        newWorkout.difficulty = document.getElementById("yogaDifficulty").value;
        newWorkout.duration = Number(document.getElementById("logDuration")?.value || newWorkout.duration || 0);
    }

    if (type === "pilates") {
        newWorkout.pilatesType = document.getElementById("pilatesType").value;
        newWorkout.pilatesIntensity = document.getElementById("pilatesIntensity").value;
        newWorkout.duration = Number(document.getElementById("logDuration")?.value || newWorkout.duration || 0);
    }

    const workouts = JSON.parse(localStorage.getItem(currentUser + "_workouts") || "[]");
    workouts.push(newWorkout);
    localStorage.setItem(currentUser + "_workouts", JSON.stringify(workouts));

    loadTrainingLog();
    renderCalendar();
}

/* ---------------------------
   LOAD WORKOUTS TABLE
--------------------------- */

function loadWorkouts() {
    const tbody = document.getElementById("workoutTableBody");
    const workouts = JSON.parse(localStorage.getItem(currentUser + "_workouts") || "[]");
    tbody.innerHTML = "";

    workouts.forEach((w, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${formatDateDisplay(w.date)}</td>
            <td>${formatType(w.type)}</td>
            <td>${w.duration ? w.duration + " min" : "-"}</td>
            <td>${w.calories || "-"}</td>
            <td>${buildWorkoutDetails(w)}</td>
            <td>
                <button class="editBtn" onclick="openEditModal(${index})">Edit</button>
                <button class="deleteBtn" onclick="deleteWorkout(${index})">Delete</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/* ---------------------------
   DELETE WORKOUT
--------------------------- */

function deleteWorkout(index) {
    const workouts = JSON.parse(localStorage.getItem(currentUser + "_workouts") || "[]");
    workouts.splice(index, 1);
    localStorage.setItem(currentUser + "_workouts", JSON.stringify(workouts));

    loadTrainingLog();
    renderCalendar();
}

/* ---------------------------
   EDIT WORKOUT MODAL
--------------------------- */

function openEditModal(index) {
    editModal.style.display = "block";

    const workouts = JSON.parse(localStorage.getItem(currentUser + "_workouts") || "[]");
    const w = workouts[index];

    document.getElementById("editDate").value = w.date;
    document.getElementById("editType").value = w.type;
    document.getElementById("editCalories").value = w.calories || "";

    const editFields = document.getElementById("editConditionalFields");
    editFields.innerHTML = "";

    const type = w.type;

    if (["running","walking","cycling"].includes(type)) {
        editFields.innerHTML = `
            <label>Distance (miles):</label>
            <input type="number" id="editDistance" value="${w.distance || ""}">

            <label>Duration (minutes):</label>
            <input type="number" id="editDuration" value="${w.duration || ""}">
        `;
    }

    if (type === "lifting") {
        editFields.innerHTML = `
            <label>Exercise Name:</label>
            <input type="text" id="editLiftName" value="${w.liftName || ""}">

            <label>Sets:</label>
            <input type="number" id="editSets" value="${w.sets || ""}">

            <label>Reps:</label>
            <input type="number" id="editReps" value="${w.reps || ""}">

            <label>Weight (lbs):</label>
            <input type="number" id="editLiftWeight" value="${w.weight || ""}">
        `;
    }

    if (type === "bodyweight") {
        editFields.innerHTML = `
            <label>Exercise Name:</label>
            <input type="text" id="editBWName" value="${w.bwName || ""}">

            <label>Sets:</label>
            <input type="number" id="editBWSets" value="${w.bwSets || ""}">

            <label>Reps:</label>
            <input type="number" id="editBWReps" value="${w.bwReps || ""}">
        `;
    }

    if (type === "yoga") {
        editFields.innerHTML = `
            <label>Yoga Type:</label>
            <input type="text" id="editYogaType" value="${w.yogaType || ""}">

            <label>Difficulty:</label>
            <select id="editYogaDifficulty">
                <option value="Beginner" ${w.difficulty==="Beginner"?"selected":""}>Beginner</option>
                <option value="Intermediate" ${w.difficulty==="Intermediate"?"selected":""}>Intermediate</option>
                <option value="Advanced" ${w.difficulty==="Advanced"?"selected":""}>Advanced</option>
            </select>
        `;
    }

    if (type === "pilates") {
        editFields.innerHTML = `
            <label>Pilates Type:</label>
            <input type="text" id="editPilatesType" value="${w.pilatesType || ""}">

            <label>Intensity:</label>
            <select id="editPilatesIntensity">
                <option value="Low" ${w.pilatesIntensity==="Low"?"selected":""}>Low</option>
                <option value="Moderate" ${w.pilatesIntensity==="Moderate"?"selected":""}>Moderate</option>
                <option value="High" ${w.pilatesIntensity==="High"?"selected":""}>High</option>
            </select>
        `;
    }

    saveEditBtn.onclick = () => saveEditedWorkout(index);
}

function saveEditedWorkout(index) {
    const workouts = JSON.parse(localStorage.getItem(currentUser + "_workouts") || "[]");
    const w = workouts[index];
    const type = w.type;

    w.date = document.getElementById("editDate").value;
    w.calories = Number(document.getElementById("editCalories").value);

    if (["running","walking","cycling"].includes(type)) {
        w.distance = Number(document.getElementById("editDistance").value);
        w.duration = Number(document.getElementById("editDuration").value);
    }

    if (type === "lifting") {
        w.liftName = document.getElementById("editLiftName").value;
        w.sets = Number(document.getElementById("editSets").value);
        w.reps = Number(document.getElementById("editReps").value);
        w.weight = Number(document.getElementById("editLiftWeight").value);
    }

    if (type === "bodyweight") {
        w.bwName = document.getElementById("editBWName").value;
        w.bwSets = Number(document.getElementById("editBWSets").value);
        w.bwReps = Number(document.getElementById("editBWReps").value);
    }

    if (type === "yoga") {
        w.yogaType = document.getElementById("editYogaType").value;
        w.difficulty = document.getElementById("editYogaDifficulty").value;
    }

    if (type === "pilates") {
        w.pilatesType = document.getElementById("editPilatesType").value;
        w.pilatesIntensity = document.getElementById("editPilatesIntensity").value;
    }

    localStorage.setItem(currentUser + "_workouts", JSON.stringify(workouts));
    editModal.style.display = "none";

    loadTrainingLog();
    renderCalendar();
}

/* ---------------------------
   PROGRESS PAGE & CHARTS
--------------------------- */

function loadProgress() {
    const weight = Number(localStorage.getItem(currentUser + "_userWeightLbs"));
    const goal = Number(localStorage.getItem(currentUser + "_userWeightGoal"));
    const history = JSON.parse(localStorage.getItem(currentUser + "_weightHistory") || "[]");


    const startWeight = history.length ? history[0].weight : weight;
    const diff = weight - goal;

    let diffMsg = "";
    if (diff > 0) diffMsg = `${diff} lbs above goal`;
    else if (diff < 0) diffMsg = `${Math.abs(diff)} lbs below goal`;
    else diffMsg = "Goal reached!";

    content.innerHTML = `
        <h2>Progress</h2>

        <!-- Row 1: Workout Charts -->
        <div class="progress-chart-row">
            <div class="chart-box">
                <canvas id="durationChart"></canvas>
            </div>

            <div class="chart-box">
                <canvas id="typeChart"></canvas>
            </div>
        </div>

        <!-- Row 2: Weight Progress + Summary -->
        <div class="progress-chart-row">
            <div class="chart-box">
                <canvas id="weightProgressChart"></canvas>
            </div>

            <div class="chart-box" style="padding:25px;">
                <h3>Weight Summary</h3>
                <p><strong>Start Weight:</strong> ${startWeight} lbs</p>
                <p><strong>Current Weight:</strong> ${weight} lbs</p>
                <p><strong>Goal Weight:</strong> ${goal} lbs</p>
                <p><strong>Difference:</strong> ${diffMsg}</p>
            </div>
        </div>

        <!-- Row 3: Weight Log -->
        <h3 style="margin-top:30px;">Weight Log</h3>
        <table class="workout-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Weight</th>
                    <th>Difference From Goal</th>
                </tr>
            </thead>
            <tbody>
                ${
                    history.map(w => {
                        const d = w.weight - goal;
                        return `
                            <tr>
                                <td>${w.date}</td>
                                <td>${w.weight}</td>
                                <td>${
                                    d > 0 ? d + " above goal" :
                                    d < 0 ? Math.abs(d) + " below goal" :
                                    "at goal"
                                }</td>
                            </tr>
                        `;
                    }).join("")
                }
            </tbody>
        </table>
    `;

    // Delay chart creation slightly to ensure canvases are rendered in DOM
    setTimeout(() => {
        generateCharts();             // Workout Duration Chart
        generateWorkoutTypePieChart(); // Workout Types Chart
        generateWeightLineChart();     // Weight Progress Chart
    }, 50);
}


function generateCharts() {
    const workouts = JSON.parse(localStorage.getItem(currentUser + "_workouts") || "[]");

    // Count minutes per workout day of the week
    const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const workoutTotals = Array(7).fill(0);

    workouts.forEach(w => {
        if (!w.duration) return;
        const day = new Date(w.date).getDay();
        workoutTotals[day] += Number(w.duration);
    });

    const ctx = document.getElementById("durationChart").getContext("2d");


    new Chart(ctx, {
        type: "bar",
        data: {
            labels: daysOfWeek,
            datasets: [{
                label: "Minutes Worked Out",
                data: workoutTotals,
                backgroundColor: "#4a79ff",
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Workout Duration by Day of Week",
                    font: { size: 18 }
                }
            },
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


function generateWorkoutTypePieChart() {
    const workouts = JSON.parse(localStorage.getItem(currentUser + "_workouts") || "[]");

    const typeCounts = {};

    workouts.forEach(w => {
        const type = (w.type || "").toLowerCase();
        if (!typeCounts[type]) typeCounts[type] = 0;
        typeCounts[type]++;
    });

    const types = Object.keys(typeCounts);
    const counts = Object.values(typeCounts);

    const ctx = document.getElementById("typeChart").getContext("2d");


    new Chart(ctx, {
        type: "pie",
        data: {
            labels: types.map(t => t.charAt(0).toUpperCase() + t.slice(1)),
            datasets: [{
                data: counts,
                backgroundColor: [
                    "#4a79ff", "#6ac36a", "#ffb347",
                    "#ff6b6b", "#8f6aff", "#ffd700", "#4db6ac"
                ]
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Workout Type Distribution",
                    font: { size: 18 }
                }
            },
            responsive: true
        }
    });
}


function generateWeightLineChart() {
    let history = JSON.parse(localStorage.getItem(currentUser + "_weightHistory") || "[]");
    history.sort((a, b) => new Date(a.date) - new Date(b.date));

    const dates = history.map(h => h.date);
    const weights = history.map(h => h.weight);

    const ctx = document.getElementById("weightProgressChart").getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: "Weight (lbs)",
                data: weights,
                fill: false,
                borderColor: "#4a79ff",
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: "#4a79ff",
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Weight Progress Over Time",
                    font: { size: 18 }
                }
            },
            responsive: true,
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}


/* ---------------------------
   PROFILE PAGE
--------------------------- */

function loadProfilePage() {
    const name = localStorage.getItem(currentUser + "_userName") || "";
    const height = Number(localStorage.getItem(currentUser + "_userHeightInches") || 0);
    const weight = localStorage.getItem(currentUser + "_userWeightLbs") || "";
    const age = localStorage.getItem(currentUser + "_userAge") || "";
    const goalWeight = localStorage.getItem(currentUser + "_userWeightGoal") || "";


    const feet = height ? Math.floor(height / 12) : "";
    const inches = height ? height % 12 : "";

    content.innerHTML = `
        <h2>Profile</h2>

        <div class="profile-box ${profileEditing ? "profile-edit" : ""}">
            ${
                profileEditing
                ? `
                    <!-- EDITING MODE (input fields) -->
                    <label>Name:</label>
                    <input type="text" id="profName" value="${name}">

                    <label>Height:</label>
                    <div class="height-row">
                        <input type="number" id="profHeightFt" value="${feet}">
                        <input type="number" id="profHeightIn" value="${inches}">
                    </div>

                    <label>Current Weight (lbs):</label>
                    <input type="number" id="profWeight" value="${weight}">

                    <label>Goal Weight (lbs):</label>
                    <input type="number" id="profGoalWeight" value="${goalWeight}">

                    <label>Age:</label>
                    <input type="number" id="profAge" value="${age}">
                `
                : `
                    <!-- DISPLAY MODE (no inputs) -->
                    <div class="profile-display">
                        <div><strong>Name:</strong> ${name}</div>
                        <div><strong>Height:</strong> ${feet} ft ${inches} in</div>
                        <div><strong>Current Weight:</strong> ${weight} lbs</div>
                        <div><strong>Goal Weight:</strong> ${goalWeight} lbs</div>
                        <div><strong>Age:</strong> ${age}</div>
                    </div>
                `
            }

            <button id="profileActionBtn">
                ${profileEditing ? "Save Changes" : "Edit Profile"}
            </button>
        </div>
    `;

    // BUTTON LOGIC
    const btn = document.getElementById("profileActionBtn");
    if (profileEditing) {
        btn.onclick = () => {
            saveProfileChanges();
            profileEditing = false;
            loadProfilePage();
        };
    } else {
        btn.onclick = () => {
            profileEditing = true;
            loadProfilePage();
        };
    }
}


function saveProfileChanges() {
    const name = document.getElementById("profName").value;
    const ft = Number(document.getElementById("profHeightFt").value);
    const inch = Number(document.getElementById("profHeightIn").value);
    const weight = Number(document.getElementById("profWeight").value);
    const goalWeight = Number(document.getElementById("profGoalWeight").value);
    const age = Number(document.getElementById("profAge").value);

    localStorage.setItem(currentUser + "_userName", name);
    localStorage.setItem(currentUser + "_userHeightInches", ft*12 + inch);
    localStorage.setItem(currentUser + "_userWeightLbs", weight);
    localStorage.setItem(currentUser + "_userWeightGoal", goalWeight);
    localStorage.setItem(currentUser + "_userAge", age);

    let history = JSON.parse(localStorage.getItem(currentUser + "_weightHistory") || "[]");

    if (history.length === 0 || history[history.length - 1].weight !== weight) {
        history.push({
            date: new Date().toISOString().split("T")[0],
            weight: weight
        });
    }

    localStorage.setItem(currentUser + "_weightHistory", JSON.stringify(history));

    showWelcome();
    alert("Profile updated!");
}

/* ---------------------------
   WORKOUT PLAN (Preset)
--------------------------- */

function loadWorkoutPlan() {
    const goal = localStorage.getItem(currentUser + "_userGoal");

    let title = "Your Workout Plan";
    let body = "";

    if (goal === "lose") {
        title = "Weight Loss Plan";
        body = `
            <ul>
                <li><strong>3 days/week cardio</strong> (running, walking, or cycling) for 30–45 minutes.</li>
                <li><strong>3-4 days/week strength training</strong> (full body: squats, lunges, push-ups, rows).</li>
                <li><strong>1–2 core sessions</strong> per week (planks, dead bugs, bird-dogs, etc.).</li>
                <li>Aim for <strong>7,000–10,000 steps</strong> per day.</li>
            </ul>
        `;
    } else if (goal === "maintain") {
        title = "Maintenance Plan";
        body = `
            <ul>
                <li><strong>2–3 cardio sessions</strong> per week (20–40 minutes each).</li>
                <li><strong>2 strength sessions</strong> per week focusing on major muscle groups.</li>
                <li>Include <strong>mobility or yoga</strong> 1× per week.</li>
            </ul>
        `;
    } else if (goal === "gain") {
        title = "Healthy Weight Gain Plan";
        body = `
            <ul>
                <li><strong>3 strength workouts</strong> per week (full body or upper/lower split).</li>
                <li>Focus on compound lifts: squats, deadlifts, presses, rows.</li>
                <li><strong>Light cardio</strong> 1–2× per week for heart health.</li>
            </ul>
        `;
    } else if (goal === "muscle") {
        title = "Muscle Gain Plan";
        body = `
            <ul>
                <li><strong>4 strength sessions/week</strong> (e.g., Push, Pull, Legs, Full Body).</li>
                <li>Use <strong>progressive overload</strong>: add weight or reps weekly.</li>
                <li>Include <strong>2–3 sets of 8–12 reps</strong> for each major muscle group.</li>
                <li>Optional <strong>light cardio</strong> 1–2× per week.</li>
            </ul>
        `;
    } else {
        body = "<p>Select a goal in your profile to see a tailored plan.</p>";
    }

    content.innerHTML = `
        <h2>Workout Plan</h2>
        <div class="plan-box">
            <h3>${title}</h3>
            ${body}
        </div>
    `;
}

/* ---------------------------
   ACCOUNT SETTINGS
--------------------------- */

accountSettingsNav.onclick = () => {
    navItems.forEach(i => i.classList.remove("active"));
    accountSettingsNav.classList.add("active");
    loadAccountSettings();
};

function loadAccountSettings() {
    const email = localStorage.getItem(currentUser + "_userEmail") || "";
    const password = localStorage.getItem(currentUser + "_userPassword") || "";


    content.innerHTML = `
        <h2>Account Settings</h2>

        <div class="settings-box">
            <label>Email:</label>
            <input type="email" id="accEmail" value="${email}">

            <label>Password:</label>
            <input type="password" id="accPassword" value="${password}">

            <button id="saveAccountBtn">Save Changes</button>
        </div>
    `;

    document.getElementById("saveAccountBtn").onclick = () => {
        const newEmail = document.getElementById("accEmail").value;
        const newPass = document.getElementById("accPassword").value;

        localStorage.setItem(currentUser + "_userEmail", newEmail);
        localStorage.setItem(currentUser + "_userPassword", newPass);


        alert("Account settings updated!");
    };
}

/* ---------------------------
   UPDATE WEIGHT MODAL (optional)
--------------------------- */

saveNewWeightBtn.onclick = () => {
    const newWeight = Number(document.getElementById("newWeightInput").value);
    if (!newWeight) {
        alert("Enter a valid weight.");
        return;
    }

    localStorage.setItem(currentUser + "_userWeightLbs", newWeight);

    const history = JSON.parse(localStorage.getItem(currentUser + "_weightHistory") || "[]");
    history.push({
        date: new Date().toISOString().split("T")[0],
        weight: newWeight
    });

    localStorage.setItem(currentUser + "_weightHistory", JSON.stringify(history));

    weightModal.style.display = "none";
    if (document.querySelector(".profile-box")) {
    loadProfilePage();
    }

    loadPage("Progress");
};
