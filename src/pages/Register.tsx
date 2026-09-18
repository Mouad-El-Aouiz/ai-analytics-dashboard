import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../services/authService";

function Register() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await signUp(email, password, fullName);

            setSuccess(
                "Account created successfuly. Please check your email to confirm your account."
            );
        } catch (error) {
            console.error("Registration failed:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                    Create account
                </h1>

                <p className="mb-6 text-sm text-gray-500">
                    Create your account to access the dashboard.
                </p>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Full name
                        </label>

                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) =>
                                setFullName(e.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                            minLength={6}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="font-medium text-gray-900 hover:underline"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Register;