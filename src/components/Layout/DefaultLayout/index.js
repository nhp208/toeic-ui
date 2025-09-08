import Header from './Header';
import Sidebar from './Sidebar';
import React from 'react';

function DefaultLayout({ children }) {
    return (
        <div>
            <Header />
            <Sidebar />
            <div style={{
                marginLeft: '280px', // Để tránh bị Sidebar che
                padding: '20px',
                minHeight: 'calc(100vh - 60px)', // Trừ chiều cao Header
                background: '#f8f9fa'
            }}>
                {children}
            </div>
        </div>
    );
}

export default DefaultLayout;
