/**
 * Unit tests for claim flow logic.
 */

describe('Claim Flow Logic', () => {
  describe('Status transitions', () => {
    const validTransitions = {
      pending: ['accepted', 'rejected'],
      accepted: [],
      rejected: [],
    };

    const canTransition = (from, to) => validTransitions[from]?.includes(to) ?? false;

    test('pending → accepted is valid', () => {
      expect(canTransition('pending', 'accepted')).toBe(true);
    });

    test('pending → rejected is valid', () => {
      expect(canTransition('pending', 'rejected')).toBe(true);
    });

    test('accepted → rejected is invalid', () => {
      expect(canTransition('accepted', 'rejected')).toBe(false);
    });

    test('rejected → accepted is invalid', () => {
      expect(canTransition('rejected', 'accepted')).toBe(false);
    });
  });

  describe('Item status after claim decision', () => {
    const getItemStatusAfterClaim = (claimStatus, otherPendingClaims = 0) => {
      if (claimStatus === 'accepted') return 'claimed';
      if (claimStatus === 'rejected' && otherPendingClaims === 0) return 'active';
      if (claimStatus === 'rejected' && otherPendingClaims > 0) return 'pending';
      return 'active';
    };

    test('item becomes "claimed" when claim is accepted', () => {
      expect(getItemStatusAfterClaim('accepted')).toBe('claimed');
    });

    test('item reverts to "active" when rejected and no other claims', () => {
      expect(getItemStatusAfterClaim('rejected', 0)).toBe('active');
    });

    test('item stays "pending" when rejected but other claims exist', () => {
      expect(getItemStatusAfterClaim('rejected', 2)).toBe('pending');
    });
  });

  describe('Self-claim prevention', () => {
    const canClaim = (itemOwnerId, claimantId) => itemOwnerId !== claimantId;

    test('owner cannot claim their own item', () => {
      expect(canClaim('user-1', 'user-1')).toBe(false);
    });

    test('different user can claim item', () => {
      expect(canClaim('user-1', 'user-2')).toBe(true);
    });
  });
});
