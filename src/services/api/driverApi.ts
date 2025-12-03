/**
 * Driver API - CRUD operations for platform-level drivers
 * Drivers are global entities not tied to specific stores
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  Driver,
  DriverAddress,
  DriverSchedule,
  DEFAULT_DRIVER_SCHEDULE,
} from '../../types/driver';
import { MultiSlotSchedule, LegacySchedule } from '../../types/schedule';
import { migrateFromLegacySchedule } from '../../utils/scheduleUtils';
import { COLLECTIONS, safeDate } from './types';

// ============================================================================
// Types
// ============================================================================

export interface CreateDriverData {
  name: string;
  isActive?: boolean;
  startingAddress: DriverAddress;
  availabilityScheduleV2?: MultiSlotSchedule;
  availabilitySchedule?: DriverSchedule;
  notes?: string;
  phone?: string;
  email?: string;
}

export interface UpdateDriverData {
  name?: string;
  isActive?: boolean;
  startingAddress?: DriverAddress;
  availabilityScheduleV2?: MultiSlotSchedule;
  availabilitySchedule?: DriverSchedule;
  notes?: string;
  phone?: string;
  email?: string;
}

// ============================================================================
// Transformation Helpers
// ============================================================================

/**
 * Transform raw Firestore data to normalized Driver type
 */
export function transformDriverDocument(
  docId: string,
  data: Record<string, unknown>
): Driver {
  const legacySchedule = (data.availabilitySchedule as DriverSchedule) || DEFAULT_DRIVER_SCHEDULE;

  return {
    id: docId,
    name: (data.name as string) || '',
    isActive: (data.isActive as boolean) ?? true,
    startingAddress: (data.startingAddress as DriverAddress) || {
      street: '',
      city: '',
      province: '',
      postalCode: '',
    },
    // Multi-slot availability schedule with migration from legacy format
    availabilityScheduleV2: data.availabilityScheduleV2
      ? (data.availabilityScheduleV2 as MultiSlotSchedule)
      : migrateFromLegacySchedule(legacySchedule as unknown as LegacySchedule),
    // Legacy single-slot format
    availabilitySchedule: legacySchedule,
    createdAt: safeDate(data.createdAt),
    updatedAt: safeDate(data.updatedAt),
    notes: (data.notes as string) || '',
    phone: (data.phone as string) || '',
    email: (data.email as string) || '',
  };
}

/**
 * Prepare driver data for Firestore write
 */
function prepareDriverForFirestore(
  data: CreateDriverData | UpdateDriverData,
  isCreate: boolean = false
): Record<string, unknown> {
  const firestoreData: Record<string, unknown> = {};

  if (data.name !== undefined) firestoreData.name = data.name;
  if (data.isActive !== undefined) firestoreData.isActive = data.isActive;
  if (data.startingAddress !== undefined)
    firestoreData.startingAddress = data.startingAddress;
  // Multi-slot availability schedule (NEW)
  if (data.availabilityScheduleV2 !== undefined)
    firestoreData.availabilityScheduleV2 = data.availabilityScheduleV2;
  // Legacy single-slot format (keep for backward compatibility)
  if (data.availabilitySchedule !== undefined)
    firestoreData.availabilitySchedule = data.availabilitySchedule;
  if (data.notes !== undefined) firestoreData.notes = data.notes;
  if (data.phone !== undefined) firestoreData.phone = data.phone;
  if (data.email !== undefined) firestoreData.email = data.email;

  // Timestamps
  firestoreData.updatedAt = new Date();
  if (isCreate) {
    firestoreData.createdAt = new Date();
  }

  return firestoreData;
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get all drivers
 */
export async function getAllDrivers(): Promise<Driver[]> {
  const driversRef = collection(db, COLLECTIONS.DRIVERS);
  const snapshot = await getDocs(driversRef);
  return snapshot.docs.map((doc) =>
    transformDriverDocument(doc.id, doc.data())
  );
}

/**
 * Get only active drivers
 */
export async function getActiveDrivers(): Promise<Driver[]> {
  const driversRef = collection(db, COLLECTIONS.DRIVERS);
  const q = query(driversRef, where('isActive', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) =>
    transformDriverDocument(doc.id, doc.data())
  );
}

/**
 * Get a single driver by ID
 */
export async function getDriverById(driverId: string): Promise<Driver> {
  if (!driverId) {
    throw new Error('Driver ID is required');
  }

  const driverRef = doc(db, COLLECTIONS.DRIVERS, driverId);
  const snapshot = await getDoc(driverRef);

  if (!snapshot.exists()) {
    throw new Error(`Driver with ID ${driverId} not found`);
  }

  return transformDriverDocument(snapshot.id, snapshot.data());
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create a new driver with default schedule
 */
export async function createDriver(data: CreateDriverData): Promise<Driver> {
  if (!data.name) {
    throw new Error('Driver name is required');
  }

  const firestoreData = prepareDriverForFirestore(
    {
      ...data,
      isActive: data.isActive ?? true,
      availabilitySchedule: data.availabilitySchedule || DEFAULT_DRIVER_SCHEDULE,
    },
    true
  );

  const driversRef = collection(db, COLLECTIONS.DRIVERS);
  const docRef = await addDoc(driversRef, firestoreData);

  return transformDriverDocument(
    docRef.id,
    firestoreData as Record<string, unknown>
  );
}

/**
 * Update an existing driver
 */
export async function updateDriver(
  driverId: string,
  data: UpdateDriverData
): Promise<Driver> {
  if (!driverId) {
    throw new Error('Driver ID is required for updates');
  }

  const driverRef = doc(db, COLLECTIONS.DRIVERS, driverId);
  const firestoreData = prepareDriverForFirestore(data, false);

  await updateDoc(driverRef, firestoreData);

  return getDriverById(driverId);
}

/**
 * Delete a driver
 */
export async function deleteDriver(driverId: string): Promise<void> {
  if (!driverId) {
    throw new Error('Driver ID is required for deletion');
  }

  const driverRef = doc(db, COLLECTIONS.DRIVERS, driverId);
  await deleteDoc(driverRef);
}

/**
 * Toggle driver active status
 */
export async function toggleDriverStatus(driverId: string): Promise<Driver> {
  const driver = await getDriverById(driverId);
  return updateDriver(driverId, { isActive: !driver.isActive });
}
