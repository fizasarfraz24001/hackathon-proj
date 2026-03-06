'use client';

import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';

const LoginPage = () => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {showSignup ? (
        <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
      ) : (
        <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
      )}
    </div>
  );
};

export default LoginPage;