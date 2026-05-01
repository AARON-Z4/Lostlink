const { supabaseAdmin } = require('../config/supabaseClient');
const { notifyMatchFound } = require('./notification.service');

/**
 * Simple text similarity using Jaccard index on word sets.
 * Returns a score between 0 and 1.
 */
const textSimilarity = (text1 = '', text2 = '') => {
  const tokenize = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

  const set1 = new Set(tokenize(text1));
  const set2 = new Set(tokenize(text2));

  if (set1.size === 0 && set2.size === 0) return 0;

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
};

/**
 * Compute match score between a lost item and a found item.
 * Score components:
 *   - Category match: 0.4
 *   - Location match: 0.3
 *   - Description similarity: 0.3
 */
const computeMatchScore = (lostItem, foundItem) => {
  let score = 0;

  // Category match (exact)
  if (
    lostItem.category &&
    foundItem.category &&
    lostItem.category.toLowerCase() === foundItem.category.toLowerCase()
  ) {
    score += 0.4;
  }

  // Location match (partial — both contain same city/keyword)
  if (lostItem.location && foundItem.location) {
    const lostTokens = lostItem.location.toLowerCase().split(/[\s,]+/);
    const foundTokens = foundItem.location.toLowerCase().split(/[\s,]+/);
    const locationOverlap = lostTokens.some((t) => foundTokens.includes(t) && t.length > 2);
    if (locationOverlap) score += 0.3;
  }

  // Description text similarity
  const descScore = textSimilarity(lostItem.description, foundItem.description);
  score += descScore * 0.3;

  return Math.round(score * 100) / 100;
};

/**
 * Run matching engine for a newly posted item.
 * If the item is "lost", match against "found" items — and vice versa.
 * Stores matches with score >= threshold in the matches table.
 */
const runMatchingForItem = async (newItem) => {
  const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
  const SCORE_THRESHOLD = 0.4;

  try {
    // Fetch candidate items of opposite type in same category
    const { data: candidates, error } = await supabaseAdmin
      .from('items')
      .select('*, users(id, name, email)')
      .eq('type', oppositeType)
      .eq('category', newItem.category)
      .eq('status', 'active');

    if (error || !candidates?.length) return [];

    const matches = [];

    for (const candidate of candidates) {
      const score = computeMatchScore(
        newItem.type === 'lost' ? newItem : candidate,
        newItem.type === 'found' ? newItem : candidate
      );

      if (score >= SCORE_THRESHOLD) {
        const lostItemId = newItem.type === 'lost' ? newItem.id : candidate.id;
        const foundItemId = newItem.type === 'found' ? newItem.id : candidate.id;

        // Save match
        await supabaseAdmin.from('matches').insert({
          lost_item_id: lostItemId,
          found_item_id: foundItemId,
          score,
        });

        matches.push({ candidate, score });

        // Notify the owner of the original item
        const { data: owner } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', newItem.user_id)
          .single();

        if (owner) {
          const lostItem = newItem.type === 'lost' ? newItem : candidate;
          const foundItem = newItem.type === 'found' ? newItem : candidate;
          await notifyMatchFound(owner, lostItem, foundItem);
        }
      }
    }

    return matches;
  } catch (err) {
    console.error('Matching engine error:', err.message);
    return [];
  }
};

/**
 * Get all matches for a specific item
 */
const getMatchesForItem = async (itemId) => {
  const { data: item } = await supabaseAdmin
    .from('items')
    .select('type')
    .eq('id', itemId)
    .single();

  if (!item) return [];

  const column = item.type === 'lost' ? 'lost_item_id' : 'found_item_id';
  const joinColumn = item.type === 'lost' ? 'found_item_id' : 'lost_item_id';

  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select(`*, matched_item:${joinColumn}(*)`)
    .eq(column, itemId)
    .order('score', { ascending: false });

  return matches || [];
};

module.exports = { runMatchingForItem, getMatchesForItem, computeMatchScore, textSimilarity };
