// bed types
export type BedType = "apple" | "orange" | "lemon" | "grape";

// user roles
export type Role = "case_worker" | "site_admin";

// base types for Convex documents (will be replaced with generated types after convex dev)
export interface User {
	_id: string;
	_creationTime: number;
	email: string;
	role: Role;
	siteId?: string;
	name: string;
}

export interface Site {
	_id: string;
	_creationTime: number;
	name: string;
	address: string;
	phone: string;
	bedCounts: {
		apple: number;
		orange: number;
		lemon: number;
		grape: number;
	};
}

export interface Hold {
	_id: string;
	_creationTime: number;
	siteId: string;
	bedType: BedType;
	caseWorkerId: string;
	expiresAt: number;
	createdAt: number;
}

export interface Reservation {
	_id: string;
	_creationTime: number;
	siteId: string;
	bedType: BedType;
	caseWorkerId: string;
	clientName: string;
	notes: string;
	createdAt: number;
}

// derived types for UI
export interface BedAvailability {
	bedType: BedType;
	totalAvailable: number;
}

export interface SiteBedAvailability {
	site: Site;
	bedType: BedType;
	total: number;
	available: number;
	onHold: number;
	reserved: number;
}

export interface ReservationWithCaseWorker extends Reservation {
	caseWorkerName: string;
}

// mutation result types
export type MutationResult<T = void> =
	| { success: true; data: T }
	| { success: false; error: string; code: ErrorCode };

export enum ErrorCode {
	VALIDATION_ERROR = "validation_error",
	AUTHORIZATION_ERROR = "authorization_error",
	NOT_FOUND = "not_found",
	CONFLICT = "conflict",
	EXPIRED = "expired",
}
