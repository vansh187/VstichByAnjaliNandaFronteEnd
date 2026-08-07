import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import { requestPasswordResetOtp, confirmPasswordReset, updateUserLocation } from "../lib/api";
import { getLandingLocation } from "../lib/locationCapture";
import { CloseIcon, EyeIcon, EyeOffIcon, GoogleIcon } from "./Icons";
import FormField from "./FormField";
import { inputClass } from "../utils/inputClass";

const emailPattern = /^\S+@\S+\.\S+$/;

const emptyFields = {
  first_name: "",
  last_name: "",
  vstitch_user_name: "",
  email: "",
  phone_number: "",
  password: "",
};

function validate(mode, fields) {
  const errors = {};

  if (mode === "signup") {
    if (fields.first_name.trim().length < 1) errors.first_name = "First name is required.";
    if (fields.last_name.trim().length < 1) errors.last_name = "Last name is required.";
    if (!emailPattern.test(fields.email)) errors.email = "Enter a valid email address.";
    if (!fields.phone_number.trim()) {
      errors.phone_number = "Phone number is required.";
    } else if (!/^\+?\d{7,15}$/.test(fields.phone_number.trim())) {
      errors.phone_number = "Enter 7-15 digits, optionally starting with +.";
    }
  }

  if (fields.vstitch_user_name.trim().length < 3) {
    errors.vstitch_user_name = "Username must be at least 3 characters.";
  }

  if (mode === "signup" && fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (mode === "login" && fields.password.length < 1) {
    errors.password = "Password is required.";
  }

  return errors;
}

// Login (either email/password or Google) never has a signup payload to
// carry location in, so it reads whatever the landing-page prompt already
// resolved and, if allowed, updates it against the now-known user id.
// Fire-and-forget — never awaited by callers, so a slow/failed save can't
// delay the post-login redirect.
function applyLandingLocation(token) {
  getLandingLocation().then(({ allowed, location: coords }) => {
    if (!allowed || !coords) return;
    updateUserLocation(coords, token).catch(() => {
      // Best-effort — a failed save here shouldn't surface to the user.
    });
  });
}

export default function AuthCard({ onClose }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login");
  const [fields, setFields] = useState(emptyFields);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  // "forgot" mode has two steps: request a code, then submit it with a new
  // password. Kept as separate state from `fields` above since it's tracking
  // a different thing (an email to send a code to, not signup/login values).
  const [forgotStep, setForgotStep] = useState("request");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleGoogleCredential = useCallback(
    async (idToken) => {
      setGoogleError("");
      setFormError("");
      setGoogleLoading(true);
      try {
        const data = await auth.loginWithGoogle(idToken);
        applyLandingLocation(data.access_token);
        const redirectTo = location.state?.from?.pathname || "/home";
        navigate(redirectTo, { replace: true });
      } catch (err) {
        setGoogleError(
          err.message || "Google sign-in failed. Please try again or use your email.",
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    [auth, location, navigate],
  );

  const { promptSignIn: promptGoogleSignIn } = useGoogleSignIn(handleGoogleCredential);

  const handleGoogleClick = () => {
    setGoogleError("");
    promptGoogleSignIn(() => {
      setGoogleError(
        "Google sign-in isn't available right now. Please continue with your email, or try again in a moment.",
      );
    });
  };

  const update = (field) => (e) => setFields((f) => ({ ...f, [field]: e.target.value }));

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");
    setForgotStep("request");
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const trimmedEmail = resetEmail.trim();
    if (!emailPattern.test(trimmedEmail)) {
      setFieldErrors({ email: "Enter a valid email address." });
      return;
    }

    setFieldErrors({});
    setFormError("");
    setLoading(true);
    try {
      await requestPasswordResetOtp({ email: trimmedEmail });
      setForgotStep("verify");
      setSuccessMessage(`We've sent a 6-digit code to ${trimmedEmail}.`);
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const trimmedEmail = resetEmail.trim();
    setFormError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      await requestPasswordResetOtp({ email: trimmedEmail });
      setSuccessMessage(`We've sent a new code to ${trimmedEmail}.`);
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!/^\d{6}$/.test(otp.trim())) errors.otp = "Enter the 6-digit code from your email.";
    if (newPassword.length < 8) errors.new_password = "Password must be at least 8 characters.";
    if (confirmNewPassword !== newPassword) errors.confirm_password = "Passwords don't match.";
    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await confirmPasswordReset({
        email: resetEmail.trim(),
        otp: otp.trim(),
        new_password: newPassword,
      });
      switchMode("login");
      setSuccessMessage("Password updated! Log in below with your new password.");
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(mode, fields);
    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      if (mode === "signup") {
        const { allowed, location: coords } = await getLandingLocation();
        await auth.signup({
          vstitch_user_name: fields.vstitch_user_name.trim(),
          password: fields.password,
          first_name: fields.first_name.trim(),
          last_name: fields.last_name.trim(),
          email: fields.email.trim().toLowerCase(),
          phone_number: fields.phone_number.trim(),
          location_permission_granted: allowed,
          ...(allowed && coords ? { location: coords } : {}),
        });
        setSuccessMessage("Account created! Log in below to continue.");
        setFields((f) => ({ ...emptyFields, vstitch_user_name: f.vstitch_user_name }));
        setMode("login");
      } else {
        const data = await auth.login(fields.vstitch_user_name.trim(), fields.password);
        applyLandingLocation(data.access_token);
        const redirectTo = location.state?.from?.pathname || "/home";
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-h-[88svh] flex-col border border-sand-dark bg-cream/95 shadow-2xl backdrop-blur-sm">
      {/* Pinned header: title + Log In / Sign Up tabs stay visible while the form below scrolls */}
      <div className="relative shrink-0 border-b border-sand-dark bg-cream px-8 pt-8 sm:px-10 sm:pt-10">
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-4 right-4 text-charcoal/50 transition-colors hover:text-ink sm:top-5 sm:right-5"
          >
            <CloseIcon width="20" height="20" />
          </button>
        )}
        <img
          src="/static/brand/logo.jpg"
          alt="VStitch by Anjali Nanda"
          className="mx-auto h-12 w-12 rounded-full object-cover"
        />
        <p className="mt-3 text-center font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
          Welcome to VStitch
        </p>
        <h1 className="mt-2 text-center font-display text-3xl text-ink">
          {mode === "login" && "Log In to Your Account"}
          {mode === "signup" && "Create Your Account"}
          {mode === "forgot" && "Reset Your Password"}
        </h1>

        {mode !== "forgot" && (
        <div className="mt-7 flex items-center justify-center gap-8">
          {["login", "signup"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`-mb-px border-b-2 pb-3 text-sm font-medium tracking-[0.12em] uppercase transition-colors ${
                mode === m
                  ? "border-gold text-ink"
                  : "border-transparent text-charcoal/50 hover:text-charcoal"
              }`}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>
        )}
      </div>

      <div className="styled-scroll overflow-y-auto px-8 pb-8 pt-6 sm:px-10 sm:pb-10">
        {successMessage && (
          <p className="mb-6 border border-gold-light bg-sand/60 px-4 py-3 text-sm text-ink">
            {successMessage}
          </p>
        )}
        {formError && (
          <p className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        {mode !== "forgot" && (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" error={fieldErrors.first_name} required>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={fields.first_name}
                  onChange={update("first_name")}
                  className={inputClass(fieldErrors.first_name)}
                />
              </FormField>
              <FormField label="Last Name" error={fieldErrors.last_name} required>
                <input
                  type="text"
                  autoComplete="family-name"
                  value={fields.last_name}
                  onChange={update("last_name")}
                  className={inputClass(fieldErrors.last_name)}
                />
              </FormField>
            </div>
          )}

          {mode === "signup" && (
            <FormField label="Email" error={fieldErrors.email} required>
              <input
                type="email"
                autoComplete="email"
                value={fields.email}
                onChange={update("email")}
                className={inputClass(fieldErrors.email)}
              />
            </FormField>
          )}

          {mode === "signup" && (
            <FormField label="Phone Number" error={fieldErrors.phone_number} required>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={fields.phone_number}
                onChange={update("phone_number")}
                className={inputClass(fieldErrors.phone_number)}
              />
            </FormField>
          )}

          <FormField label="Username" error={fieldErrors.vstitch_user_name} required>
            <input
              type="text"
              autoComplete="username"
              value={fields.vstitch_user_name}
              onChange={update("vstitch_user_name")}
              className={inputClass(fieldErrors.vstitch_user_name)}
            />
          </FormField>

          <FormField label="Password" error={fieldErrors.password} required>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={fields.password}
                onChange={update("password")}
                className={`${inputClass(fieldErrors.password)} pr-11`}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-charcoal/60 hover:text-ink"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </FormField>

          {mode === "login" && (
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="-mt-2 self-end text-xs font-medium text-charcoal/60 transition-colors hover:text-ink"
            >
              Forgot password?
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-ink py-3.5 text-sm font-medium tracking-[0.16em] text-cream uppercase transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>
        )}

        {mode === "forgot" && forgotStep === "request" && (
          <form onSubmit={handleRequestOtp} noValidate className="flex flex-col gap-5">
            <p className="text-sm text-charcoal/70">
              Enter the email on your account and we'll send you a 6-digit code to reset your
              password.
            </p>
            <FormField label="Email" error={fieldErrors.email} required>
              <input
                type="email"
                autoComplete="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className={inputClass(fieldErrors.email)}
              />
            </FormField>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-ink py-3.5 text-sm font-medium tracking-[0.16em] text-cream uppercase transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send Code"}
            </button>
          </form>
        )}

        {mode === "forgot" && forgotStep === "verify" && (
          <form onSubmit={handleConfirmReset} noValidate className="flex flex-col gap-5">
            <FormField label="6-Digit Code" error={fieldErrors.otp} required>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass(fieldErrors.otp)} tracking-[0.3em]`}
              />
            </FormField>

            <FormField label="New Password" error={fieldErrors.new_password} required>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${inputClass(fieldErrors.new_password)} pr-11`}
                />
                <button
                  type="button"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-charcoal/60 hover:text-ink"
                >
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </FormField>

            <FormField label="Confirm New Password" error={fieldErrors.confirm_password} required>
              <input
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={inputClass(fieldErrors.confirm_password)}
              />
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-ink py-3.5 text-sm font-medium tracking-[0.16em] text-cream uppercase transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait…" : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="link-underline self-center text-xs font-medium text-charcoal/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              Didn't get a code? Resend
            </button>
          </form>
        )}

        {mode !== "forgot" && (
        <>
        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-sand-dark" />
          <span className="text-xs tracking-widest text-charcoal/50 uppercase">or</span>
          <span className="h-px flex-1 bg-sand-dark" />
        </div>

        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 border border-sand-dark bg-cream py-3.5 text-sm font-medium text-ink transition-colors hover:bg-sand/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          {googleLoading ? "Please wait…" : "Continue with Google"}
        </button>
        {googleError && (
          <p className="mt-3 text-center text-xs text-red-700">{googleError}</p>
        )}
        </>
        )}

        <p className="mt-7 text-center text-sm text-charcoal/70">
          {mode === "login" && (
            <>
              New to VStitch?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="link-underline font-medium text-ink"
              >
                Create an account
              </button>
            </>
          )}
          {mode === "signup" && (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="link-underline font-medium text-ink"
              >
                Log in
              </button>
            </>
          )}
          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="link-underline font-medium text-ink"
            >
              ← Back to Log In
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
