import { API_BASE_URL } from "./config.js";

// Fetch and display all user data
async function loadAdminData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`);

    if (!response.ok) {
      throw new Error("Failed to fetch admin data");
    }

    const data = await response.json();

    // Hide loading, show statistics
    document.getElementById("loading").classList.add("d-none");
    document.getElementById("statistics").classList.remove("d-none");

    // Update statistics
    updateStatistics(data);

    // Update distributions
    updateDistributions(data.statistics);

    // Populate table
    populateTable(data.users);
  } catch (error) {
    console.error("Error loading admin data:", error);
    document.getElementById("loading").classList.add("d-none");
    document.getElementById("error").textContent =
      "Failed to load admin data. Please try again.";
    document.getElementById("error").classList.remove("d-none");
  }
}

// Update statistics cards
function updateStatistics(data) {
  document.getElementById("totalUsers").textContent = data.totalUsers;

  // Count unique majors
  const uniqueMajors = Object.keys(data.statistics.byMajor).length;
  document.getElementById("totalMajors").textContent = uniqueMajors;

  // Count today's matches
  const today = new Date().toDateString();
  const todayMatches = data.users.filter(
    (user) => new Date(user.created_at).toDateString() === today
  ).length;
  document.getElementById("todayMatches").textContent = todayMatches;
}

// Update distribution charts
function updateDistributions(statistics) {
  // User majors distribution
  const majorDistDiv = document.getElementById("majorDistribution");
  majorDistDiv.innerHTML = "";

  const sortedMajors = Object.entries(statistics.byMajor).sort(
    (a, b) => b[1] - a[1]
  );

  sortedMajors.forEach(([major, count]) => {
    const percentage = ((count / Object.values(statistics.byMajor).reduce((a, b) => a + b, 0)) * 100).toFixed(1);
    majorDistDiv.innerHTML += `
      <div class="mb-2">
        <div class="d-flex justify-content-between mb-1">
          <span>${major}</span>
          <span class="text-muted">${count} (${percentage}%)</span>
        </div>
        <div class="progress">
          <div class="progress-bar" role="progressbar" style="width: ${percentage}%" 
               aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    `;
  });

  // Matched majors distribution
  const matchedDistDiv = document.getElementById("matchedDistribution");
  matchedDistDiv.innerHTML = "";

  const sortedMatched = Object.entries(statistics.byMatchedMajor).sort(
    (a, b) => b[1] - a[1]
  );

  sortedMatched.forEach(([major, count]) => {
    const percentage = ((count / Object.values(statistics.byMatchedMajor).reduce((a, b) => a + b, 0)) * 100).toFixed(1);
    matchedDistDiv.innerHTML += `
      <div class="mb-2">
        <div class="d-flex justify-content-between mb-1">
          <span>${major}</span>
          <span class="text-muted">${count} (${percentage}%)</span>
        </div>
        <div class="progress">
          <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%" 
               aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    `;
  });
}

// Populate user table
function populateTable(users) {
  const tbody = document.getElementById("userTable");
  tbody.innerHTML = "";

  users.forEach((user, index) => {
    const date = new Date(user.created_at);
    const formattedDate = date.toLocaleString();

    // Construct sticker path
    const stickerPath = `/stickers/${user.matched_major}/${user.sticker}.png`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(user.name)}</td>
      <td><span class="badge badge-major bg-primary">${user.major}</span></td>
      <td><span class="badge badge-major bg-success">${user.matched_major}</span></td>
      <td>${user.sticker}</td>
      <td class="text-muted small">${formattedDate}</td>
      <td>
        <img src="${stickerPath}" alt="${user.sticker}" class="sticker-preview" 
             onerror="this.src='/assets/logo.png'">
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Download data as CSV
window.downloadCSV = async function () {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`);
    const data = await response.json();

    // Create CSV content
    let csv = "No,Name,User Major,Matched Major,Sticker,Date\n";

    data.users.forEach((user, index) => {
      const date = new Date(user.created_at).toLocaleString();
      csv += `${index + 1},"${user.name}","${user.major}","${user.matched_major}","${user.sticker}","${date}"\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cupid-pudz-matches-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading CSV:", error);
    alert("Failed to download CSV. Please try again.");
  }
};

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Load data when page loads
loadAdminData();

// Auto-refresh every 30 seconds
setInterval(loadAdminData, 30000);
