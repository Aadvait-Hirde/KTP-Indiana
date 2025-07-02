"use client";

import { useState, useEffect, useRef } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const router = useRouter();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Handle paste: if user pastes 6 digits into any input
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const chars = value.split("").slice(0, 6);
      setVerificationCode(chars);
      // Focus the last input
      inputRefs.current[5]?.focus();
      return;
    }

    // Handle single digit input only
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Move to next input if value entered and not last input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim();
    
    // Check if pasted content is exactly 6 digits
    if (/^\d{6}$/.test(paste)) {
      const chars = paste.split("");
      setVerificationCode(chars);
      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/member-portal");
      } else if (result.status === "missing_requirements") {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setError(""); // Clear any previous errors
        setPendingVerification(true);
      } else {
        setError("Sign up incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const error = err as { errors?: { message: string; code: string }[] };
      const msg = error.errors?.[0]?.message;
      const code = error.errors?.[0]?.code;
      if (code === "form_identifier_exists") {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(msg || "An error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.join(""),
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/member-portal");
      } else {
        setError("The verification code is incorrect. Please check your email and try again.");
      }
    } catch (err: unknown) {
      const error = err as { errors?: { message: string; code?: string }[] };
      const errorMessage = error.errors?.[0]?.message;
      const errorCode = error.errors?.[0]?.code;
      
      // Handle specific error codes
      if (errorCode === "form_code_incorrect" || errorMessage?.toLowerCase().includes("incorrect")) {
        setError("The verification code is incorrect. Please check your email and try again.");
      } else {
        setError(errorMessage || "The verification code is incorrect. Please check your email and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex transition-all duration-300">
      {/* LEFT */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src="/auth-bg.jpg" alt="bg" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-8 left-8 text-white text-sm">
          <Link href="/">← Back to website</Link>
        </div>
        <div className="absolute bottom-16 left-16 text-white">
          <h1 className="text-7xl font-bold leading-tight mb-4">Welcome<br />to the KTP<br />Member Portal</h1>
          <p className="text-lg text-white/80">Your one stop for everything KTP</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col bg-background p-8">
        <div className="flex justify-between items-center pt-2 pb-4">
          <div className="w-9" />
          <Image
            src={mounted && theme === "dark"
              ? "/ktp-logos/KTP Logo Dark Plain No BG.png"
              : "/ktp-logos/KTP Logo Plain Text.png"}
            alt="KTP Logo"
            width={80}
            height={40}
          />
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold">{pendingVerification ? "Verify Your Email" : "Join Now"}</h2>
              <div className="text-muted-foreground text-lg">
                {pendingVerification ? (
                  <div className="space-y-1">
                    <p>{`We sent a verification code to ${email}`}</p>
                    <p className="text-sm">Please check your spam inbox</p>
                  </div>
                ) : (
                  <p>Introducing the KTP portal</p>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Card className="dark:bg-zinc-800 dark:border-zinc-700">
              <CardContent className="pt-6">
                {!pendingVerification ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div id="clerk-captcha" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                      <Input placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                    </div>
                    <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button type="button" className="absolute right-3 top-2" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Account"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerification} className="space-y-6">
                    <label className="text-sm font-medium block">Enter the 6-digit code</label>
                    <div className="flex justify-between gap-2">
                      {verificationCode.map((val, i) => (
                        <Input
                          key={i}
                          ref={(el) => {
                            inputRefs.current[i] = el;
                          }}
                          type="text"
                          maxLength={6}
                          value={val}
                          onChange={(e) => handleDigitChange(i, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(i, e)}
                          onPaste={(e) => handleDigitPaste(i, e)}
                          className="flex-1 h-16 text-center text-xl font-semibold"
                        />
                      ))}
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || verificationCode.join("").length !== 6}
                      className="w-full"
                    >
                      {isLoading ? "Verifying..." : "Verify Email"}
                    </Button>
                    <div className="text-center">
                      <button type="button" onClick={() => setPendingVerification(false)} className="text-sm text-muted-foreground hover:underline">
                        ← Back to sign up
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {!pendingVerification && (
              <div className="text-center text-muted-foreground text-sm">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-medium hover:underline text-foreground">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 