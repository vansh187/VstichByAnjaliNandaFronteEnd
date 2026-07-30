import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import { EyeIcon, EyeOffIcon, GoogleIcon } from "./Icons";
import FormField from "./FormField";
import { inputClass } from "../utils/inputClass";

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
    if (!/^\S+@\S+\.\S+$/.test(fields.email)) errors.email = "Enter a valid email address.";
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

export default function AuthCard() {
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

  const handleGoogleCredential = useCallback(
    async (idToken) => {
      setGoogleError("");
      setFormError("");
      setGoogleLoading(true);
      try {
        await auth.loginWithGoogle(idToken);
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
        await auth.signup({
          vstitch_user_name: fields.vstitch_user_name.trim(),
          password: fields.password,
          first_name: fields.first_name.trim(),
          last_name: fields.last_name.trim(),
          email: fields.email.trim().toLowerCase(),
          phone_number: fields.phone_number.trim(),
        });
        setSuccessMessage("Account created! Log in below to continue.");
        setFields((f) => ({ ...emptyFields, vstitch_user_name: f.vstitch_user_name }));
        setMode("login");
      } else {
        await auth.login(fields.vstitch_user_name.trim(), fields.password);
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
      <div className="shrink-0 border-b border-sand-dark bg-cream px-8 pt-8 sm:px-10 sm:pt-10">
        <p className="text-center font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
          Welcome to VStitch
        </p>
        <h1 className="mt-2 text-center font-display text-3xl text-ink">
          {mode === "login" ? "Log In to Your Account" : "Create Your Account"}
        </h1>

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

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" error={fieldErrors.first_name}>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={fields.first_name}
                  onChange={update("first_name")}
                  className={inputClass(fieldErrors.first_name)}
                />
              </FormField>
              <FormField label="Last Name" error={fieldErrors.last_name}>
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
            <FormField label="Email" error={fieldErrors.email}>
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
            <FormField label="Phone Number" error={fieldErrors.phone_number}>
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

          <FormField label="Username" error={fieldErrors.vstitch_user_name}>
            <input
              type="text"
              autoComplete="username"
              value={fields.vstitch_user_name}
              onChange={update("vstitch_user_name")}
              className={inputClass(fieldErrors.vstitch_user_name)}
            />
          </FormField>

          <FormField label="Password" error={fieldErrors.password}>
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-ink py-3.5 text-sm font-medium tracking-[0.16em] text-cream uppercase transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

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

        <p className="mt-7 text-center text-sm text-charcoal/70">
          {mode === "login" ? (
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
          ) : (
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
        </p>
      </div>
    </div>
  );
}
