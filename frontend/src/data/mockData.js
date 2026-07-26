export const mockMetrics = [
  { label: 'Documents', value: '142', change: '+12 this week', isPositive: true },
  { label: 'Indexed Chunks', value: '3,840', change: '+320 text nodes', isPositive: true },
  { label: 'Queries Today', value: '1,284', change: 'Peak: 140/hr', isPositive: true },
  { label: 'Retrieval Success', value: '99.4%', change: '0.6% guarded', isPositive: true }
];

export const mockSystemHealth = [
  { name: 'Vector Index', status: 'Operational', sub: 'Cosine Index 3.8k nodes' },
  { name: 'Embedding Service', status: 'Operational', sub: 'SentenceTransformer MiniLM' },
  { name: 'LLM Provider', status: 'Operational', sub: 'Gemini 1.5 Flash API' },
  { name: 'Document Processor', status: 'Operational', sub: 'PDF, DOCX, XML, TXT' },
  { name: 'Guardrails', status: 'Operational', sub: 'Similarity Threshold 0.28' }
];

export const mockRecentQueries = [
  { id: 'q1', question: 'How does the authentication flow work?', sources: 2, responseTime: '120ms', timestamp: '5 mins ago' },
  { id: 'q2', question: 'Which service processes uploaded documents?', sources: 3, responseTime: '98ms', timestamp: '18 mins ago' },
  { id: 'q3', question: 'What are the current API rate limits?', sources: 1, responseTime: '145ms', timestamp: '42 mins ago' },
  { id: 'q4', question: 'What encryption standard is used for database vectors?', sources: 2, responseTime: '110ms', timestamp: '1 hour ago' }
];

export const mockGuardrails = [
  { id: 'g1', name: 'Strict Context Similarity Threshold', value: '0.28 Score', description: 'Rejects queries with vector similarity below 0.28 to prevent hallucination.', enabled: true },
  { id: 'g2', name: 'Out-of-Bounds Rejection', value: 'Active', description: 'Forces system to return explicit missing notice if facts are absent.', enabled: true },
  { id: 'g3', name: 'PII & Sensitive Data Redaction', value: 'Active', description: 'Automatically redacts SSN, API keys, and credit card numbers from LLM context.', enabled: true },
  { id: 'g4', name: 'Maximum Retrieval Chunks Limit', value: '4 Chunks', description: 'Caps Top-K retrieval at 4 chunks per query for optimal precision.', enabled: true }
];

export const mockUsers = [
  { id: 'u1', name: 'Akshay Sharma', email: 'akshay@example.com', role: 'Admin', status: 'Active', lastActive: 'Just now' },
  { id: 'u2', name: 'Sarah Jenkins', email: 'sarah@example.com', role: 'Engineer', status: 'Active', lastActive: '12 mins ago' },
  { id: 'u3', name: 'David Chen', email: 'david@example.com', role: 'Analyst', status: 'Active', lastActive: '2 hours ago' },
  { id: 'u4', name: 'Elena Rostova', email: 'elena@example.com', role: 'Viewer', status: 'Inactive', lastActive: '3 days ago' }
];

export const mockActivityLogs = [
  { id: 'a1', event: 'Document Uploaded', details: 'product-requirements.pdf (14 pages, 42 chunks)', user: 'Akshay Sharma', time: '10 mins ago', type: 'document' },
  { id: 'a2', event: 'Guardrail Triggered', details: 'Query "recipe for cake" score 0.14 < 0.28 threshold', user: 'System Guardrail', time: '25 mins ago', type: 'security' },
  { id: 'a3', event: 'API Key Configured', details: 'Google Gemini 1.5 Flash API Key updated', user: 'Akshay Sharma', time: '1 hour ago', type: 'settings' },
  { id: 'a4', event: 'User Login', details: 'OAuth2 Bearer Token issued for sarah@example.com', user: 'Sarah Jenkins', time: '2 hours ago', type: 'auth' }
];
