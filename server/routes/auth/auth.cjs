const express = require('express');
const {
  registerUser,
} = require('../../controllers/auth/registrationController.cjs');
const { verifyUser } = require('../../controllers/auth/verifyController.cjs');
const { loginUser } = require('../../controllers/auth/loginController.cjs');
const { resetPassword } = require('../../controllers/auth/resetPassController.cjs');
const { resetCode } = require('../../controllers/auth/resetCodeController.cjs');

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/verify', verifyUser);
authRouter.post('/login', loginUser);

authRouter.post('/reset-password', resetPassword);
authRouter.post('/reset-code', resetCode);

module.exports = authRouter;
