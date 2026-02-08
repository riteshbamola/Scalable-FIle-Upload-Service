import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = "BAMOLI";

export const AuthHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or invalid" });
    }

    const accessToken = authHeader.split(" ")[1];

    const payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);

    
    req.user = payload.sub || payload.id;

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired access token",err });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};
