// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <Header />
      {<Outlet /> }
      <main className="container content-main">
        {children}
      </main>
      {/* Footer Placeholder */}
      <footer style={{ backgroundColor: '#1f2937', textAlign: 'center', padding: '1rem', marginTop: 'auto', color: 'var(--color-text-secondary)' }}>
        &copy; {new Date().getFullYear()} PTC-SMS. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;