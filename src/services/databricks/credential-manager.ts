import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const asyncScrypt = promisify(scrypt);

// Constants for encryption
const ALGORITHM = 'aes-256-cbc';
const SALT = process.env.DATABRICKS_ENCRYPTION_SALT || 'default-salt-for-development-only!!!';
const SECRET_KEY = process.env.DATABRICKS_ENCRYPTION_KEY || 'default-key-for-development-only!!!';

// Helper function to get encryption key
async function getKey(): Promise<Buffer> {
  return (await asyncScrypt(SECRET_KEY, SALT, 32)) as Buffer;
}

export async function encrypt(token: string): Promise<string> {
  if (!token) {
    throw new Error('Token is required for encryption');
  }

  try {
    const key = await getKey();
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV and encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error('Failed to encrypt token');
  }
}

export async function decrypt(encryptedToken: string): Promise<string> {
  if (!encryptedToken) {
    throw new Error('Encrypted token is required for decryption');
  }

  try {
    const key = await getKey();
    const [ivHex, encryptedHex] = encryptedToken.split(':');
    
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid encrypted token format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt token - invalid or corrupted data');
  }
}

export function validateToken(token: string): boolean {
  // Basic Databricks token validation
  // Personal access tokens start with 'dapi' followed by 32 hex chars
  return /^dapi[a-f0-9]{32}$/i.test(token);
}

export function validateHost(host: string): boolean {
  // Basic Databricks host validation
  return host.includes('.databricks.com') || host.includes('.databricks.azure.com');
}

export function validateHttpPath(httpPath: string): boolean {
  // Basic SQL warehouse path validation
  return httpPath.startsWith('/sql/1.0/warehouses/') || httpPath.startsWith('/sql/protocolv1/');
}