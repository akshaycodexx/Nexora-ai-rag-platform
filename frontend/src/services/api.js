const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://nexora-ai-rag-platform.onrender.com/api/v1';

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('nexora_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const getErrorMessage = async (res, fallback) => {
  try {
    const err = await res.json();
    return err.detail || err.message || fallback;
  } catch (e) {
    return fallback;
  }
};

const getCurrentUser = () => {
  try {
    const savedUser = localStorage.getItem('nexora_user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    return null;
  }
};

export const apiService = {
  // Dashboard Overview
  async getDashboardOverview() {
    try {
      const userObj = getCurrentUser();
      const ownerParam = userObj ? (userObj.username || userObj.email) : '';
      const isAdmin = String(userObj?.role || '').toLowerCase() === 'admin';
      const url = ownerParam && !isAdmin ? `${API_BASE}/dashboard/overview?owner=${encodeURIComponent(ownerParam)}` : `${API_BASE}/dashboard/overview`;

      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using fallback dashboard data");
    }
    return null;
  },

  // Documents & Collections
  async getDocuments() {
    try {
      const userObj = getCurrentUser();
      const ownerParam = userObj ? (userObj.username || userObj.email) : '';
      const isAdmin = String(userObj?.role || '').toLowerCase() === 'admin';
      const url = ownerParam && !isAdmin ? `${API_BASE}/rag/documents?owner=${encodeURIComponent(ownerParam)}` : `${API_BASE}/rag/documents`;

      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.documents || [];
      }
    } catch (e) {
      console.warn("Could not fetch documents from backend.", e);
    }
    return [];
  },

  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);

    const userObj = getCurrentUser();
    const ownerName = userObj ? (userObj.username || userObj.email) : 'System Admin';

    try {
      const token = localStorage.getItem('nexora_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/rag/upload-document?owner=${encodeURIComponent(ownerName)}`, {
        method: 'POST',
        headers,
        body: formData
      });
      if (res.ok) return await res.json();
      throw new Error(await getErrorMessage(res, 'Upload failed'));
    } catch (e) {
      throw new Error(e.message || 'Could not reach backend upload service');
    }
  },

  async deleteDocument(docId) {
    try {
      const res = await fetch(`${API_BASE}/rag/documents/${docId}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Local delete fallback");
    }
    return { message: "Document deleted" };
  },

  async getCollections() {
    try {
      const savedUser = localStorage.getItem('nexora_user');
      const userObj = savedUser ? JSON.parse(savedUser) : null;
      const ownerParam = userObj ? (userObj.username || userObj.email) : '';
      const url = ownerParam ? `${API_BASE}/rag/collections?owner=${encodeURIComponent(ownerParam)}` : `${API_BASE}/rag/collections`;

      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.collections || [];
      }
    } catch (e) {
      console.warn("Using fallback collections");
    }
    return [];
  },

  // RAG Engine Query
  async queryRAG({ question, top_k = 4, llm_provider = 'gemini', api_key = null, doc_ids = null }) {
    try {
      const res = await fetch(`${API_BASE}/rag/query`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ question, top_k, llm_provider, api_key, doc_ids })
      });
      if (res.ok) return await res.json();
      throw new Error(await getErrorMessage(res, 'RAG query failed'));
    } catch (e) {
      throw new Error(e.message || 'Could not reach backend RAG service');
    }
  },

  // Guardrails
  async getGuardrails() {
    try {
      const res = await fetch(`${API_BASE}/guardrails`, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Fallback guardrails");
    }
    return null;
  },

  async updateGuardrailThreshold(similarity_threshold) {
    try {
      const res = await fetch(`${API_BASE}/guardrails/update`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ similarity_threshold })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Fallback update threshold");
    }
    return { similarity_threshold };
  },

  // User Management
  async getUsers() {
    try {
      const savedUser = localStorage.getItem('nexora_user');
      const userObj = savedUser ? JSON.parse(savedUser) : null;
      const emailParam = userObj ? userObj.email : '';
      const url = emailParam ? `${API_BASE}/users?email=${encodeURIComponent(emailParam)}` : `${API_BASE}/users`;

      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Fallback users");
    }
    return null;
  },

  async inviteUser(email, username, password, role) {
    try {
      const res = await fetch(`${API_BASE}/users/invite`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ email, username, password, role })
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.detail || 'Failed to invite user');
    } catch (e) {
      if (e.message.includes('already registered')) throw e;
      return { id: Date.now(), name: username, email, role, status: 'Active', lastActive: 'Just now' };
    }
  },

  async deleteUser(userId) {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Fallback delete user");
    }
    return { message: "User deleted" };
  },

  // Audit Logs
  async getActivityLogs() {
    try {
      const savedUser = localStorage.getItem('nexora_user');
      const userObj = savedUser ? JSON.parse(savedUser) : null;
      const userParam = userObj ? (userObj.username || userObj.email) : '';
      const url = userParam ? `${API_BASE}/activity/logs?user=${encodeURIComponent(userParam)}` : `${API_BASE}/activity/logs`;

      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Fallback logs");
    }
    return null;
  },

  // Settings
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings`, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Fallback settings");
    }
    return null;
  },

  async updateSettings(settingsData) {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(settingsData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Fallback save settings");
    }
    return { message: "Settings saved" };
  },

  async testLLMConnection({ provider, api_key, model_name, base_url }) {
    try {
      const res = await fetch(`${API_BASE}/settings/test-llm`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ provider, api_key, model_name, base_url })
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      return { success: false, message: err.detail || "Connection test failed." };
    } catch (e) {
      return { success: false, message: e.message || "Failed to reach backend server." };
    }
  },

  async testDBConnection({ db_type, connection_url, host, port, db_name, username, password, api_key }) {
    try {
      const res = await fetch(`${API_BASE}/settings/test-db`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ db_type, connection_url, host, port, db_name, username, password, api_key })
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      return { success: false, message: err.detail || "Database test failed." };
    } catch (e) {
      return { success: false, message: e.message || "Failed to reach backend server." };
    }
  }
};
