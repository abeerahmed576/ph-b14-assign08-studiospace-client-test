"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { showToast } from "@/components/ui/toast";
import { Eye, EyeOff, Lock, Mail, User, Image as ImageIcon, Loader2 } from "lucide-react";

function GoogleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    imageUrl?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Client-side validations without zod or react useForm
  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      imageUrl?: string;
      password?: string;
    } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = "Full name is required.";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    const trimmedImage = imageUrl.trim();
    if (trimmedImage) {
      try {
        const url = new URL(trimmedImage);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          newErrors.imageUrl = "Image URL must start with http:// or https://";
        }
      } catch {
        newErrors.imageUrl = "Please enter a valid URL.";
      }
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    } else if (!/[A-Z]/.test(password) && !/[a-z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase and one lowercase letter.";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Password must contain at least one lowercase letter.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast.error("Validation error", "Please correct the errors in the form.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: imageUrl.trim() || undefined,
        callbackURL: "/",
      });

      if (error) {
        showToast.error(
          "Registration failed",
          error.message || "Failed to create account. Please try again."
        );
        setIsLoading(false);
        return;
      }

      if (data) {
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      showToast.error("Registration failed", errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      // Successful or failed registration with google should not show any toast
    } catch {
      // Intentionally silent per specs
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      {/* Heading */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground">
          Create Your <span className="text-accent italic">Account</span>
        </h1>
        <p className="text-sm text-muted-foreground font-sans">
          Join StudioSpace as a creator or creative studio host
        </p>
      </div>

      {/* Card Form */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 text-left space-y-5">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="size-4" />
              </span>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Alex Vance"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.name
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : "border-border"
                  }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive mt-1 font-sans">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="size-4" />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.email
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : "border-border"
                  }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1 font-sans">
                {errors.email}
              </p>
            )}
          </div>

          {/* Image URL Field */}
          <div>
            <label
              htmlFor="imageUrl"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              Profile Photo URL <span className="text-muted-foreground">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <ImageIcon className="size-4" />
              </span>
              <input
                id="imageUrl"
                type="url"
                autoComplete="photo"
                placeholder="https://example.com/photo.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (errors.imageUrl) {
                    setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                  }
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.imageUrl
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : "border-border"
                  }`}
              />
            </div>
            {errors.imageUrl && (
              <p className="text-xs text-destructive mt-1 font-sans">
                {errors.imageUrl}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="size-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.password
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : "border-border"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1 font-sans">
                {errors.password}
              </p>
            )}
          </div>

          {/* Register Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 active:scale-[0.99] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Or Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground font-medium">
              Or
            </span>
          </div>
        </div>

        {/* Register with Google Button */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={isLoading || isGoogleLoading}
          className="w-full py-2.5 px-4 rounded-lg border border-border bg-background hover:bg-secondary text-foreground font-medium text-sm transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <GoogleIcon className="size-4" />
          )}
          <span>Register with Google</span>
        </button>
      </div>

      {/* Switch to Login Link */}
      <p className="text-center text-xs text-muted-foreground mt-6 font-sans">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-accent underline hover:opacity-80 font-medium transition-opacity"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
