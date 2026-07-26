import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Database,
  ShieldAlert,
  Users,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Brand } from './Brand';
import { useSidebar } from '../../context/SidebarContext';

export const Sidebar = () => {
  const { collapsed, toggleCollapse, mobileOpen, closeMobile } = useSidebar();

  const navGroups = [
    {
      group: 'Workspace',
      items: [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/ask-ai', label: 'Ask AI', icon: MessageSquare },
        { path: '/documents', label: 'Documents', icon: FileText }
      ]
    },
    {
      group: 'AI & Knowledge',
      items: [
        { path: '/knowledge-base', label: 'Knowledge Base', icon: Database },
        { path: '/guardrails', label: 'Guardrails', icon: ShieldAlert }
      ]
    },
    {
      group: 'Administration',
      items: [
        { path: '/users', label: 'Users', icon: Users },
        { path: '/activity', label: 'Activity', icon: Activity },
        { path: '/settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  const currentWidth = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 49
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: currentWidth,
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transition: 'width var(--transition-normal), transform var(--transition-normal)'
        }}
        className={`sidebar-aside ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Top Header: Brand Logo & Border Floating Collapse Button */}
        <div>
          <div style={{ position: 'relative' }}>
            <div style={{
              height: 'var(--header-height)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '0' : '0 16px',
              borderBottom: '1px solid var(--border)'
            }}>
              <Brand collapsed={collapsed} />
            </div>

            {/* Border Floating Collapse / Expand Trigger Button */}
            <button
              onClick={toggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              style={{
                position: 'absolute',
                top: '50%',
                right: '-10px',
                transform: 'translateY(-50%)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-dropdown)',
                zIndex: 60,
                transition: 'all var(--transition-fast)'
              }}
            >
              {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <nav style={{ padding: '12px 8px' }}>
            {navGroups.map((group, idx) => (
              <div key={idx} style={{ marginBottom: '16px' }}>
                {!collapsed && (
                  <div style={{
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    padding: '6px 12px 4px 12px'
                  }}>
                    {group.group}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {group.items.map(item => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={closeMobile}
                        title={collapsed ? item.label : undefined}
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          height: '36px',
                          padding: collapsed ? '0 14px' : '0 12px',
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          borderRadius: 'var(--radius-sm)',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                          backgroundColor: isActive ? 'var(--primary-tint)' : 'transparent',
                          borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                          transition: 'all var(--transition-fast)',
                          position: 'relative'
                        })}
                      >
                        <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        {!collapsed && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            fontSize: '0.725rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Nexora Platform</span>
            <span>v2.4.0</span>
          </div>
        )}
      </aside>
    </>
  );
};
