// src/app/api/auth/auth.service.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto, { hash } from 'crypto';
import User from '../../v1/users/class';
import UserModel from './model';
import { sendVerificationEmail, sendInviteEmail } from '@/app/utils/email.util.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '7d'; // Token expiration for JWT tokens

export default class AuthService {

    // New helper to hash emails securely
    static hashEmail(email) {
        return crypto.createHash('sha256').update(email).digest('hex');
    }

    /**
     * ✅ Register a new user with email and password
     * - Called during manual sign-up
     */
    static async register(userData) {
        const { firstName, lastName, username, email, password, phoneNumber, status } = userData; // added username
        const plainEmail = email;
        const hashedEmail = this.hashEmail(email);
        console.log(userData);
        console.log('looking for user');
        const existingUser = await UserModel.findByEmail(hashedEmail);
        console.log(existingUser);
        if (existingUser) {
            throw new Error("User already exists with this email.");
        };
        console.log('hashing password');
        const hashedPassword = password ? await bcrypt.hash(password, 10) : 'no password';
        console.log('creating new user with:', firstName, lastName, hashedEmail, hashedPassword, phoneNumber, status);
        
        const newUser = new User(
            firstName,
            lastName,
            username, // new argument
            hashedEmail, // store hashed email
            hashedPassword,
            phoneNumber ? phoneNumber : '',
            'client',
            status
        );
        console.log("newUser", newUser);
        console.log('creating user');
        const results = await UserModel.create(newUser);

        // ✅ Send the verification email using the email utility
        if (userData.status === 'unverified') {
            await sendVerificationEmail(plainEmail, newUser.verificationToken);
        };
        return results;
    }

    /**
     * ✅ Login a user with email and password
     * - Called in CredentialsProvider flow of NextAuth
     */
    static async login(email, password) {
        const hashedEmail = this.hashEmail(email);
        const user = await UserModel.findByEmail(hashedEmail);
        if (!user) {
            throw new Error("User not found.");
        }
        if (user.status !== 'verified') {
            throw new Error("Please verify your email before logging in.");
        }

        // Check if the password is valid
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.error("Password comparison failed!");
            throw new Error("Invalid password.");
        }

        // ✅ Generate JWT Token for the authenticated user
        const token = jwt.sign({ userID: user.userID, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRATION
        });

        console.log("Password matched. Token generated.");

        // ✅ Return the full user data along with the token
        return {
            token,
            userID: user.userID,
            firstName: user.firstName,
            lastName: user.lastName,
            email: hashedEmail,
            role: user.role,
            image: user.image
        };
    }


    /**
     * ✅ Google Authentication Logic
     * - Called when logging in through GoogleProvider in NextAuth
     */
    static async googleAuth({ email, name, image }) {
        const hashedEmail = this.hashEmail(email);
        let user = await UserModel.findByEmail(hashedEmail);

        if (!user) {
            const [firstName, lastName] = name.split(' ');

            user = await UserModel.create({
                firstName,
                lastName,
                email: hashedEmail, // store hashed email
                image,
                role: 'client',
                status: 'verified'
            });
        }

        // ✅ Return the user object for NextAuth JWT management
        const token = jwt.sign({ userID: user.userID, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRATION
        });

        return { user, token };
    }

    /**
     * ✅ Verify user's email using token
     */
    static async verifyEmail(token) {
        const user = await UserModel.findByVerificationToken(token);
        if (!user) {
            throw new Error("Invalid or expired verification token.");
        }

        user.status = 'verified';
        user.verificationToken = null;
        await user.save();

        return { message: "Email successfully verified." };
    }

    /**
     * ✅ Resend the verification email for unverified users
     */
    static async resendVerification(email) {
        const hashedEmail = this.hashEmail(email);
        const user = await UserModel.findByEmail(hashedEmail);
        if (!user) {
            throw new Error("User not found.");
        }

        if (user.status === 'verified') {
            throw new Error("User is already verified.");
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        await user.save();

        // ✅ Resend the verification email
        await sendVerificationEmail(email, verificationToken);
    }

    /**
     * ✅ Invite a new client created by an admin
     * - Creates an unverified client and sends an invite email
     */
    static async inviteClient({ firstName, lastName, email }) {
        const hashedEmail = this.hashEmail(email);
        const existingUser = await UserModel.findByEmail(hashedEmail);
        if (existingUser) {
            throw new Error("A user with this email already exists.");
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await UserModel.create({
            firstName,
            lastName,
            email: hashedEmail, // store hashed email
            role: 'client',
            status: 'unverified',
            verificationToken
        });

        // ✅ Send the invite email with the verification link
        await sendInviteEmail(email, verificationToken, firstName);

        return newUser;
    }

    /**
     * ✅ Logout - Stateless JWT-based logout
     */
    static async logout() {
        return { message: "You have been logged out." };
    }
}
