// Receipt page logic
document.addEventListener("DOMContentLoaded", () => {
  // Get match data from sessionStorage
  const matchData = sessionStorage.getItem("confirmedMatch");

  if (!matchData) {
    // No match data, redirect to home
    window.location.href = "/";
    return;
  }

  try {
    const match = JSON.parse(matchData);

    // Populate receipt data
    document.getElementById("receiptName").textContent = match.name;
    document.getElementById("receiptUserMajor").textContent = match.major;
    document.getElementById("receiptMatchedMajor").textContent =
      match.matched_major;
    document.getElementById("receiptSticker").src = match.sticker_url;
    document.getElementById("receiptSticker").alt =
      `${match.matched_major} Match Sticker`;
  } catch (error) {
    console.error("Error loading receipt:", error);
    window.location.href = "/";
  }
});

