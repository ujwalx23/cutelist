
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = 'signup' | 'signin' | 'verifyOtp' | 'createPassword';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authStep, setAuthStep] = useState<AuthStep>('signin');
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithPhone, verifyOTP, signInWithPassword, signUp } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithPassword(phone, password);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      onClose();
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: "Failed to sign in. Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithPhone(phone);
      setAuthStep('verifyOtp');
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the OTP code.",
      });
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: "Failed to start sign up. Please check your phone number and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verifyOTP(phone, otp);
      if (authStep === 'verifyOtp') {
        setAuthStep('createPassword');
        toast({
          title: "Phone verified",
          description: "Please create a password for your account.",
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please check the code and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(phone, password);
      toast({
        title: "Account created!",
        description: "You can now sign in with your phone and password.",
      });
      onClose();
    } catch (error) {
      console.error("Create password error:", error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderAuthForm = () => {
    switch (authStep) {
      case 'signin':
        return (
          <form onSubmit={handleSignIn} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="Phone Number (e.g. +12345678900)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-center">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setAuthStep('signup');
                  setPhone("");
                  setPassword("");
                }}
              >
                Don't have an account? Sign up
              </Button>
            </div>
          </form>
        );
      
      case 'signup':
        return (
          <form onSubmit={handleSignUp} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="Phone Number (e.g. +12345678900)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending verification..." : "Send verification code"}
            </Button>
            <div className="text-center">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setAuthStep('signin');
                  setPhone("");
                }}
              >
                Already have an account? Sign in
              </Button>
            </div>
          </form>
        );
      
      case 'verifyOtp':
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-6 mt-4">
            <div className="space-y-2">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Please enter the verification code sent to {phone}
                </p>
              </div>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
            <div className="text-center">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setAuthStep('signup');
                  setOtp("");
                }}
              >
                Didn't receive a code? Try again
              </Button>
            </div>
          </form>
        );
      
      case 'createPassword':
        return (
          <form onSubmit={handleCreatePassword} className="space-y-4 mt-4">
            <div className="text-center mb-2">
              <p className="text-sm text-muted-foreground">
                Please create a password for your account
              </p>
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {authStep === 'signin' ? "Sign in to your account" : 
             authStep === 'signup' ? "Create an account" :
             authStep === 'verifyOtp' ? "Verify your phone" :
             "Create a password"}
          </DialogTitle>
          <DialogDescription>
            {authStep === 'signin' ? "Enter your phone number and password to sign in" :
             authStep === 'signup' ? "Enter your phone number to get started" :
             authStep === 'verifyOtp' ? "We've sent a verification code to your phone" :
             "Choose a secure password to protect your account"}
          </DialogDescription>
        </DialogHeader>
        {renderAuthForm()}
      </DialogContent>
    </Dialog>
  );
}
