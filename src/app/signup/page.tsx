'use client';

import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';

const SignupPage = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {showLogin ? (
        <LoginForm onSwitchToSignup={() => setShowLogin(false)} />
      ) : (
        <SignupForm onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </div>
  );
};

export default SignupPage;