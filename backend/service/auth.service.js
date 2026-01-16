import { findUserByEmail, createUser, checkPassword } from "../dao/users.dao.js";
import { createToken } from "../helper/helper.js";

export const registerUserService =async ({ name, email, password }) => {
    const exists = await findUserByEmail(email);
    if (exists) return res.status(409).json({ message: "Email already in use" });
    
    const user = await createUser({ name, email, password });

    const token = createToken({id: user._id, email: user.email, provider: "local" });

    return token;
}

export const loginUserService = async ({ email, password }) => {
    const user = await checkPassword({email, password});
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    
    const token = createToken({id: user._id, email: user.email, provider: "local" });
    return token;
}