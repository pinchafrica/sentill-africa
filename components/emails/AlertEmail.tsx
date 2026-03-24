import * as React from 'react';

interface AlertEmailProps {
  userName: string;
  alertType: 'yield_change' | 'auction_result' | 'tax_alpha';
  message: string;
}

export const AlertEmail: React.FC<Readonly<AlertEmailProps>> = ({
  userName,
  alertType,
  message
}) => (
  <div style={{ fontFamily: 'sans-serif', color: '#0f172a', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
    <div style={{ padding: '10px 15px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '8px', display: 'inline-block', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      Sentill Oracle Alert: {alertType.replace('_', ' ')}
    </div>
    
    <h2 style={{ marginTop: '20px' }}>Hello {userName},</h2>
    
    <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
      {message}
    </p>
    
    <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
      <a 
        href="https://sentill.africa/dashboard" 
        style={{ 
          color: '#2563eb', 
          textDecoration: 'none', 
          fontWeight: 'bold'
        }}
      >
        → View Full Analytics
      </a>
    </div>
  </div>
);
