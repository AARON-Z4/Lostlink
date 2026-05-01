const { textSimilarity, computeMatchScore } = require('../services/matching.service');

describe('Matching Service', () => {
  describe('textSimilarity', () => {
    test('identical texts return 1.0', () => {
      expect(textSimilarity('black wallet leather', 'black wallet leather')).toBe(1);
    });

    test('completely different texts return 0', () => {
      expect(textSimilarity('cat food', 'airplane ticket')).toBe(0);
    });

    test('partial overlap returns value between 0 and 1', () => {
      const score = textSimilarity('blue backpack nike', 'blue bag nike sports');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });

    test('empty strings return 0', () => {
      expect(textSimilarity('', '')).toBe(0);
    });

    test('case insensitive', () => {
      expect(textSimilarity('Black Wallet', 'black wallet')).toBe(1);
    });
  });

  describe('computeMatchScore', () => {
    const lostItem = {
      category: 'electronics',
      location: 'Mumbai, Andheri',
      description: 'black samsung phone with cracked screen',
    };

    const perfectMatch = {
      category: 'electronics',
      location: 'Mumbai, Andheri',
      description: 'found black samsung phone cracked screen near station',
    };

    const noMatch = {
      category: 'clothing',
      location: 'Delhi, Connaught Place',
      description: 'red jacket with zipper',
    };

    test('perfect match returns score >= 0.7', () => {
      const score = computeMatchScore(lostItem, perfectMatch);
      expect(score).toBeGreaterThanOrEqual(0.7);
    });

    test('no match returns score < 0.4', () => {
      const score = computeMatchScore(lostItem, noMatch);
      expect(score).toBeLessThan(0.4);
    });

    test('category match contributes 0.4', () => {
      const sameCategory = { category: 'electronics', location: 'Kolkata', description: 'random stuff' };
      const score = computeMatchScore(lostItem, sameCategory);
      expect(score).toBeGreaterThanOrEqual(0.4);
    });

    test('score is between 0 and 1', () => {
      const score = computeMatchScore(lostItem, perfectMatch);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});
