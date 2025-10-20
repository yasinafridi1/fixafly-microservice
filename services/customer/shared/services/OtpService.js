import crypto from "crypto";
import envVariables from "../../config/Constants.js";
const { otpSecret } = envVariables;

// Generate OTP and hashed value
export async function generateOtp(email) {
  const otp = crypto.randomInt(100000, 999999); // 6-digit OTP
  const ttl = 1000 * 60 * 3; // 3 minutes
  const expire = Date.now() + ttl; // expiry timestamp
  const data = `${email}.${expire}.${otp}`;

  // Hash the data
  const hashedOtp = crypto
    .createHmac("sha256", otpSecret)
    .update(data)
    .digest("hex");

  return { otp, hashedOtp, expire };
}

// Verify OTP
export async function verifyOtp(email, otp, expire, hashedOtp) {
  const data = `${email}.${expire}.${otp}`;
  const computedHash = crypto
    .createHmac("sha256", otpSecret)
    .update(data)
    .digest("hex");

  return computedHash === hashedOtp;
}
