import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { mockUsers } from '../data/mockData';
import { UserPlus, Trash2, Mail, Shield } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';

export const UsersPage = () => {
  const [users, setUsers] = useState(mockUsers);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Engineer');
  const { addToast } = useToast();

  const fetchUsers = async () => {
    const data = await apiService.getUsers();
    if (data && data.length > 0) setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    try {
      await apiService.inviteUser(newEmail, newName, "Secret123!", newRole);
      addToast(`User ${newName} added successfully`, 'success');
      setNewName('');
      setNewEmail('');
      setIsAddUserOpen(false);
      fetchUsers();
    } catch (err) {
      addToast(err.message || 'Failed to add user', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to revoke access for this user?")) return;
    await apiService.deleteUser(id);
    addToast('User access revoked', 'info');
    fetchUsers();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
            Administration / Users
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            User Management & RBAC
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Manage organization members, roles, and authorization tokens.
          </p>
        </div>

        <Button variant="primary" icon={UserPlus} onClick={() => setIsAddUserOpen(true)}>
          Add User
        </Button>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>User</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Last Active</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.825rem' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div>
                      <div>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{u.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.725rem', fontFamily: 'monospace', padding: '2px 6px', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Badge status={u.status}>{u.status}</Badge>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                    {u.lastActive}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      aria-label="Revoke user access"
                      title="Revoke user access"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal Dialog */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Invite Team Member">
        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 10px',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                outline: 'none',
                marginTop: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="alex@company.com"
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 10px',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                outline: 'none',
                marginTop: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 10px',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                outline: 'none',
                marginTop: '4px'
              }}
            >
              <option value="Admin">Admin</option>
              <option value="Engineer">Engineer</option>
              <option value="Analyst">Analyst</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Send Invite</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
