import bcrypt from "bcryptjs"

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt)
    return passwordHash
  } catch (error) {
    throw new Error("Error hashing password")
  }
}

export default hashPassword