import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (user) => {
  const payload = {
    sub: user._id.toString(),
    type: "access",
  };
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1000000ms",
  });
  return token;
};

export const generateRefreshToken = (user) => {
  const jti = crypto.randomUUID();
  // console.log(jti);
  const payload = {
    sub: user._id.toString(),
    jti: jti,
    type: "refresh",
  };
  const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { token, jti };
};
