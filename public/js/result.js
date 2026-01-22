// Result page logic
import API_BASE_URL from "./config.js";

// Map sticker IDs to actual file paths
function getStickerUrl(major, stickerId) {
  return `/stickers/${major}/${stickerId}.webp`;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Result page loaded");

  // Get match result from sessionStorage
  const resultData = sessionStorage.getItem("matchResult");
  let lives = parseInt(sessionStorage.getItem("matchLives") || "3");

  console.log("Result data:", resultData);
  console.log("Lives:", lives);

  if (!resultData) {
    console.log("No result data found, redirecting to home");
    // No result found, redirect back to home
    window.location.href = "/";
    return;
  }

  try {
    const result = JSON.parse(resultData);
    console.log("Parsed result:", result);

    // Populate result data
    const userNameEl = document.getElementById("userName");
    const matchedMajorEl = document.getElementById("matchedMajor");
    const personalityEl = document.getElementById("personalityDescription");
    const livesCountEl = document.getElementById("livesCount");

    console.log("Elements found:", {
      userName: !!userNameEl,
      matchedMajor: !!matchedMajorEl,
      personality: !!personalityEl,
      livesCount: !!livesCountEl,
    });

    if (userNameEl) userNameEl.textContent = `မင်္ဂလာပါ ${result.name}! 💕`;
    if (matchedMajorEl) matchedMajorEl.textContent = result.matched_major;
    if (personalityEl)
      personalityEl.textContent = result.personality_description;
    if (livesCountEl) livesCountEl.textContent = lives;

    // Check if this is the final match (no lives left)
    if (lives <= 0) {
      document.getElementById("likeButton").textContent =
        "💝 ကံကြမ္မာကိုလက်ခံလိုက်ပြီ";
      document.getElementById("likeButton").classList.remove("btn-success");
      document.getElementById("likeButton").classList.add("btn-danger");
      document.getElementById("rematchButton").style.display = "none";
      document.getElementById("livesDisplay").innerHTML =
        '<span class="badge bg-danger text-white fs-5">✨ ကံကြမ္မာကိုလက်ခံလိုက်ပါတော့! 💝</span>';

      // Change the heading
      document.querySelector(".display-5").innerHTML =
        "💝 ကံကြမ္မာကိုလက်ခံလိုက်ပြီ";
    }

    // Convert sticker IDs to URLs
    const stickerUrl = getStickerUrl(result.matched_major, result.sticker_id);
    const allStickerUrls = (result.all_sticker_ids || []).map((id) =>
      getStickerUrl(result.matched_major, id),
    );

    // Start sticker slot animation
    animateStickerSlot(stickerUrl, result.matched_major, allStickerUrls);

    // Don't clear sessionStorage - we need it for rematching
  } catch (error) {
    console.error("Error loading result:", error);
    window.location.href = "/";
  }

  function animateStickerSlot(finalSticker, matchedMajor, allStickers) {
    const stickerSlot = document.getElementById("stickerSlot");
    const stickerSlotContainer = document.getElementById(
      "stickerSlotContainer",
    );
    const finalStickerContainer = document.getElementById(
      "finalStickerContainer",
    );
    const stickerImage = document.getElementById("stickerImage");

    // If we have all stickers, use them for animation. Otherwise fallback to single sticker
    let stickersToShow =
      allStickers && allStickers.length > 0 ? allStickers : [finalSticker];

    // Create slot items with all available stickers cycling through
    const slotItems = [];

    // Show each sticker multiple times for smooth animation (3 cycles + final)
    for (let cycle = 0; cycle < 3; cycle++) {
      stickersToShow.forEach((stickerUrl) => {
        slotItems.push(`
          <div class="slot-item-horizontal">
            <img src="${stickerUrl}" alt="Sticker" style="max-width: 250px; max-height: 250px; object-fit: contain;">
          </div>
        `);
      });
    }

    // Add the final sticker at the end
    slotItems.push(`
      <div class="slot-item-horizontal">
        <img src="${finalSticker}" alt="Final Sticker" style="max-width: 250px; max-height: 250px; object-fit: contain;">
      </div>
    `);

    stickerSlot.innerHTML = slotItems.join("");

    // After animation completes, show final sticker
    setTimeout(() => {
      stickerSlotContainer.classList.add("d-none");
      finalStickerContainer.classList.remove("d-none");
      stickerImage.src = finalSticker;
      stickerImage.alt = `${matchedMajor} Match Sticker`;
    }, 2600);
  }

  // Expose functions to global scope so HTML onclick can access them
  window.confirmMatch = confirmMatch;
  window.findAnotherMatch = findAnotherMatch;
});

// Confirm match and save to database
async function confirmMatch() {
  const resultData = sessionStorage.getItem("matchResult");
  const userData = sessionStorage.getItem("userData");

  if (!resultData || !userData) {
    alert("Error: Match data not found");
    return;
  }

  const result = JSON.parse(resultData);
  const user = JSON.parse(userData);

  try {
    const response = await fetch(`${API_BASE_URL}/confirm-match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: user.name,
        major: user.major,
        matched_major: result.matched_major,
        sticker_id: result.sticker_id,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save match");
    }

    const savedMatch = await response.json();

    // Convert sticker ID to URL for receipt page
    const finalStickerUrl = getStickerUrl(
      result.matched_major,
      result.sticker_id,
    );

    // Store confirmed match for receipt page
    sessionStorage.setItem(
      "confirmedMatch",
      JSON.stringify({
        name: user.name,
        major: user.major,
        matched_major: result.matched_major,
        sticker_url: finalStickerUrl,
      }),
    );

    // Clear previous matches tracking since user confirmed
    sessionStorage.removeItem("previousMatches");
    sessionStorage.removeItem("previousStickers");

    // Redirect to receipt page
    window.location.href = "/receipt.html";
  } catch (error) {
    console.error("Error saving match:", error);
    alert("Error saving match. Please try again.");
  }
}

// Find another match
function findAnotherMatch() {
  let lives = parseInt(sessionStorage.getItem("matchLives") || "3");

  if (lives > 1) {
    // Decrease lives
    lives--;
    sessionStorage.setItem("matchLives", lives.toString());

    // Redirect to matching page
    window.location.href = "/matching.html";
  } else {
    // Last life - set to 0 and force destiny
    sessionStorage.setItem("matchLives", "0");

    // Reload result page to show destiny message
    window.location.href = "/matching.html";
  }
}
