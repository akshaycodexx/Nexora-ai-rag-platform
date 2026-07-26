import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/dashboard/MetricCard';
import { QueryActivityChart } from '../components/dashboard/QueryActivityChart';
import { SystemHealth } from '../components/dashboard/SystemHealth';
import { RecentDocumentsTable } from '../components/dashboard/RecentDocumentsTable';
import { RecentQueriesList } from '../components/dashboard/RecentQueriesList';
import { UsageSection } from '../components/dashboard/UsageSection';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { apiService } from '../services/api';
import { FileText, Database, Activity, ShieldCheck } from 'lucide-react';

export const OverviewPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchOverview = async () => {
    const overview = await apiService.getDashboardOverview();
    if (overview) setDashboardData(overview);
    const docs = await apiService.getDocuments();
    setDocuments(docs);
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleDelete = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    await apiService.deleteDocument(docId);
    fetchOverview();
  };

  const icons = [FileText, Database, Activity, ShieldCheck];

  // Dynamic Metrics or Default fallback
  const displayMetrics = dashboardData?.metrics || [
    { label: "Documents", value: "0", change: "0 files indexed", isPositive: true },
    { label: "Indexed Chunks", value: "0", change: "0 text nodes", isPositive: true },
    { label: "Queries Today", value: "0", change: "0 requests", isPositive: true },
    { label: "Retrieval Success", value: "100%", change: "0 guarded", isPositive: true }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Content Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
            Workspace / Overview
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Overview
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Monitor your knowledge base and RAG activity.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="secondary" icon={MessageSquare} onClick={() => navigate('/ask-ai')}>
            Ask a question
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsUploadOpen(true)}>
            Upload document
          </Button>
        </div>
      </div>

      {/* 4 Compact Metric Cards (100% Dynamic from API) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
        {displayMetrics.map((m, i) => (
          <MetricCard
            key={i}
            label={m.label}
            value={m.value}
            change={m.change}
            isPositive={m.isPositive}
            icon={icons[i]}
          />
        ))}
      </div>

      {/* Main Grid: Left (~65%) Query Activity Chart & Right (~35%) System Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '12px' }} className="overview-main-grid">
        <QueryActivityChart
          chartData7d={dashboardData?.chart_data_7d}
          chartData30d={dashboardData?.chart_data_30d}
          successfulCount={dashboardData?.successful_retrievals || 0}
          guardedCount={dashboardData?.guarded_queries || 0}
          successRate={dashboardData?.success_rate || 100}
        />
        <SystemHealth systemHealth={dashboardData?.system_health} />
      </div>

      {/* Next Row: Left Recent Documents & Right Recent Queries */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '12px' }} className="overview-sub-grid">
        <RecentDocumentsTable documents={documents} onDelete={handleDelete} />
        <RecentQueriesList queries={dashboardData?.recent_queries} />
      </div>

      {/* Bottom Usage Section (100% Dynamic) */}
      <UsageSection usage={dashboardData?.usage} />

      {/* Compact Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchOverview}
      />

    </div>
  );
};
