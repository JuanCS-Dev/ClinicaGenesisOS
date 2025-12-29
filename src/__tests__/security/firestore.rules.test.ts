/**
 * Firestore Security Rules Tests
 *
 * Tests RBAC implementation for multi-tenant clinic isolation.
 * Uses @firebase/rules-unit-testing for emulator-based testing.
 *
 * Run with: npm run test:rules (requires Firebase emulator)
 *
 * @module tests/security/firestore.rules
 */

import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest'
import type { Firestore } from 'firebase/firestore'
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'

// Test clinic IDs
const CLINIC_A = 'clinic-a'
const CLINIC_B = 'clinic-b'

// Test user configurations with custom claims
const users = {
  ownerA: { uid: 'owner-a', token: { clinicId: CLINIC_A, role: 'owner' } },
  adminA: { uid: 'admin-a', token: { clinicId: CLINIC_A, role: 'admin' } },
  professionalA: { uid: 'professional-a', token: { clinicId: CLINIC_A, role: 'professional' } },
  receptionistA: { uid: 'receptionist-a', token: { clinicId: CLINIC_A, role: 'receptionist' } },
  ownerB: { uid: 'owner-b', token: { clinicId: CLINIC_B, role: 'owner' } },
  noClaims: { uid: 'no-claims-user', token: {} },
}

let testEnv: RulesTestEnvironment

function getFirestore(user: (typeof users)['ownerA'] | null): Firestore {
  if (!user) return testEnv.unauthenticatedContext().firestore() as unknown as Firestore
  return testEnv.authenticatedContext(user.uid, user.token).firestore() as unknown as Firestore
}

describe('Firestore Security Rules - RBAC', () => {
  beforeAll(async () => {
    const rulesPath = resolve(__dirname, '../../../firestore.rules')
    const rules = readFileSync(rulesPath, 'utf8')
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: { rules, host: 'localhost', port: 8080 },
    })
  })

  afterAll(async () => {
    await testEnv.cleanup()
  })

  beforeEach(async () => {
    await testEnv.clearFirestore()
  })

  describe('/users/{userId}', () => {
    it('allows user to read own profile', async () => {
      const db = getFirestore(users.ownerA)
      await testEnv.withSecurityRulesDisabled(async ctx => {
        await setDoc(doc(ctx.firestore(), 'users', users.ownerA.uid), {
          email: 'owner@clinica.com',
          clinicId: CLINIC_A,
        })
      })
      await assertSucceeds(getDoc(doc(db, 'users', users.ownerA.uid)))
    })

    it('allows same-clinic user to read colleague profile', async () => {
      const db = getFirestore(users.professionalA)
      await testEnv.withSecurityRulesDisabled(async ctx => {
        await setDoc(doc(ctx.firestore(), 'users', users.ownerA.uid), {
          email: 'owner@clinica.com',
          clinicId: CLINIC_A,
        })
      })
      await assertSucceeds(getDoc(doc(db, 'users', users.ownerA.uid)))
    })

    it('denies reading profile from different clinic', async () => {
      const db = getFirestore(users.ownerB)
      await testEnv.withSecurityRulesDisabled(async ctx => {
        await setDoc(doc(ctx.firestore(), 'users', users.ownerA.uid), {
          email: 'owner@clinica.com',
          clinicId: CLINIC_A,
        })
      })
      await assertFails(getDoc(doc(db, 'users', users.ownerA.uid)))
    })

    it('allows user to create own profile', async () => {
      const db = getFirestore(users.ownerA)
      await assertSucceeds(
        setDoc(doc(db, 'users', users.ownerA.uid), {
          email: 'owner@clinica.com',
          clinicId: CLINIC_A,
        })
      )
    })

    it('denies creating profile for another user', async () => {
      const db = getFirestore(users.ownerA)
      await assertFails(setDoc(doc(db, 'users', 'another-user'), { email: 'fake@clinica.com' }))
    })
  })

  describe('/clinics/{clinicId}', () => {
    it('allows authenticated user to create clinic', async () => {
      const db = getFirestore(users.ownerA)
      await assertSucceeds(
        setDoc(doc(db, 'clinics', CLINIC_A), { name: 'Clinica A', ownerId: users.ownerA.uid })
      )
    })

    it('allows clinic member to read clinic', async () => {
      const db = getFirestore(users.receptionistA)
      await testEnv.withSecurityRulesDisabled(async ctx => {
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_A), { name: 'Clinica A' })
      })
      await assertSucceeds(getDoc(doc(db, 'clinics', CLINIC_A)))
    })

    it('denies reading clinic from different organization', async () => {
      const db = getFirestore(users.ownerB)
      await testEnv.withSecurityRulesDisabled(async ctx => {
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_A), { name: 'Clinica A' })
      })
      await assertFails(getDoc(doc(db, 'clinics', CLINIC_A)))
    })

    it('allows only owner to update clinic', async () => {
      await testEnv.withSecurityRulesDisabled(async ctx => {
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_A), { name: 'Clinica A' })
      })
      await assertSucceeds(
        updateDoc(doc(getFirestore(users.ownerA), 'clinics', CLINIC_A), { name: 'U' })
      )
      await assertFails(
        updateDoc(doc(getFirestore(users.adminA), 'clinics', CLINIC_A), { name: 'H' })
      )
    })
  })

  describe('/clinics/{clinicId}/patients/{patientId}', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async ctx => {
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_A), { name: 'Clinica A' })
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_A, 'patients', 'p1'), {
          name: 'Patient',
        })
      })
    })

    it('allows all staff roles to read patients', async () => {
      for (const user of [users.ownerA, users.adminA, users.professionalA, users.receptionistA]) {
        await assertSucceeds(getDoc(doc(getFirestore(user), 'clinics', CLINIC_A, 'patients', 'p1')))
      }
    })

    it('allows all staff roles to create patients', async () => {
      await assertSucceeds(
        setDoc(doc(getFirestore(users.receptionistA), 'clinics', CLINIC_A, 'patients', 'new'), {
          name: 'New',
        })
      )
    })

    it('denies patient access from different clinic', async () => {
      await assertFails(
        getDoc(doc(getFirestore(users.ownerB), 'clinics', CLINIC_A, 'patients', 'p1'))
      )
    })

    it('allows only owner to delete patients', async () => {
      await assertFails(
        deleteDoc(doc(getFirestore(users.adminA), 'clinics', CLINIC_A, 'patients', 'p1'))
      )
      await assertSucceeds(
        deleteDoc(doc(getFirestore(users.ownerA), 'clinics', CLINIC_A, 'patients', 'p1'))
      )
    })
  })

  describe('/clinics/{clinicId}/records/{recordId} - RESTRICTED', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async ctx => {
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_A), { name: 'Clinica A' })
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_A, 'records', 'r1'), { type: 'SOAP' })
      })
    })

    it('allows clinical staff to read records', async () => {
      for (const user of [users.ownerA, users.adminA, users.professionalA]) {
        await assertSucceeds(getDoc(doc(getFirestore(user), 'clinics', CLINIC_A, 'records', 'r1')))
      }
    })

    it('denies receptionists from reading medical records', async () => {
      await assertFails(
        getDoc(doc(getFirestore(users.receptionistA), 'clinics', CLINIC_A, 'records', 'r1'))
      )
    })

    it('allows only professionals to create records', async () => {
      await assertSucceeds(
        setDoc(doc(getFirestore(users.professionalA), 'clinics', CLINIC_A, 'records', 'new'), {
          type: 'SOAP',
        })
      )
      await assertFails(
        setDoc(doc(getFirestore(users.receptionistA), 'clinics', CLINIC_A, 'records', 'new2'), {
          type: 'SOAP',
        })
      )
    })

    it('never allows deleting medical records', async () => {
      await assertFails(
        deleteDoc(doc(getFirestore(users.ownerA), 'clinics', CLINIC_A, 'records', 'r1'))
      )
    })
  })

  describe('/clinics/{clinicId}/transactions - FINANCIAL', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async ctx => {
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_A), { name: 'Clinica A' })
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_A, 'transactions', 't1'), {
          amount: 150,
        })
      })
    })

    it('allows only admin+ to read transactions', async () => {
      for (const user of [users.ownerA, users.adminA]) {
        await assertSucceeds(
          getDoc(doc(getFirestore(user), 'clinics', CLINIC_A, 'transactions', 't1'))
        )
      }
    })

    it('denies professionals and receptionists from reading transactions', async () => {
      for (const user of [users.professionalA, users.receptionistA]) {
        await assertFails(
          getDoc(doc(getFirestore(user), 'clinics', CLINIC_A, 'transactions', 't1'))
        )
      }
    })
  })

  describe('Multi-tenant Isolation', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async ctx => {
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_A), { name: 'Clinica A' })
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_A, 'patients', 'pa'), {
          name: 'Patient A',
        })
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_B), { name: 'Clinica B' })
        await setDoc(doc(ctx.firestore(), 'clinics', CLINIC_B, 'patients', 'pb'), {
          name: 'Patient B',
        })
      })
    })

    it('clinic A owner cannot access clinic B data', async () => {
      const db = getFirestore(users.ownerA)
      await assertFails(getDoc(doc(db, 'clinics', CLINIC_B)))
      await assertFails(getDoc(doc(db, 'clinics', CLINIC_B, 'patients', 'pb')))
      await assertFails(
        setDoc(doc(db, 'clinics', CLINIC_B, 'patients', 'inject'), { name: 'Hacked' })
      )
    })

    it('user without claims cannot access any clinic', async () => {
      const db = getFirestore(users.noClaims)
      await assertFails(getDoc(doc(db, 'clinics', CLINIC_A)))
      await assertFails(getDoc(doc(db, 'clinics', CLINIC_A, 'patients', 'pa')))
    })

    it('unauthenticated user cannot access anything', async () => {
      const db = getFirestore(null)
      await assertFails(getDoc(doc(db, 'clinics', CLINIC_A)))
    })
  })
})
