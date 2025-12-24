import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord'; // Added Discord provider
import CredentialsProvider from 'next-auth/providers/credentials';
import UsersService from '@/app/api/v1/users/service'; // Import Server Service
import DiscordService from '@/lib/discord';

const baseURL = `${process.env.NEXT_PUBLIC_URL}`;

const providers = [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        async profile(profile) {
            try {
                console.log("Google Profile:", profile);

                // ✅ Check if user exists in the database
                const response = await fetch(`${baseURL}/api/v1/users?email=${profile.email}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                const existingUser = await response.json();
                console.log("Existing User:", existingUser);

                if (!response.ok || existingUser.length === 0) {
                    // ✅ Create the user if not found
                    const createResponse = await fetch(`${baseURL}/api/auth/register`, {
                        method: "POST",
                        body: JSON.stringify({
                            firstName: profile.given_name,
                            lastName: profile.family_name,
                            username: '',
                            email: profile.email,
                            provider: 'google',
                            googleId: profile.sub,
                            status: "verified",
                            image: profile.picture
                        }),
                        headers: { "Content-Type": "application/json" }
                    });
                    console.log("Create Response:", createResponse);
                    if (!createResponse.ok) {
                        throw new Error("Failed to create user.");
                    }

                    const newUser = await createResponse.json();
                    console.log("New User:", newUser);
                    return {
                        userID: newUser.user.userID,
                        name: `${newUser.user.firstName} ${newUser.user.lastName}`,
                        username: newUser.user.username,
                        email: newUser.user.email,
                        role: newUser.user.role,
                        image: profile.picture
                    };
                }

                // ✅ Return existing user data
                const user = existingUser.user;

                // ✅ Backwards Compatibility: Update user if provider is missing or image is missing
                if (!user.provider || !user.googleId || !user.image) {
                    console.log("Updating existing user with Google provider info...");
                    await fetch(`${baseURL}/api/v1/users?userID=${user.userID}`, {
                        method: "PUT",
                        body: JSON.stringify({
                            provider: 'google',
                            googleId: profile.sub,
                            image: user.image || profile.picture
                        }),
                        headers: { "Content-Type": "application/json" }
                    });
                }

                return {
                    userID: user.userID,
                    name: `${user.firstName} ${user.lastName}`,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    image: profile.picture
                };

            } catch (error) {
                console.error("Google Auth Error:", error);
                throw new Error("Failed to authenticate with Google.");
            }
        }
    }),
    DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        authorization: { params: { scope: 'identify email guilds.join' } },
        async profile(profile) {
            console.log("Discord Profile:", profile);

            // ✅ Check if user exists in the database
            const response = await fetch(`${baseURL}/api/v1/users?email=${profile.email}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const existingUser = await response.json();
            console.log("Existing User:", existingUser);


            if (!response.ok || existingUser.length === 0) {
                // ✅ Create the user if not found
                const createResponse = await fetch(`${baseURL}/api/auth/register`, {
                    method: "POST",
                    body: JSON.stringify({
                        firstName: '',
                        lastName: '',
                        username: profile.username,
                        email: profile.email,
                        provider: 'discord',
                        discordHandle: profile.username,
                        discordId: profile.id,
                        status: "verified",
                        image: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null
                    }),
                    headers: { "Content-Type": "application/json" }
                });
                console.log("Create Response:", createResponse);
                if (!createResponse.ok) {
                    throw new Error("Failed to create user.");
                }

                const newUser = await createResponse.json();
                console.log("New User:", newUser);
                return {
                    userID: newUser.user.userID,
                    name: `${newUser.user.firstName} ${newUser.user.lastName}`,
                    username: newUser.user.username,
                    email: newUser.user.email,
                    role: newUser.user.role,
                    image: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null
                };
            }

            // ✅ Return existing user data
            const user = existingUser.user;

            // ✅ Backwards Compatibility: Update user if provider or discordHandle is missing or image is missing
            if (!user.provider || !user.discordHandle || !user.discordId || !user.image) {
                console.log("Updating existing user with Discord provider info...");
                await fetch(`${baseURL}/api/v1/users?userID=${user.userID}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        provider: 'discord',
                        discordHandle: profile.username,
                        discordId: profile.id,
                        image: user.image || (profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null)
                    }),
                    headers: { "Content-Type": "application/json" }
                });
            }

            return {
                userID: user.userID,
                name: `${user.firstName} ${user.lastName}`,
                username: user.username,
                email: user.email,
                role: user.role,
                image: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
            };
        }
    }),
    CredentialsProvider({
        credentials: {
            identifier: { label: 'Email or Username', type: 'text' },
            password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
            try {
                console.log("Credentials:", credentials);
                const response = await fetch(`${baseURL}/api/auth/signin`, {
                    method: "POST",
                    body: JSON.stringify({
                        identifier: credentials.identifier,
                        password: credentials.password
                    }),
                    headers: { "Content-Type": "application/json" }
                });

                if (!response.ok) {
                    console.error("Login failed. Invalid credentials.");
                    return null;
                }

                const user = await response.json();
                if (user) {
                    return {
                        userID: user.userID,
                        name: `${user.firstName} ${user.lastName}`,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        token: user.token,
                        image: user.image
                    };
                }
            } catch (error) {
                console.error("Login error:", error);
                return null;
            }
        }
    })
];

export const providerMap = providers.map((provider) => {
    if (typeof provider === 'function') {
        const providerData = provider();
        return { id: providerData.id, name: providerData.name };
    }
    return { id: provider.id, name: provider.name };
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers,
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'discord' && account.access_token) {
                try {
                    console.log("🔗 Attempting to add user to Discord Guild...");
                    await DiscordService.addMemberToGuild(profile.id, account.access_token);
                } catch (error) {
                    console.error("❌ Failed to add user to Discord guild:", error);
                }
            }
            return true;
        },
        async jwt({ token, user, trigger }) {
            if (user) {
                // Check for Merge Scenario
                if (token.userID && token.userID !== user.userID) {
                    console.log(`⚠️ Merge Detected: Merging ${user.userID} into ${token.userID}`);
                    try {
                        // Merge the new user (user.userID) into the existing session user (token.userID)
                        const mergedUser = await UsersService.mergeUsers(token.userID, user.userID);
                        
                        // Update token with merged user data
                        token.userID = mergedUser.userID;
                        token.name = `${mergedUser.firstName} ${mergedUser.lastName}`;
                        token.username = mergedUser.username;
                        token.role = mergedUser.role;
                        token.image = mergedUser.image || token.image;
                        
                        console.log("✅ Merge Successful");
                    } catch (error) {
                        console.error("❌ Merge Failed:", error);
                    }
                } else {
                    // Standard Sign In
                    token.userID = user.userID;
                    token.name = user.name;
                    token.username = user.username;
                    token.role = user.role;
                    token.image = user.image;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.userID = token.userID;
                session.user.name = token.name;
                session.user.username = token.username; // save username in session
                session.user.role = token.role;
                session.user.image = token.image;
            }
            return session;
        }
    }
});
