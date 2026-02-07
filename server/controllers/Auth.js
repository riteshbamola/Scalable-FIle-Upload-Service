const User = require('../Models/User');
const RefreshToken= require('../Models/Refresh')
const {generateRefreshToken,genrateAccessToken}= require('../services/authentication')
const handleSignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    r
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

const handleSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;


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

    
    const accessToken = genrateAccessToken(user);
    const { refreshToken, jti } = generateRefreshToken(user);

   
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

module.exports = { handleSignUp, handleSignIn };
