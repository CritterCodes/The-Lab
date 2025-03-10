// src/app/api/auth/auth.service.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../../v1/users/class';
import UserModel from './model';
import { sendVerificationEmail, sendInviteEmail } from '@/app/utils/email.util.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '7d'; // Token expiration for JWT tokens
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_key_32charslong____'; // Must be 32 bytes
const IV_LENGTH = 16; // 16 bytes for AES

export default class AuthService {

    // New deterministic encryption for emails
    static encryptEmail(email) {
        if (!email) return '';
        const key = Buffer.from(ENCRYPTION_KEY);
        const iv = Buffer.alloc(IV_LENGTH, 0); // deterministic IV
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        return cipher.update(email, 'utf8', 'hex') + cipher.final('hex');
    }

    // New deterministic decryption for emails
    static decryptEmail(encryptedEmail) {
        if (!encryptedEmail) return '';
        const key = Buffer.from(ENCRYPTION_KEY);
        const iv = Buffer.alloc(IV_LENGTH, 0);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        return decipher.update(encryptedEmail, 'hex', 'utf8') + decipher.final('utf8');
    }

    // New deterministic encryption for phone numbers
    static encryptPhone(phoneNumber) {
        if (!phoneNumber) return '';
        const key = Buffer.from(ENCRYPTION_KEY);
        const iv = Buffer.alloc(IV_LENGTH, 0);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        return cipher.update(phoneNumber, 'utf8', 'hex') + cipher.final('hex');
    }

    // New deterministic decryption for phone numbers
    static decryptPhone(encryptedPhone) {
        if (!encryptedPhone) return '';
        const key = Buffer.from(ENCRYPTION_KEY);
        const iv = Buffer.alloc(IV_LENGTH, 0);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        return decipher.update(encryptedPhone, 'hex', 'utf8') + decipher.final('utf8');
    }

    /**
     * ✅ Register a new user with email and password
     * - Called during manual sign-up
     */
    static async register(userData) {
        const { firstName, lastName, username, email, password, phoneNumber, status } = userData; // added username
        const plainEmail = email;
        const encryptedEmail = this.encryptEmail(email);
        const encryptedPhone = phoneNumber ? this.encryptPhone(phoneNumber) : '';
        console.log(userData);
        console.log('looking for user');
        const existingUser = await UserModel.findByEmail(encryptedEmail);
        console.log(existingUser);
        if (existingUser) {
            throw new Error("User already exists with this email.");
        };
        console.log('hashing password');
        const hashedPassword = password ? await bcrypt.hash(password, 10) : 'no password';
        console.log('creating new user with:', firstName, lastName, encryptedEmail, hashedPassword, encryptedPhone, status);
        
        const newUser = new User(
            firstName,
            lastName,
            username, // new argument
            encryptedEmail, // store encrypted email
            hashedPassword,
            phoneNumber ? encryptedPhone : '', // store encrypted phone number
            'user', // default role
            status
        );
        console.log("newUser", newUser);
        console.log('creating user');
        const results = await UserModel.create(newUser);

        // ✅ Send the verification email using the email utility
        console.log("user status", newUser.status);
        if (newUser.status === 'unverified') {
            // Added logging before sending email
            console.log("Attempting to send verification email to:", plainEmail, "with token:", newUser.verificationToken);
            await sendVerificationEmail(plainEmail, newUser.verificationToken);
        };
        return results;
    }

    /**
     * ✅ Login a user with email/username and password
     * - Called in CredentialsProvider flow of NextAuth
     */
    static async login(identifier, password) {
        let user;
        if (identifier.includes('@')) {
            const encryptedEmail = this.encryptEmail(identifier);
            user = await UserModel.findByEmail(encryptedEmail);
        } else {
            user = await UserModel.findByUsername(identifier);
        }
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
            email: this.decryptEmail(user.email), // return decrypted email
            role: user.role,
            image: user.image
        };
    }

    /**
     * ✅ Google Authentication Logic
     * - Called when logging in through GoogleProvider in NextAuth
     */
    static async googleAuth({ email, name, image }) {
        const encryptedEmail = this.encryptEmail(email);
        let user = await UserModel.findByEmail(encryptedEmail);

        if (!user) {
            const [firstName, lastName] = name.split(' ');

            user = await UserModel.create({
                firstName,
                lastName,
                email: encryptedEmail, // store encrypted email
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
        await UserModel.updateById(user.userID, user);

        return { message: "Email successfully verified." };
    }

    /**
     * ✅ Resend the verification email for unverified users
     */
    static async resendVerification(email) {
        const encryptedEmail = this.encryptEmail(email);
        const user = await UserModel.findByEmail(encryptedEmail);
        if (!user) {
            throw new Error("User not found.");
        }
        if (user.status === 'verified') {
            throw new Error("User is already verified.");
        }
        // Use user's generateVerificationToken method if available; else generate JWT token matching User class
        user.verificationToken = user.generateVerificationToken
            ? user.generateVerificationToken()
            : jwt.sign(
                { email: this.decryptEmail(user.email), userID: user.userID },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
              );
        await user.save();
        await sendVerificationEmail(email, user.verificationToken);
    }

    /**
     * ✅ Logout - Stateless JWT-based logout
     */
    static async logout() {
        return { message: "You have been logged out." };
    }
}
