import crypto from "node:crypto";
import { errRes } from "../err.hanle.js";

// The secret key. It locks AND unlocks the data (exactly 32 characters)
const secretKey = Buffer.from("dfghjktdtfluoon;niioseytdyvulbui")

// ===== LOCKING: normal text -> locked text =====
export const encryption = (data) => {
    // 1) Make a random number (IV). Same text gives a new result each time
    const iv = crypto.randomBytes(16)

    // 2) Make the lock tool, using the key and the IV
    const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv)

    // 3) Lock the text. Input is normal text (utf-8), output is hex (0-9, a-f)
    let cipherText = cipher.update(data, "utf-8", "hex")

    // 4) Lock the last small part and add it to the rest
    cipherText += cipher.final("hex")

    // 5) Send back the IV and the locked text together, like "5e2a...:a3f9..."
    //    We save both, because unlocking needs the IV
    return `${iv.toString("hex")}:${cipherText}`
}

// ===== UNLOCKING: locked text -> normal text =====
// It does the same steps as locking, but backwards
export const decryption = (encryptionValue) => {
    // 1) Cut the saved text at ":" into two parts
    //    "5e2a...:a3f9..." becomes iv = "5e2a..." and cipherText = "a3f9..."
    const [iv, cipherText] = encryptionValue.split(":")

    // 2) If one part is missing, the saved text is broken, so stop here
    if (!iv || !cipherText) {
        return errRes({
            msg: "invalid encrypted value"
        })
    }

    // 3) The IV was saved as hex text. Turn it back into bytes
    const binaryIv = Buffer.from(iv, "hex")

    // 4) Make the unlock tool. Everything must match the lock tool:
    //    same method (aes-256-cbc), same key, same IV. If one is different, it fails
    const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, binaryIv)

    // 5) Unlock the main part. Now it's the opposite of locking:
    //    input is hex (the locked text), output is normal text (utf-8)
    let plainText = decipher.update(cipherText, "hex", "utf-8")

    // 6) Unlock the last small part and add it to the rest
    plainText += decipher.final("utf-8")

    // 7) Send back the original text, like "nagy"
    return plainText
}