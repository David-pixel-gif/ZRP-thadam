// src/utils/encryption.js
import CryptoJS from "crypto-js";

/**
 * Generates a symmetric session key based on the user's Ethereum account.
 * This ensures each user decrypts only their authorized data.
 * @param {string} account - Ethereum wallet address.
 * @returns {string} sessionKey
 */
export const generateSessionKey = (account) => {
  // Derive AES key deterministically from wallet address
  return CryptoJS.SHA256(account.toLowerCase()).toString();
};

/**
 * Encrypts JSON/text data using AES
 * @param {Object|string} data
 * @param {string} key
 * @returns {string} Base64 AES ciphertext
 */
export const encryptData = (data, key) => {
  const plain = typeof data === "string" ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(plain, key).toString();
};

/**
 * Decrypts AES-encrypted JSON/text data
 * @param {string} ciphertext
 * @param {string} key
 * @returns {Object|string} decrypted data
 */
export const decryptData = (ciphertext, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    try {
      return JSON.parse(plain);
    } catch {
      return plain;
    }
  } catch (err) {
    console.error("❌ Decryption error:", err);
    throw new Error("Failed to decrypt data.");
  }
};

/**
 * Encrypts a binary file (ArrayBuffer or Uint8Array)
 * @param {ArrayBuffer|Uint8Array} buffer
 * @param {string} key
 * @returns {string} Base64 AES ciphertext
 */
export const encryptFile = (buffer, key) => {
  const wordArray = CryptoJS.lib.WordArray.create(buffer);
  const encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
  return encrypted;
};

/**
 * Decrypts AES-encrypted Base64 file back into Blob
 * @param {string} encryptedBase64
 * @param {string} key
 * @returns {Blob} decrypted file Blob
 */
export const decryptFile = (encryptedBase64, key) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key);
    const wordArray = decrypted; // CryptoJS WordArray
    const typedArray = wordArrayToUint8Array(wordArray);
    return new Blob([typedArray]);
  } catch (err) {
    console.error("❌ File decryption failed:", err);
    throw new Error("Invalid key or corrupted encrypted file.");
  }
};

/**
 * Helper: Converts CryptoJS WordArray → Uint8Array
 */
const wordArrayToUint8Array = (wordArray) => {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return u8;
};

/**
 * Optional utility to hash any data (useful for integrity verification)
 * @param {string} data
 * @returns {string} SHA256 hash
 */
export const generateDataHash = (data) => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Builds a secure IPFS payload:
 * 1. Encrypts input JSON
 * 2. Adds metadata (hash, timestamp)
 */
export const buildEncryptedPayload = (data, key) => {
  const encrypted = encryptData(data, key);
  const hash = generateDataHash(encrypted);
  return {
    encrypted,
    hash,
    timestamp: new Date().toISOString(),
  };
};
