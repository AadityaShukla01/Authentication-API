import userModel from "../models/User.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import transporter from "../config/email.js";


class UserController {
    static userRegistration = async (req, res) => {
        const { name, email, password, password_confirmation, tc } = req.body

        const user = await userModel.findOne({ email: email });
        //if user already exists return error
        if (user) {
            res.status(400).json({ "status": "failed", "message": "Email already exists" });
        }
        else {
            if (name && email && password && password_confirmation && tc) {
                if (password === password_confirmation) {

                    try {

                        //hashing password
                        const salt = await bcrypt.genSalt(10);
                        const hashPassword = await bcrypt.hash(password, salt)

                        //if everything is fine we save data to db
                        const doc = new userModel({
                            name: name,
                            email: email,
                            password: hashPassword,
                            tc: tc
                        })

                        //saveing changes
                        await doc.save();
                        //steps for jwt authentication


                        //getting the instnace of current user just registered
                        const currUser = await userModel.findOne({ email: email })
                        //Gnerate jwt token for register
                        const token = jwt.sign({ userId: currUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });

                        //send token to client
                        //similarly generate token for login
                        res.status(200).json({
                            "status": "success",
                            "message": "account recreated!",
                            "token": token
                        })
                    }
                    catch (error) {
                        res.status(403).json({ "status": "failed", "message": "Try again" });
                    }
                }
                else {
                    res.status(400).json({ "status": "failed", "message": "Passwords are not same" });
                }
            }
            else {
                res.status(400).json({ "status": "failed", "message": "All fields are required" });
            }
        }
    }
    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                //if email & passwords are there then find the object associated with it
                const user = await userModel.findOne({ email: email });
                //now check if user exits or not
                if (user) {
                    //comapare passwords of input vs password with that email id stored in database
                    const isMatch = await bcrypt.compare(password, user.password)

                    if (user.email === email && isMatch) {

                        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });


                        res.status(200).json({
                            status: 'success',
                            message: 'Login success',
                            token: token
                        })

                    }
                    else {
                        res.status(401).json({
                            status: 'fail',
                            message: 'Password or email wrong'
                        })
                    }
                }
                else {
                    res.status(400).json({
                        status: 'failed',
                        message: 'No user with such email exists'
                    })
                }
            }
            else {
                res.status(400).json({ status: 'failed', message: 'Enter email & password' });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ status: 'failed', message: 'Unable to login' });
        }
    }
    static changeUserPassword = async (req, res) => {
        const { password, changeUserPassword } = req.body;

        if (password && changeUserPassword) {
            if (password === changeUserPassword) {
                const salt = await bcrypt.genSalt(12);
                const hashPassword = await bcrypt.hash(changeUserPassword, salt);
                // console.log(req.user)

                //changing password
                //auth middleware se hame req.user yani ki logged in user milta hain
                await userModel.findByIdAndUpdate(req.user._id, { $set: { password: hashPassword } })

                // this.password = hashPassword;
                res.status(200).json({
                    status: 'success',
                    message: 'Password changed successfully'
                })
            }
            else {
                res.status(400).json({
                    status: "fail",
                    message: 'password & confirmPassword dont match'
                })
            }
        } else {
            res.status(400).json({
                status: 'fail',
                message: 'Enter all fields'
            })
        }
    }
    static loggedUser = async (req, res) => {
        res.send({ "user": req.user })
    }

    static sendPasswordResetEmail = async (req, res, next) => {
        //get email from frontend
        const { email } = req.body
        //after getting email check if user ecists or not
        if (email) {
            const user = await userModel.findOne({ email: email });
            //generating a secret key for email
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY;
                //check if that email already exists
                //genrating token
                const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '50d' })
                //generating link for frontend
                const link = `http://localhost:3001/api/user/reset/${user._id}/${token}`;
                console.log(link);

                //sending email
                console.log(user.email)
                let info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject: 'password reset mail',
                    html: `<a href=${link}>Om sai ram</a>`
                })

                //sendig response
                res.status(200).json({
                    status: 'success',
                    message: 'Email sent',
                    info:info,
                })
            } else {
                res.status(400).json({
                    status: 'fail',
                    message: 'Please register'
                })
            }
        }
        else {
            res.status(401).json({
                status: 'fail',
                message: 'Please enter email'
            })
        }
    }
    //password reset function when we sent link to frontend
    static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body;
        // console.log(password);
        // console.log(password_confirmation);
        const { id, token } = req.params
        console.log(id);
        console.log(token);
        //params me url ke sath info milega
        //id se user nikale
        const user = await userModel.findById(id);
        const new_secret = user._id + process.env.JWT_SECRET_KEY;
        try {
            //verifying token
            jwt.verify(token, new_secret);
            if (password && password_confirmation) {
                if (password === password_confirmation) {
                    const salt = await bcrypt.genSalt(12);
                    const hashPassword = await bcrypt.hash(password, salt);
                    // console.log(req.user)

                    //changing password
                    //auth middleware se hame req.user yani ki logged in user milta hain
                    await userModel.findByIdAndUpdate(user._id, { $set: { password: hashPassword } })

                    res.status(200).json({
                        status: 'success',
                        message: 'password changed successfully'
                    })
                }
                else {
                    res.status(400).json({
                        status: 'fail',
                        message: 'password & password_confirmation are not matching'
                    })
                }
            }
            else {
                res.status(400).json({
                    status: 'fail',
                    message: 'please enter all fields'
                })
            }

        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: 'fail',
                message: error
            })
        }

    }
}

export default UserController;