import { verifyToken } from "../helper/helper.js";

export const authenticateToken = async (req, res, next) => {
  const token = req.cookies?.access_token ;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
        const decoded = verifyToken(token)

        const user = await findUserByEmail(decoded.email)
        if(!user) return res.status(401).json({message : "Unauthorized"})

        req.user = user
        next()
        
    } catch(error) {
        return res.status(401).json({message : "Unauthorized"})
    }
};