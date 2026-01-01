import { useState } from "react";
import useAuth from "../hooks/useAuth";
import BubblingLogo from "../components/BubblingLogo";
import AuthBackground from "../components/AuthBackground";

export default function Login({ onLoggedIn }) {
  const { signin } = useAuth();
  const [identifier, setIdentifier] = useState(""); // Can be email or phone
  const [password, setPassword] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState("");
  const [showSecurityQ, setShowSecurityQ] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showEmailOTP, setShowEmailOTP] = useState(false);
  const [emailOTP, setEmailOTP] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    // First step: normal login (identifier can be email or phone)
    const result = await signin({ identifier, password });
    if (result?.requireSecurityQ) {
      setSecurityQuestion(result.securityQuestion);
      setShowSecurityQ(true);
      return;
    }
    if (result?.requireEmailOTP) {
      setShowEmailOTP(true);
      // Optionally trigger backend to send OTP here
      return;
    }
    if (result?.require2FA) {
      setShow2FA(true);
      return;
    }
    if (result?.error) {
      setError(result.error);
      return;
    }
    onLoggedIn();
  };

  const submit2FA = async (e) => {
    e.preventDefault();
    setError("");
    // Second step: verify 2FA code
    const result = await signin({ identifier, password, twoFACode });
    if (result?.error) {
      setError(result.error);
      return;
    }
    onLoggedIn();
  };

  const submitSecurityQ = async (e) => {
    e.preventDefault();
    setError("");
    // Second step: verify security answer
    const result = await signin({ identifier, password, securityAnswer });
    if (result?.error) {
      setError(result.error);
      return;
    }
    onLoggedIn();
  };

  const submitEmailOTP = async (e) => {
    e.preventDefault();
    setError("");
    // Third step: verify email OTP
    const result = await signin({ identifier, password, emailOTP });
    if (result?.error) {
      setError(result.error);
      return;
    }
    onLoggedIn();
  };

  return (
    <AuthBackground>
      <div className="auth-container">
        <BubblingLogo />
        <h2 style={{ textAlign: "center", marginTop: 0 }}>Login to ussCHATs</h2>
        <form onSubmit={show2FA ? submit2FA : showSecurityQ ? submitSecurityQ : showEmailOTP ? submitEmailOTP : submit}>
        <input 
          placeholder="Email or Phone Number" 
          value={identifier} 
          onChange={(e) => setIdentifier(e.target.value)} 
          required
        />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {showSecurityQ && (
          <>
            <label style={{ marginTop: 12, fontWeight: 500 }}>{securityQuestion}</label>
            <input placeholder="Your answer" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} />
          </>
        )}
        {showEmailOTP && (
          <>
            <label style={{ marginTop: 12, fontWeight: 500 }}>Enter the OTP sent to your email</label>
            <input placeholder="Email OTP" value={emailOTP} onChange={e => setEmailOTP(e.target.value)} maxLength={6} style={{ letterSpacing: 4 }} />
          </>
        )}
        {show2FA && (
          <input placeholder="2FA Code" value={twoFACode} onChange={e => setTwoFACode(e.target.value)} maxLength={6} style={{ letterSpacing: 4 }} />
        )}
        {error && <div style={{ color: "#d32f2f", fontSize: 13, marginTop: 6 }}>{error}</div>}
        <button className="auth-button-hope">{show2FA || showSecurityQ || showEmailOTP ? "Verify & Login" : "Login"}</button>
      </form>
    </div>
    </AuthBackground>
  );
}
