const User = require('./../Models/userModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sendEmail = require('./../Utils/email');
const crypto = require('crypto');

// Function to generate JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.secret_string, {
        expiresIn: process.env.login_expires
    });
}

// Route handler for user signup
// exports.signup = asyncErrorHandler(async (req, res, next) => {
//     // Check if any users exist in the database
//     const userEmail = req.body.email;
//     const existingUser = await User.findOne({ email: userEmail });

//     console.log(existingUser,'yes');

//     if (!existingUser) {
//         // Create the first user with a temporary password
//         const temporaryPassword = generateTemporaryPassword();
//         const newUser = await User.create({
//             email: req.body.email,
//             password: temporaryPassword,
//             forcePasswordChange: true // Flag indicating that password change is required
//         });

//         // Send email with temporary password to the new user
//         await sendTemporaryPasswordEmail(newUser.email, temporaryPassword);

//         // Return success response with temporary password message
//         return res.status(201).json({
//             status: 'success',
//             message: 'First user created successfully. Temporary password sent to email.'
//         });
//     }

//     // For subsequent users, proceed with regular signup process
//     const newUser = await User.create(req.body);
//     const token = signToken(newUser._id);
//     res.status(201).json({
//         status: 'success',
//         token,
//         data: {
//             user: newUser
//         }
//     });
// });

// Route handler for user login
exports.login = asyncErrorHandler(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    // Check if email and password are provided
    if (!email || !password) {
        return next(new Error('Please provide email and password'));
    }
    const userEmail = req.body.email;
    const existingUser = await User.findOne({ email: userEmail });

    console.log(existingUser,'yes');

    if (!existingUser) {
        // Create the first user with a temporary password
        const temporaryPassword = generateTemporaryPassword();
        const newUser = await User.create({
            email: req.body.email,
            password: temporaryPassword,
            forcePasswordChange: true // Flag indicating that password change is required
        });

        // Send email with temporary password to the new user
        await sendTemporaryPasswordEmail(newUser.email, temporaryPassword);

        // Return success response with temporary password message
        return res.status(201).json({
            status: 'success',
            message: 'First user created successfully. Temporary password sent to email.'
        });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    // If user doesn't exist, create a new user
    if (!user) {
        await User.create({ email, password });
        return res.status(201).json({ status: 'success', message: 'New account created successfully' });
    }
    

    // Compare passwords
    bcrypt.compare(password, user.password, function (err, isMatch) {
        if (err) {
            console.log('Error comparing passwords:', err);
            return;
        }
        if (isMatch) {
            return res.status(201).json({ status: 'success', message: 'Passwords match' });
        } else {
            return res.status(400).json({ status: 'error', message: 'Passwords do not match' });
        }
    });
});

// Route handler for forgetting password
exports.forgetPass = asyncErrorHandler(async (req, res, next) => {
    // Find user based on provided email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        const error = 'User not found';
        return next(error);
    }

    // Generate a random reset token and save it
    const resetToken = user.createResetPasswordToken();
    await user.save();

    // Construct the reset URL
    console.log(`${req.get('host')}`);

    const resetURL = `${req.protocol}://${req.get('host')}/users/resetPass/${resetToken}`;

    // Prepare the email message
    const message = `We have received a password reset request. Please use the following link to reset your password: ${resetURL}`;



    try {
        // Send the reset email
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message: message
        });
        res.status(200).json({
            status: 'success',
            message: 'Password reset link sent to user email'
        });
    } catch (err) {
        // If sending email fails, handle the error
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save();
        const error = 'Error sending password reset email';
        return next(error);
    }
});

// Route handler for resetting password
exports.resetPass = asyncErrorHandler(async (req, res, next) => {
    // Get the token from the request parameters and hash it
    console.log(req.params.token);

    console.log('test');
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    // Find user with the hashed token and a valid expiration date
    const user = await User.findOne({
        passwordResetToken: token,
        passwordResetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        // If no user found with the token, return an error
        const error = 'Invalid or expired token';
        return next(error);
    }

    // Update user's password and clear reset token fields
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    // Log in the user automatically by generating a new JWT token
    const loginToken = signToken(user._id);

    // Send success response with new token
    res.status(201).json({
        status: 'success',
        token: loginToken
    });
});

const generateTemporaryPassword = () => {
    // Define a character pool for generating the password
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Set the length of the temporary password
    const length = 10;

    let temporaryPassword = '';
    for (let i = 0; i < length; i++) {
        // Generate a random index to select a character from the pool
        const randomIndex = Math.floor(Math.random() * characters.length);
        // Append the randomly selected character to the temporary password
        temporaryPassword += characters.charAt(randomIndex);
    }

    return temporaryPassword;
};


// Function to send temporary password to the new user via email
const sendTemporaryPasswordEmail = async (email, password) => {
    const message = `Your temporary password is: ${password}. Please login and change your password immediately.`;
    await sendEmail({ email, subject: 'Temporary Password', message });
};