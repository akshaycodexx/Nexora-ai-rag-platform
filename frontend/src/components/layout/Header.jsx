import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Sun, Moon, Bell, LogOut, FileText, LayoutDashboard, MessageSquare, Database, ShieldCheck, Users, Activity, Settings, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { toggleMobile } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);

  const userName = user?.username || 'Akshay Sharma';
  const userRole = user?.role || 'Admin';
  const userInitials = userName.substring(0, 2).toUpperCase();

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      apiService.getDocuments().then(docs => setDocuments(docs || []));
    }
  }, [isSearchOpen]);

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Ask AI Workspace', path: '/ask-ai', icon: MessageSquare },
    { label: 'Documents Repository', path: '/documents', icon: FileText },
    { label: 'Knowledge Base Collections', path: '/knowledge-base', icon: Database },
    { label: 'Guardrail Policies', path: '/guardrails', icon: ShieldCheck },
    { label: 'User Management', path: '/users', icon: Users },
    { label: 'Audit Activity Timeline', path: '/activity', icon: Activity },
    { label: 'Platform Settings', path: '/settings', icon: Settings }
  ];

  const filteredNav = navItems.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDocs = documents.filter(d => d.filename.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectRoute = (path) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 18px',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      zIndex: 40
    }}>
      {/* Left: Mobile Toggle & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '440px' }}>
        <button
          onClick={toggleMobile}
          aria-label="Toggle mobile menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px'
          }}
          className="mobile-trigger"
        >
          <Menu size={20} />
        </button>

        {/* Command Search Trigger Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          style={{
            width: '100%',
            height: '34px',
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            paddingLeft: '34px',
            paddingRight: '48px',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
            textAlign: 'left',
            position: 'relative',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <span>Search or jump to...</span>
          <span style={{
            position: 'absolute',
            right: '8px',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '2px 5px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            ⌘K
          </span>
        </button>
      </div>

      {/* Right Actions: Status Indicator, Bell, SINGLE Theme Toggle, User Avatar & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* System Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border)',
            padding: '0.28rem 0.65rem',
          borderRadius: '20px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)'
          }} />
          <span>Operational</span>
        </div>

        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <Bell size={16} />
          <span style={{
            position: 'absolute',
            top: '7px',
            right: '7px',
            width: '6px',
            height: '6px',
            backgroundColor: 'var(--primary)',
            borderRadius: '50%'
          }} />
        </button>

        {/* SINGLE Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle light/dark theme"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* User Profile & Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '10px',
          borderLeft: '1px solid var(--border)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-tint)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary)'
          }}>
            {userInitials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {userName}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {userRole}
            </span>
          </div>

          <button
            onClick={logout}
            aria-label="Logout"
            title="Sign out of account"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              marginLeft: '4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>

      </div>

      {/* Global Command Search Modal (Ctrl + K) */}
      {isSearchOpen && (
        <div
          onClick={() => setIsSearchOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '80px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-dropdown)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'relative', borderBottom: '1px solid var(--border)' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Search pages or documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  paddingLeft: '48px',
                  paddingRight: '40px',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Pages */}
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Navigation Pages
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredNav.map(n => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.path}
                        onClick={() => handleSelectRoute(n.path)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          backgroundColor: 'var(--surface-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <Icon size={16} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 600 }}>{n.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Indexed Documents */}
              {filteredDocs.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Indexed Documents
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {filteredDocs.map(d => (
                      <div
                        key={d.doc_id}
                        onClick={() => handleSelectRoute('/documents')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          backgroundColor: 'var(--surface-secondary)',
                          fontSize: '0.825rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={15} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.filename}</span>
                        </div>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{d.chunk_count} chunks</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
