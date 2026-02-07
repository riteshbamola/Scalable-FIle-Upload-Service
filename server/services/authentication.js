const jwt = require('jsonwebtoken')

const ACCESS_TOKEN_SECRET = "BAMOLI"
const REFRESH_TOKEN_SECRET = "BAMOLI"
export const genrateAccessToken =(user)=>{
    const payload ={
        sub: user._id.toString(),
        role:user.role,
        type:'access'
    }
    const token= jwt.sign(payload,ACCESS_TOKEN_SECRET,{expiresIn:'1500ms'});
    return token;
}

export const generateRefreshToken = (user) =>{
    const jti= crypto.randomUUID();
    const payload= {
        sub:user._id.toString(),
        jti:jti,
        type:'refresh'
    }
    return  jwt.sign(payload,REFRESH_TOKEN_SECRET, {expiresIn:'7d'});
   
}