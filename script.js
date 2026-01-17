// 🔑 REPLACE WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
const API_URL = "https://script.google.com/macros/s/AKfycby-wtz6qpYpcNYbeYPrCdNVtlU5XscgFVcyqaRElTMHrb4OUkZpPgRwl-OrnS2vzwsp/exec";

// DOM elements
const setupDiv = document.getElementById("setup");
const trackerDiv = document.getElementById("tracker");
const usernameInput = document.getElementById("username");
const saveBtn = document.getElementById("save-name");
const practiceBtn = document.getElementById("practice-btn");
const logoutBtn = document.getElementById("logout");
const streakDisplay = document.getElementById("streak-number");
const messageEl = document.getElementById("message");

// Load saved user
let currentUser = localStorage.getItem("studentName");
if (currentUser) {
  showTracker(currentUser);
} else {
  setupDiv.style.display = "block";
}

// Save name
saveBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    localStorage.setItem("studentName", name);
    showTracker(name);
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("studentName");
  trackerDiv.style.display = "none";
  setupDiv.style.display = "block";
  usernameInput.value = "";
});

// Show tracker UI
function showTracker(name) {
  setupDiv.style.display = "none";
  trackerDiv.style.display = "block";
  loadStreak(name);
}

// Get today in YYYY-MM-DD
function getToday() {
  return new Date().toISOString().split("T")[0];
}
// Get yesterday
function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

// Fetch current streak
async function loadStreak(userId) {
  try {
    const res = await fetch(`${API_URL}?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    const streak = data?.streak || 0;
    streakDisplay.textContent = streak;
  } catch (e) {
    messageEl.textContent = "⚠️ Couldn’t load streak.";
  }
}

// Handle practice button
practiceBtn.addEventListener("click", async () => {
  const userId = currentUser || localStorage.getItem("studentName");
  if (!userId) return;

  messageEl.textContent = "Saving... 💫";
  practiceBtn.disabled = true;

  try {
    // First, get latest streak & date
    const res = await fetch(`${API_URL}?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();

    const lastDate = data?.date || "";
    const currentStreak = parseInt(data?.streak) || 0;
    const today = getToday();

    let newStreak = 1;
    if (lastDate === today) {
      messageEl.textContent = "✨ You already practiced today!";
    } else if (lastDate === getYesterday()) {
      newStreak = currentStreak + 1;
      messageEl.textContent = getRandomEncouragement(newStreak);
    } else {
      // Streak broken — reset to 1
      newStreak = 1;
      messageEl.textContent = "💖 Welcome back! Your streak starts again.";
    }

    // Save to Google Sheet
    await fetch(API_URL, {      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, date: today, streak: newStreak })
    });

    streakDisplay.textContent = newStreak;

  } catch (e) {
    console.error(e);
    messageEl.textContent = "❌ Oops! Try again.";
  } finally {
    practiceBtn.disabled = false;
  }
});

// Fun messages!
function getRandomEncouragement(streak) {
  const messages = [
    `Amazing! ${streak} days! 🌈`,
    `You’re unstoppable! 💪 (${streak} days)`,
    `Keep glowing! ✨ Day ${streak}!`,
    `So proud of you! 💕 Streak: ${streak}`,
    `On fire! 🔥 ${streak} in a row!`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}