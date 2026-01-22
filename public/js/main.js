// Main form submission logic
import API_BASE_URL from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("matchForm");
  const loading = document.getElementById("loading");
  const errorDiv = document.getElementById("error");

  const MAJORS = [
    "Architecture",
    "Civil",
    "Mechanical",
    "EC",
    "EP",
    "CEIT",
    "MC",
    "Petroleum",
    "Chemical",
  ];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Hide error if visible
    errorDiv.classList.add("d-none");

    // Get form data
    const formData = new FormData(form);
    const data = {
      name: formData.get("name"),
      major: formData.get("major"),
    };

    // Store user data in sessionStorage
    sessionStorage.setItem("userData", JSON.stringify(data));
    // Initialize lives
    sessionStorage.setItem("matchLives", "3");

    // Show loading
    form.classList.add("d-none");
    loading.classList.remove("d-none");

    // Start progress bar animation
    animateProgressBar();

    try {
      const response = await fetch(`${API_BASE_URL}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to find match");
      }

      const result = await response.json();

      // Start slot machine animation with the matched major
      animateMajorSlot(result.matched_major, data.major);

      // Store result in sessionStorage for result page
      sessionStorage.setItem("matchResult", JSON.stringify(result));

      // Wait for animations to complete before redirecting
      setTimeout(() => {
        window.location.href = "/result.html";
      }, 3500);
    } catch (error) {
      console.error("Error:", error);
      loading.classList.add("d-none");
      form.classList.remove("d-none");
      errorDiv.textContent =
        error.message || "An error occurred. Please try again.";
      errorDiv.classList.remove("d-none");
    }
  });

  function animateProgressBar() {
    const progressBar = document.getElementById("progressBar");
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      progressBar.style.width = progress + "%";
      progressBar.textContent = progress + "%";

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 60);
  }

  function animateMajorSlot(matchedMajor, userMajor) {
    const majorSlot = document.getElementById("majorSlot");

    // Filter out user's own major from display
    const availableMajors = MAJORS.filter((major) => major !== userMajor);

    // Create spinning sequence with random majors, ending with the matched major
    const slotItems = [];

    // Add random majors for spinning effect (12 items)
    for (let i = 0; i < 12; i++) {
      const randomMajor =
        availableMajors[Math.floor(Math.random() * availableMajors.length)];
      slotItems.push(`<div class="slot-item">${randomMajor}</div>`);
    }

    // Add the final matched major (this will be visible after animation)
    slotItems.push(`<div class="slot-item">${matchedMajor}</div>`);

    majorSlot.innerHTML = slotItems.join("");

    // Calculate the final position to land on the matched major
    // Each slot-item is 80px tall, and we want to show the last item (matchedMajor)
    const finalPosition = (slotItems.length - 1) * 80;

    // Apply custom animation to land on the matched major
    majorSlot.style.animation = "none";
    setTimeout(() => {
      majorSlot.style.animation = `slotSpinCustom 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
      majorSlot.style.setProperty("--final-position", `-${finalPosition}px`);
    }, 10);
  }
});
