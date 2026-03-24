import * as React from 'react';

interface WelcomeEmailProps {
  firstName: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  firstName,
}) => (
  <div style={{ fontFamily: 'sans-serif', color: '#0f172a' }}>
    <h1 style={{ fontWeight: 900, textTransform: 'uppercase' }}>Welcome to Sentill Africa, {firstName}!</h1>
    <p>
      Your institutional wealth intelligence dashboard is ready. 
      You can now track your Net Worth, discover Tax-Free Government Bonds, and manage your MMF yields in real-time.
    </p>
    <div style={{ marginTop: '30px' }}>
      <a 
        href="https://sentill.africa/dashboard" 
        style={{ 
          backgroundColor: '#2563eb', 
          color: 'white', 
          padding: '12px 24px', 
          textDecoration: 'none', 
          borderRadius: '8px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        Access Dashboard
      </a>
    </div>
    <p style={{ marginTop: '40px', fontSize: '12px', color: '#64748b' }}>
      Sentill Africa. Institutional oversight for your capital.
    </p>
  </div>
);
