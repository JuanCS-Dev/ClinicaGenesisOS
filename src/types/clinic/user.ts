/**
 * User Types
 *
 * User profile and authentication types.
 */

import type { UserRole } from './clinic';
import type { SpecialtyType } from '../records/base';

/**
 * User profile stored in Firestore: /users/{userId}
 * Links Firebase Auth user to a clinic.
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  clinicId: string | null; // null if not yet associated with a clinic
  role: UserRole;
  specialty: SpecialtyType;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
