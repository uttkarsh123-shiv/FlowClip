// Smart filtering utilities

/**
 * Filters out duplicates and short/useless clips
 * @param {string[]} clips
 * @returns {string[]}
 */
export function filterClips(clips) {
  const seen = new Set();
  return clips.filter((clip) => {
    const trimmed = clip.trim();
    if (trimmed.length < 3) return false;
    if (seen.has(trimmed)) return false;
    seen.add(trimmed);
    return true;
  });
}
