/**
 * Transaction Service Test Setup
 *
 * Shared mock data for transaction service tests.
 * NOTE: Mocks must be defined in each test file due to hoisting.
 */

export const mockClinicId = 'clinic-123';
export const mockTransactionId = 'txn-456';
export const mockUserId = 'user-789';

// Helper to create Timestamp instances (requires Timestamp from firebase mock)
export const createMockTimestamp = (Timestamp: {
  fromDate: (date: Date) => unknown;
}) => {
  return (isoString: string) => {
    return Timestamp.fromDate(new Date(isoString));
  };
};
