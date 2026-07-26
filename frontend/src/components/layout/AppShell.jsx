import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebar } from '../../context/SidebarContext';

export const AppShell = () => {
  const { collapsed } = useSidebar();
  const marginLeft = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--page-bg)' }}>
      <Sidebar />
      <div style={{
        marginLeft: marginLeft,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        transition: 'margin-left var(--transition-normal)'
      }} className="main-wrapper">
        <Header />
        <main style={{
          flex: 1,
          padding: '18px 22px',
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden'
        }} className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
