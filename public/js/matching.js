// Matching page logic - shows slot animation and redirects to result
import API_BASE_URL from "./config.js";

// Map sticker IDs to actual file paths
function getStickerUrl(major, stickerId) {
  return `/stickers/${major}/${stickerId}.webp`;
}

document.addEventListener("DOMContentLoaded", () => {
  const errorDiv = document.getElementById("error");
  const livesCountElement = document.getElementById("livesCount");

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

  // Get user data from sessionStorage
  const userData = sessionStorage.getItem("userData");
  let lives = parseInt(sessionStorage.getItem("matchLives") || "3");

  if (!userData) {
    // No user data, redirect to home
    window.location.href = "/";
    return;
  }

  const data = JSON.parse(userData);

  // Update lives display
  livesCountElement.textContent = lives;

  // Start matching process automatically
  startMatching();

  async function startMatching() {
    // Start progress bar animation
    animateProgressBar();

    try {
      // Get previous matches and stickers from sessionStorage
      const previousMatches = JSON.parse(
        sessionStorage.getItem("previousMatches") || "[]",
      );
      const previousStickers = JSON.parse(
        sessionStorage.getItem("previousStickers") || "[]",
      );

      const response = await fetch(`${API_BASE_URL}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          previousMatches,
          previousStickers,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to find match");
      }

      const result = await response.json();

      // Convert sticker IDs to URLs for frontend use
      result.sticker_url = getStickerUrl(
        result.matched_major,
        result.sticker_id,
      );
      result.all_stickers = result.all_sticker_ids.map((id) =>
        getStickerUrl(result.matched_major, id),
      );

      // Track this match and sticker ID to prevent repeats
      previousMatches.push(result.matched_major);
      previousStickers.push(result.sticker_id);
      sessionStorage.setItem(
        "previousMatches",
        JSON.stringify(previousMatches),
      );
      sessionStorage.setItem(
        "previousStickers",
        JSON.stringify(previousStickers),
      );

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
      errorDiv.textContent =
        error.message || "An error occurred. Please try again.";
      errorDiv.classList.remove("d-none");
    }
  }

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
