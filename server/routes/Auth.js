const express= require('express');
const {handleSignUp}= require('../controllers/Auth')
const router = express.Router();
router.post('/signup',handleSignUp);