"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from "next-auth/react";
import { authAPI } from "@/lib/api";

export interface User {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: "admin" | "customer";
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    token: string | null;

    // Auth methods
    register: (fullName: string, email: string, password: string) => Promise<{ status?: string } | void>;
    login: (email: string, password: string) => Promise<void>;
    googleLogin: () => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (email: string, token: string, newPassword: string, confirmPassword: string) => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    resendVerification: (email: string) => Promise<void>;

    // Profile methods
    getProfile: () => Promise<void>;
    updateProfile: (data: { fullName?: string; phone?: string; avatar?: string }) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();

    // Sync NextAuth session (Google Sign-In) to local state & localStorage
    useEffect(() => {
        const syncGoogleSession = async () => {
            if (session && (session as any).backendToken) {
                const userData: User = {
                    id: (session as any).backendId,
                    fullName: (session as any).fullName || session.user?.name || "",
                    email: session.user?.email || "",
                    role: ((session as any).role || "customer").toLowerCase() as "admin" | "customer",
                    avatar: (session as any).avatar || session.user?.image || "",
                };
                setUser(userData);
                setToken((session as any).backendToken);
                localStorage.setItem("luxury_user", JSON.stringify(userData));
                localStorage.setItem("luxury_token", (session as any).backendToken);

                // Fetch latest profile from DB (including uploaded avatar)
                try {
                    await getProfile();
                } catch (e) {
                    console.error("Failed to sync profile after Google Login:", e);
                }
            }
        };
        syncGoogleSession();
    }, [session]);

    // Initialize auth from localStorage on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const savedUser = localStorage.getItem("luxury_user");
                const savedToken = localStorage.getItem("luxury_token");

                if (savedUser && savedToken) {
                    setUser(JSON.parse(savedUser));
                    setToken(savedToken);

                    // Verify token is still valid by getting profile
                    try {
                        await getProfile();
                    } catch (error) {
                        // Token expired or invalid
                        localStorage.removeItem("luxury_user");
                        localStorage.removeItem("luxury_token");
                        setUser(null);
                        setToken(null);
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Register
    const register = async (fullName: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authAPI.register({ fullName, email, password });
            return response.data;
        } catch (error: any) {
            const message = typeof error.response?.data === "string"
                ? error.response.data
                : error.response?.data?.message || "Registration failed";
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Login
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authAPI.login({ email, password });
            const data = response.data;

            const userData: User = {
                id: data.id,
                fullName: data.fullName,
                email: data.email,
                role: data.role.toLowerCase(),
            };

            setToken(data.token);
            localStorage.setItem("luxury_token", data.token);

            // Fetch complete profile with avatar
            await getProfile();
        } catch (error: any) {
            const message = typeof error.response?.data === "string"
                ? error.response.data
                : error.response?.data?.message || "Login failed";
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Verify Email
    const verifyEmail = async (email: string, code: string) => {
        setIsLoading(true);
        try {
            const response = await authAPI.verifyEmail({ email, code });
            const data = response.data;

            const userData: User = {
                id: data.id,
                fullName: data.fullName,
                email: data.email,
                role: data.role.toLowerCase(),
            };

            setUser(userData);
            setToken(data.token);
            localStorage.setItem("luxury_user", JSON.stringify(userData));
            localStorage.setItem("luxury_token", data.token);
        } catch (error: any) {
            const message = typeof error.response?.data === "string"
                ? error.response.data
                : error.response?.data?.message || "Verification failed";
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Resend Verification
    const resendVerification = async (email: string) => {
        try {
            await authAPI.resendVerification({ email });
        } catch (error: any) {
            const message = typeof error.response?.data === "string"
                ? error.response.data
                : error.response?.data?.message || "Failed to resend verification";
            throw new Error(message);
        }
    };

    // Google Login
    const googleLogin = async () => {
        // NextAuth Google provider trigger
        await nextAuthSignIn("google", { callbackUrl: "/" });
    };

    // Logout
    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem("luxury_user");
            localStorage.removeItem("luxury_token");
            await nextAuthSignOut({ redirect: false });
        }
    };

    // Forgot Password
    const forgotPassword = async (email: string) => {
        try {
            await authAPI.forgotPassword({ email });
        } catch (error: any) {
            const message = typeof error.response?.data === "string"
                ? error.response.data
                : error.response?.data?.message || "Failed to send reset email";
            throw new Error(message);
        }
    };

    // Reset Password
    const resetPassword = async (
        email: string,
        resetToken: string,
        newPassword: string,
        confirmPassword: string
    ) => {
        try {
            await authAPI.resetPassword({
                email,
                token: resetToken,
                newPassword,
                confirmPassword,
            });
        } catch (error: any) {
            const message = typeof error.response?.data === "string"
                ? error.response.data
                : error.response?.data?.message || "Failed to reset password";
            throw new Error(message);
        }
    };

    // Get Profile
    const getProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            const userData: User = {
                id: response.data.id,
                fullName: response.data.fullName,
                email: response.data.email,
                phone: response.data.phone,
                avatar: response.data.avatar,
                role: response.data.role.toLowerCase(),
                createdAt: response.data.createdAt,
            };
            setUser(userData);
            localStorage.setItem("luxury_user", JSON.stringify(userData));
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to get profile";
            throw new Error(message);
        }
    };

    // Update Profile
    const updateProfile = async (data: {
        fullName?: string;
        phone?: string;
        avatar?: string;
    }) => {
        try {
            const response = await authAPI.updateProfile(data);
            const userData: User = {
                id: response.data.user.id,
                fullName: response.data.user.fullName,
                email: response.data.user.email,
                phone: response.data.user.phone,
                avatar: response.data.user.avatar,
                role: response.data.user.role.toLowerCase(),
                createdAt: response.data.user.createdAt,
            };
            setUser(userData);
            localStorage.setItem("luxury_user", JSON.stringify(userData));
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to update profile";
            throw new Error(message);
        }
    };

    // Change Password
    const changePassword = async (
        currentPassword: string,
        newPassword: string,
        confirmPassword: string
    ) => {
        try {
            await authAPI.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });
        } catch (error: any) {
            const message = typeof error.response?.data === "string"
                ? error.response.data
                : error.response?.data?.message || "Failed to change password";
            throw new Error(message);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === "admin",
        token,
        register,
        login,
        googleLogin,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        getProfile,
        updateProfile,
        changePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
