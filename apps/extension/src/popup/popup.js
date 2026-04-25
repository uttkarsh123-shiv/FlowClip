const CONVEX_SITE_URL = "https://fantastic-condor-84.eu-west-1.convex.site";

let allClips = [];

async function loadClips() {
  try {
    const res = await fetch(`${CONVEX_SITE_URL}/clips`);
    allClips = await res.json();
    renderClips(allClips);
  } catch (e) {
    console.error("Failed to load clips", e);
  }
}

function renderClips(clips) {
  const container = document.getElementById("clips");
  const count = document.getElementById("count");
  count.textContent = `${clips.length} clip${clips.length !== 1 ? "s" : ""}`;

  if (clips.length === 0) {
    container.innerHTML = '<div id="empty">No clips yet. Start copying.</div>';
    return;
  }

  container.innerHTML = clips
    .slice()
    .reverse()
    .map((clip) => {
      const time = new Date(clip.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `
        <div class="clip" title="${escape(clip.content)}" data-content="${escape(clip.content)}">
          ${clip.content}
          <div class="time">${time}</div>
        </div>`;
    })
    .join("");

  // Click to copy
  container.querySelectorAll(".clip").forEach((el) => {
    el.addEventListener("click", () => {
      navigator.clipboard.writeText(unescape(el.dataset.content));
    });
  });
}

document.getElementById("search").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  renderClips(allClips.filter((c) => c.content.toLowerCase().includes(q)));
});

loadClips();
