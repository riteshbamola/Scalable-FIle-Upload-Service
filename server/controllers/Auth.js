import User from '../Models/User.js';
import RefreshToken from '../Models/Refresh.js';
import jwt from 'jsonwebtoken'
import {
  generateAccessToken,
  generateRefreshToken
} from '../services/authentication.js';

export const handleSignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    const newUser = await User.create({
      name,
      email,
      password, 
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleSignIn = async (req, res) => {
  try {
    const {email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

   
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    
    const accessToken = generateAccessToken(user);
    const { token:refreshToken, jti } = generateRefreshToken(user);
   
    await RefreshToken.create({
      userId: user._id,
      jti,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    
    return res.status(200).json({
      message: 'Login successful',
      accessToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const rotateToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
 
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    let payload;
    try {
      payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (err) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const storedToken = await RefreshToken.findOne({
      userId: payload.sub,
      jti: payload.jti,
    });


    if (!storedToken) {
      await RefreshToken.deleteMany({ userId: payload.sub });
      return res
        .status(401)
        .json({ message: 'Refresh token reuse detected' });
    }

    
    const newAccessToken = generateAccessToken({
      _id: payload.sub,
    });


  
    await RefreshToken.deleteOne({ _id: storedToken._id });

    console.log("deleted refresh token")
    const { token: newRefreshToken, jti } =
      generateRefreshToken({ _id: payload.sub });

    await RefreshToken.create({
      userId: payload.sub,
      jti,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};