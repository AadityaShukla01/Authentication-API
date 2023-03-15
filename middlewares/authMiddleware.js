import jwt from 'jsonwebtoken'
import UserController from '../controllers/userController.js'
import userModel from '../models/User.js';

const checkUserAuth = async (req, res, next) => {
    let token
    //we need to access the token sent to us through headers


    const { authorization } = req.headers;

    if (authorization && authorization.startsWith('Bearer')) {
        try {
            token = authorization.split(' ')[1];

            //we got token now we verify it
            //fetch the id from the token so that we can ge which user logged in
            const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY)
            //get user from the id we got from tokens payload
            req.user = await userModel.findById(userId).select('-password');
            
            next();

        }
        catch (error) {
            console.log(error);
            res.status(401).json({
                status: 'fail',
                message: 'Unauthorised user'
            })
        }
    }
    if (!token) {
        res.status(401).json({
            status: 'fail',
            message: 'Unauthorised user,NO token'
        })
    }
}
export default checkUserAuth;