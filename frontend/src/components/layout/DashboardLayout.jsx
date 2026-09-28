import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

const PAGE_DETAILS = {
  '/app/dashboard': {
    title: 'Overview',
    subtitle: 'Your credit risk assessment overview.',
  },
  '/app/new-assessment': {
    title: 'New Assessment',
    subtitle: 'Evaluate a new credit application.',
  },
  '/app/history': {
    title: 'Assessment History',
    subtitle: 'Review your previous credit assessments.',
  },
  '/app/model-insights': {
    title: 'Model Insights',
    subtitle: 'Explore global feature importance.',
  },
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const page = PAGE_DETAILS[location.pathname] || {
    title: 'Assessment Details',
    subtitle: 'Review the selected assessment.',
  };

  return (
    <div className="dashboard-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <Topbar
          title={page.title}
          subtitle={page.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}