import express from 'express';
const router = express.Router()
import UserController from '../controllers/userController.js'
import checkUserAuth from '../middlewares/authMiddleware.js';
//route level middleware to protect routes
//taki inke parent routes ko access mil jaye logged in user ka
router.use('/changepassword', checkUserAuth)
router.use('/loggedUser', checkUserAuth)

//public routes
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post('/send-password-reset-email', UserController.sendPasswordResetEmail)
router.post('/reset/:id/:token', UserController.userPasswordReset)

//private route
//we need a middleware to protect route
router.post('/changepassword', UserController.changeUserPassword);
router.get('/loggedUser', UserController.loggedUser);


export default router;