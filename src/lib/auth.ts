/** Yerel demo kimlik: şifre sunucuya gitmez; tarayıcıda tuz + SHA-256 özet saklanır. Üretimde mutlaka backend oturum kullanın. */

const encoder = new TextEncoder();

/** Kimi ZIP / üç tip giriş akışı (bireysel, emlakçı, müteahhit). Yerel demo veya metadata ile dolar. */
export type AccountSegment = "individual" | "realtor" | "developer";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordSalt?: string;
  passwordHash?: string;
  /** Eski kayıtlar — girişte otomatik taşınır */
  password?: string;
  avatar?: string;
  verified?: boolean;
  rating?: number;
  auctionsCreated?: number;
  auctionsWon?: number;
  memberSince?: string;
  sellerIntent?: string;
  accountSegment?: AccountSegment;
};

export type SessionUser = Omit<StoredUser, "password" | "passwordSalt" | "passwordHash"> & {
  /** `supabase`: Supabase Auth oturumu; aksi yerel demo. */
  authBackend?: "local" | "supabase";
  accountSegment?: AccountSegment;
};

function randomSalt(): string {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(plain: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}|${plain}`);
}

export async function createPasswordRecord(plain: string): Promise<{ passwordSalt: string; passwordHash: string }> {
  const passwordSalt = randomSalt();
  const passwordHash = await hashPassword(plain, passwordSalt);
  return { passwordSalt, passwordHash };
}

export async function verifyPassword(user: StoredUser, plain: string): Promise<boolean> {
  if (user.passwordHash && user.passwordSalt) {
    const h = await hashPassword(plain, user.passwordSalt);
    return h === user.passwordHash;
  }
  if (user.password !== undefined) {
    return user.password === plain;
  }
  return false;
}

/** Eski düz metin şifreyi özet + tuza çevirir (users dizisinde kalıcı). */
export async function migrateUserPasswordIfNeeded(user: StoredUser, plain: string): Promise<StoredUser> {
  if (user.passwordHash && user.passwordSalt) return user;
  if (user.password === undefined) return user;
  if (user.password !== plain) return user;
  const { passwordSalt, passwordHash } = await createPasswordRecord(plain);
  const next: StoredUser = { ...user, passwordSalt, passwordHash };
  delete (next as { password?: string }).password;
  return next;
}

export function stripForSession(user: StoredUser): SessionUser {
  const { password: _p, passwordSalt: _s, passwordHash: _h, ...rest } = user;
  return rest as SessionUser;
}

export function dispatchAuthChanged(): void {
  window.dispatchEvent(new Event("ihaleal-auth"));
}
