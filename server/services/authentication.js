import jwt from 'jsonwebtoken';   
import crypto from 'crypto'

const ACCESS_TOKEN_SECRET = "BAMOLI"
const REFRESH_TOKEN_SECRET = "BAMOLI"
export const genrateAccessToken =(user)=>{
    const payload ={
        sub: user._id.toString(),
        type:'access'
    }
    const token= jwt.sign(payload,ACCESS_TOKEN_SECRET,{expiresIn:'900000ms'});
    return token;
}

export const generateRefreshToken = (user) =>{
    const jti= crypto.randomUUID();
    console.log(jti);
    const payload= {
        sub:user._id.toString(),
        jti:jti,
        type:'refresh'
    }
    const token = jwt.sign(payload,REFRESH_TOKEN_SECRET, {expiresIn:'7d'});
    return {token,jti};
}