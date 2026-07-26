import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Database, Layers, Cpu, Clock, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

export const KnowledgeBasePage = () => {
  const [collections, setCollections] = React.useState([]);

  React.useEffect(() => {
    const fetchCollections = async () => {
      const data = await apiService.getCollections();
      setCollections(data);
    };
    fetchCollections();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
          AI & Knowledge / Knowledge Base
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Knowledge Base Collections
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Inspect indexed collections, vector embedding models, and chunk allocations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {collections.map(col => (
          <Card key={col.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Database size={18} style={{ color: 'var(--primary)' }} />
                <span>{col.name}</span>
              </div>
              <Badge status={col.status}>{col.status}</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
              <div style={{ padding: '8px', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Documents</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{col.docs}</div>
              </div>
              <div style={{ padding: '8px', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Vector Chunks</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{col.chunks}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={13} />
                <span>Model: {col.model}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} />
                <span>Last Indexed: {col.updated}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
