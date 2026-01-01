import { useState, useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";
import api from "../api/client";
import BubblingLogo from "../components/BubblingLogo";
import AuthBackground from "../components/AuthBackground";

export default function Register({ onRegistered }) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: "" });
  const [contactType, setContactType] = useState("email"); // "email" or "phone"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const usernameCheckTimeout = useRef(null);

  const securityQuestions = [
    "Which word you can't forget?",
    "Where do you like to live?",
    "What was the name of your first pet?",
    "What is your favorite book?",
    "What city were you born in?",
    "What is your favorite food?",
    "What was your childhood nickname?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "What is your favorite movie?"
  ];

  const [securityQuestionsData, setSecurityQuestionsData] = useState([
    { question: securityQuestions[0], answer: "" }
  ]);
  const [error, setError] = useState("");

  // Validate phone number format
  const validatePhoneFormat = (phoneNumber) => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return { valid: false, message: "Phone number must be between 10 and 15 digits" };
    }
    return { valid: true, normalized: digitsOnly };
  };

  // Validate email format
  const validateEmailFormat = (emailAddress) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return { valid: false, message: "Invalid email format" };
    }
    return { valid: true };
  };

  // Validate username format
  const validateUsernameFormat = (username) => {
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      return { valid: false, message: "Username must be at least 2 characters long" };
    }
    if (trimmed.length > 30) {
      return { valid: false, message: "Username must be 30 characters or less" };
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
      return { valid: false, message: "Username can only contain letters, numbers, spaces, hyphens, and underscores" };
    }
    return { valid: true };
  };

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameStatus({ checking: false, available: null, message: "" });
      return;
    }

    const formatValidation = validateUsernameFormat(trimmed);
    if (!formatValidation.valid) {
      setUsernameStatus({ checking: false, available: false, message: formatValidation.message });
      return;
    }

    setUsernameStatus({ checking: true, available: null, message: "Checking availability..." });

    try {
      const response = await api.get(`/api/users/check-username?username=${encodeURIComponent(trimmed)}`);
      setUsernameStatus({
        checking: false,
        available: response.data.available,
        message: response.data.message
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error checking username";
      setUsernameStatus({
        checking: false,
        available: false,
        message: errorMsg
      });
    }
  };

  // Handle username change with debounce
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);

    // Clear previous timeout
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }

    // Reset status if empty
    if (!newName.trim()) {
      setUsernameStatus({ checking: false, available: null, message: "" });
      return;
    }

    // Validate format first
    const formatValidation = validateUsernameFormat(newName);
    if (!formatValidation.valid) {
      setUsernameStatus({ checking: false, available: false, message: formatValidation.message });
      return;
    }

    // Debounce the API call (wait 500ms after user stops typing)
    usernameCheckTimeout.current = setTimeout(() => {
      checkUsernameAvailability(newName);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
    };
  }, []);

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    const feedback = [];
    let score = 0;

    if (pwd.length >= 8) {
      score++;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[A-Z]/.test(pwd)) {
      score++;
    } else {
      feedback.push("One uppercase letter");
    }

    if (/[a-z]/.test(pwd)) {
      score++;
    } else {
      feedback.push("One lowercase letter");
    }

    if (/\d/.test(pwd)) {
      score++;
    } else {
      feedback.push("One number");
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      score++;
    } else {
      feedback.push("One special character");
    }

    return { score, feedback };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      setPasswordStrength(checkPasswordStrength(newPassword));
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  };

  const addSecurityQuestion = () => {
    if (securityQuestionsData.length >= 10) {
      setError("Maximum 10 security questions allowed");
      return;
    }
    const availableQuestions = securityQuestions.filter(
      q => !securityQuestionsData.some(sq => sq.question === q)
    );
    if (availableQuestions.length === 0) {
      setError("No more questions available");
      return;
    }
    setSecurityQuestionsData([
      ...securityQuestionsData,
      { question: availableQuestions[0], answer: "" }
    ]);
    setError("");
  };

  const removeSecurityQuestion = (index) => {
    if (securityQuestionsData.length <= 3) {
      setError("At least 3 security questions are required");
      return;
    }
    setSecurityQuestionsData(securityQuestionsData.filter((_, i) => i !== index));
    setError("");
  };

  const updateSecurityQuestion = (index, field, value) => {
    const updated = [...securityQuestionsData];
    updated[index] = { ...updated[index], [field]: value };
    setSecurityQuestionsData(updated);
    setError("");
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score === 0) return "#ccc";
    if (passwordStrength.score <= 2) return "#f44336"; // Red
    if (passwordStrength.score <= 3) return "#ff9800"; // Orange
    if (passwordStrength.score <= 4) return "#ffc107"; // Yellow
    return "#4caf50"; // Green
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score === 0) return "";
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score <= 3) return "Fair";
    if (passwordStrength.score <= 4) return "Good";
    return "Strong";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate username
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Username is required.");
      return;
    }

    const formatValidation = validateUsernameFormat(trimmedName);
    if (!formatValidation.valid) {
      setError(formatValidation.message);
      return;
    }

    // Check if username is available (if not already checked or status is unavailable)
    if (usernameStatus.available === false && !usernameStatus.checking) {
      setError("Please choose a different username.");
      return;
    }

    // Validate contact (email or phone)
    if (contactType === "email") {
      if (!email.trim()) {
        setError("Email is required.");
        return;
      }
      const emailValidation = validateEmailFormat(email.trim());
      if (!emailValidation.valid) {
        setError(emailValidation.message);
        return;
      }
    } else if (contactType === "phone") {
      if (!phone.trim()) {
        setError("Phone number is required.");
        return;
      }
      const phoneValidation = validatePhoneFormat(phone.trim());
      if (!phoneValidation.valid) {
        setError(phoneValidation.message);
        return;
      }
    }

    // Validate password strength
    if (passwordStrength.score < 5) {
      setError("Password does not meet strength requirements. Please check the requirements below.");
      return;
    }

    // Validate security questions
    if (securityQuestionsData.length < 3) {
      setError("Please answer at least 3 security questions.");
      return;
    }

    // Validate all security questions have answers
    const incompleteQuestions = securityQuestionsData.filter(sq => !sq.answer.trim());
    if (incompleteQuestions.length > 0) {
      setError("Please answer all security questions.");
      return;
    }

    // Check for duplicate questions
    const questionSet = new Set(securityQuestionsData.map(sq => sq.question));
    if (questionSet.size !== securityQuestionsData.length) {
      setError("Each security question must be unique.");
      return;
    }

    try {
      const signupData = { 
        name: trimmedName, 
        password, 
        securityQuestions: securityQuestionsData.map(sq => ({
          question: sq.question,
          answer: sq.answer.trim()
        }))
      };

      if (contactType === "email") {
        signupData.email = email.trim().toLowerCase();
      } else {
        const phoneValidation = validatePhoneFormat(phone.trim());
        signupData.phone = phoneValidation.normalized;
      }

      await signup(signupData);
    onRegistered();
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || "Registration failed. Please try again.";
      setError(errorMsg);
      // If it's a username error, update the status
      if (errorMsg.includes("username") || errorMsg.includes("name")) {
        setUsernameStatus({ checking: false, available: false, message: errorMsg });
      }
    }
  };

  return (
    <AuthBackground>
    <div className="auth-container">
        <BubblingLogo />
        <h2 style={{ textAlign: "center", marginTop: 0 }}>Create an account</h2>
      <form onSubmit={submit}>
        <div style={{ width: "100%" }}>
          <input 
            placeholder="Username (must be unique)" 
            value={name} 
            onChange={handleNameChange}
            required
            style={{ marginBottom: 4 }}
          />
          {name && (
            <div style={{ marginBottom: 12, fontSize: 12 }}>
              {usernameStatus.checking && (
                <div style={{ color: "#2196f3" }}>Checking availability...</div>
              )}
              {!usernameStatus.checking && usernameStatus.available === true && (
                <div style={{ color: "#4caf50", display: "flex", alignItems: "center", gap: 4 }}>
                  <span>✓</span>
                  <span>{usernameStatus.message || "Username is available"}</span>
                </div>
              )}
              {!usernameStatus.checking && usernameStatus.available === false && (
                <div style={{ color: "#f44336" }}>{usernameStatus.message}</div>
              )}
              {!usernameStatus.checking && usernameStatus.available === null && name.trim() && (
                <div style={{ color: "#666" }}>
                  Username must be 2-30 characters, letters, numbers, spaces, hyphens, and underscores only
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Contact type selector */}
        <div style={{ width: "100%", marginBottom: 8 }}>
          <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>Sign up with:</label>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                setContactType("email");
                setPhone("");
              }}
              style={{
                flex: 1,
                padding: "8px 16px",
                background: contactType === "email" ? "#2196f3" : "#f5f5f5",
                color: contactType === "email" ? "white" : "#333",
                border: "1px solid #ddd",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: contactType === "email" ? 600 : 400
              }}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setContactType("phone");
                setEmail("");
              }}
              style={{
                flex: 1,
                padding: "8px 16px",
                background: contactType === "phone" ? "#2196f3" : "#f5f5f5",
                color: contactType === "phone" ? "white" : "#333",
                border: "1px solid #ddd",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: contactType === "phone" ? 600 : 400
              }}
            >
              Phone Number
            </button>
          </div>
        </div>

        {/* Email or Phone input */}
        {contactType === "email" ? (
          <input 
            placeholder="Email address" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        ) : (
          <input 
            placeholder="Phone number (e.g., +1234567890)" 
            type="tel"
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            required
          />
        )}
        
        <div style={{ width: "100%" }}>
          <input 
            placeholder="Password" 
            type="password" 
            value={password} 
            onChange={handlePasswordChange}
            required
            style={{ marginBottom: 4 }}
          />
          {password && (
            <div style={{ marginBottom: 12, fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ 
                  flex: 1, 
                  height: 4, 
                  background: "#e0e0e0", 
                  borderRadius: 2,
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    height: "100%",
                    background: getPasswordStrengthColor(),
                    transition: "all 0.3s"
                  }} />
                </div>
                <span style={{ 
                  color: getPasswordStrengthColor(), 
                  fontWeight: 600,
                  minWidth: 50,
                  textAlign: "right"
                }}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              {passwordStrength.feedback.length > 0 && (
                <div style={{ color: "#666", fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Requirements:</div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {passwordStrength.feedback.map((req, idx) => (
                      <li key={idx} style={{ color: "#f44336" }}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ width: "100%", marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontWeight: 500 }}>Security Questions (Minimum 3)</label>
            <button
              type="button"
              onClick={addSecurityQuestion}
              style={{
                padding: "4px 12px",
                fontSize: 12,
                background: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              + Add Question
            </button>
          </div>
          
          {securityQuestionsData.map((sq, index) => (
            <div key={index} style={{ marginBottom: 12, padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Question {index + 1}</span>
                {securityQuestionsData.length > 3 && (
                  <button
                    type="button"
                    onClick={() => removeSecurityQuestion(index)}
                    style={{
                      padding: "2px 8px",
                      fontSize: 11,
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <select
                value={sq.question}
                onChange={(e) => updateSecurityQuestion(index, "question", e.target.value)}
                style={{ width: "100%", marginBottom: 8, padding: 8 }}
              >
                {securityQuestions.map(q => {
                  // Show the current question or questions not used in other fields
                  const isUsedElsewhere = securityQuestionsData.some((otherSq, otherIdx) => 
                    otherIdx !== index && otherSq.question === q
                  );
                  return (
                    <option key={q} value={q} disabled={isUsedElsewhere && sq.question !== q}>
                      {q} {isUsedElsewhere && sq.question !== q ? "(already selected)" : ""}
                    </option>
                  );
                })}
        </select>
              <input
                placeholder="Your answer"
                value={sq.answer}
                onChange={(e) => updateSecurityQuestion(index, "answer", e.target.value)}
                style={{ width: "100%", padding: 8 }}
                required
              />
            </div>
          ))}
        </div>

        {error && (
          <div style={{ color: "#d32f2f", fontSize: 13, marginTop: 6, textAlign: "center" }}>
            {error}
          </div>
        )}
        
        <button 
          type="submit"
          className="auth-button-hope"
          disabled={passwordStrength.score < 5 || securityQuestionsData.length < 3}
          style={{
            opacity: (passwordStrength.score < 5 || securityQuestionsData.length < 3) ? 0.6 : 1,
            cursor: (passwordStrength.score < 5 || securityQuestionsData.length < 3) ? "not-allowed" : "pointer"
          }}
        >
          Register
        </button>
      </form>
    </div>
    </AuthBackground>
  );
}
