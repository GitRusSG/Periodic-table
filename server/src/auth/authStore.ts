/**
 * In-memory user store for Auth Service.
 * Uses a Map keyed by username for O(1) lookups.
 * A secondary index maps email → username for uniqueness checks.
 */

export interface StoredUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class AuthStore {
  private usersByUsername: Map<string, StoredUser> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email → username

  /** Returns true if the username is already taken. */
  hasUsername(username: string): boolean {
    return this.usersByUsername.has(username.toLowerCase());
  }

  /** Returns true if the email is already registered. */
  hasEmail(email: string): boolean {
    return this.emailIndex.has(email.toLowerCase());
  }

  /** Persists a new user. Throws if username or email already exists. */
  createUser(user: Omit<StoredUser, "id" | "createdAt">): StoredUser {
    const usernameLower = user.username.toLowerCase();
    const emailLower = user.email.toLowerCase();

    if (this.usersByUsername.has(usernameLower)) {
      throw new Error("Username already taken");
    }
    if (this.emailIndex.has(emailLower)) {
      throw new Error("Email already registered");
    }

    const stored: StoredUser = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    this.usersByUsername.set(usernameLower, stored);
    this.emailIndex.set(emailLower, usernameLower);
    return stored;
  }

  /** Retrieves a user by username (case-insensitive). */
  findByUsername(username: string): StoredUser | undefined {
    return this.usersByUsername.get(username.toLowerCase());
  }

  /** Clears all stored users — used in tests. */
  clear(): void {
    this.usersByUsername.clear();
    this.emailIndex.clear();
  }
}

/** Singleton store instance shared across the application. */
export const authStore = new AuthStore();
