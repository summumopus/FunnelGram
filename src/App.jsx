import React, { useState, useEffect } from 'react';
import { BarChart3, Zap, Settings, PlusCircle, Users, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { TelegramProvider, useTelegramContext } from './context/TelegramContext';
import FunnelList from './components/FunnelList';
import CreateFunnelModal from './components/CreateFunnelModal';
import MetricsCard from './components/MetricsCard';
import TemplateGallery from './components/TemplateGallery';
import { useApi } from './hooks/useApi';

const AppContent = () => {
    const { tg, user } = useTelegramContext();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [funnels, setFunnels] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);

    const { loading, authWithTelegram, getFunnels, createFunnel, deleteFunnel, getTemplates } = useApi();

    useEffect(() => {
        initializeApp();
    }, [tg]);

    const initializeApp = async () => {
        if (tg) {
            // Get init data from Telegram
            const initData = tg.initData || '';

            // Authenticate user
            const authResult = await authWithTelegram(initData);

            if (authResult.success) {
                setCurrentUser(authResult.user);
                // Load user's funnels
                const funnelsResult = await getFunnels(authResult.user.id);
                setFunnels(funnelsResult.funnels || []);
            } else {
                // Demo mode - create a demo user
                setCurrentUser({
                    id: 'demo-user-123',
                    first_name: 'Demo',
                    last_name: 'User',
                    telegram_username: 'demo_user'
                });
            }
        }
    };

    const totalLeads = funnels.reduce((sum, f) => sum + f.leads, 0);
    const totalConversions = funnels.reduce((sum, f) => sum + f.conversions, 0);
    const totalRevenue = funnels.reduce((sum, f) => sum + f.revenue, 0);
    const activeFunnels = funnels.filter(f => f.status === 'published').length;

    const handleCreateFunnel = async (newFunnel) => {
        if (!currentUser) return;

        const result = await createFunnel({
            userId: currentUser.id,
            name: newFunnel.name,
            funnelType: newFunnel.type
        });

        if (result.success) {
            setFunnels(prev => [result.funnel, ...prev]);
            if (tg) tg.showAlert(`Funnel "${newFunnel.name}" created!`);
        }
    };

    const handleDeleteFunnel = async (funnelToDelete) => {
        if (tg) {
            tg.showConfirm(`Delete ${funnelToDelete.name}?`, async (confirmed) => {
                if (confirmed) {
                    const result = await deleteFunnel(funnelToDelete.id);
                    if (result.success) {
                        setFunnels(prev => prev.filter(f => f.id !== funnelToDelete.id));
                    }
                }
            });
        }
    };

    const DashboardView = () => (
        <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--tg-theme-text-color)' }}>Dashboard</h2>
                {currentUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'var(--tg-theme-button-color)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--tg-theme-button-text-color)',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            {currentUser.first_name?.[0] || 'U'}
                        </div>
                    </div>
                )}
            </div>

            <div className="metrics-grid">
                <MetricsCard icon={Users} title="Leads Collected" value={totalLeads} color="blue" />
                <MetricsCard icon={TrendingUp} title="Conversions" value={totalConversions} color="green" />
                <MetricsCard icon={DollarSign} title="Revenue" value={`$${totalRevenue}`} color="purple" />
                <MetricsCard icon={Zap} title="Active Funnels" value={activeFunnels} subtitle={`of ${funnels.length}`} color="orange" />
            </div>

            <div className="metrics-card">
                <h3 style={{ fontWeight: '600', color: 'var(--tg-theme-text-color)', marginBottom: '12px' }}>Your Funnels</h3>
                <FunnelList
                    funnels={funnels}
                    onEdit={(funnel) => tg?.showAlert(`Edit ${funnel.name}`)}
                    onPreview={(funnel) => tg?.showAlert(`Preview ${funnel.name}`)}
                    onClone={(funnel) => tg?.showAlert(`Clone ${funnel.name}`)}
                    onDelete={handleDeleteFunnel}
                />
            </div>
        </div>
    );

    const FunnelsView = () => (
        <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--tg-theme-text-color)' }}>My Funnels</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowTemplates(true)}
                        className="btn-primary"
                    >
                        Use Template
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary"
                    >
                        <PlusCircle size={16} />
                        Create Blank
                    </button>
                </div>
            </div>

            <FunnelList
                funnels={funnels}
                onEdit={(funnel) => tg?.showAlert(`Edit ${funnel.name}`)}
                onPreview={(funnel) => tg?.showAlert(`Preview ${funnel.name}`)}
                onClone={(funnel) => tg?.showAlert(`Clone ${funnel.name}`)}
                onDelete={handleDeleteFunnel}
            />
        </div>
    );

    const SettingsView = () => (
        <div style={{ padding: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--tg-theme-text-color)', marginBottom: '16px' }}>Settings</h2>

            <div className="metrics-card" style={{ marginBottom: '16px' }}>
                <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--tg-theme-border-color)' }}>
                    <h3 style={{ fontWeight: '600', color: 'var(--tg-theme-text-color)' }}>Account</h3>
                </div>
                <div style={{ paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>Plan</span>
                        <span style={{ color: 'var(--tg-theme-button-color)', fontWeight: '500' }}>Free</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>Funnels Used</span>
                        <span style={{ color: 'var(--tg-theme-text-color)' }}>{funnels.length}/3</span>
                    </div>

                    <button
                        onClick={() => tg?.showAlert('Upgrade to Pro - $29/month')}
                        className="btn-primary"
                        style={{ width: '100%' }}
                    >
                        <CreditCard size={16} />
                        Upgrade to Pro
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--tg-theme-secondary-bg-color)', paddingBottom: '80px' }}>
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'funnels' && <FunnelsView />}
            {activeTab === 'settings' && <SettingsView />}

            <CreateFunnelModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onFunnelCreate={handleCreateFunnel}
            />

            {showTemplates && (
                <TemplateGallery
                    onTemplateSelect={handleCreateFunnel}
                    onClose={() => setShowTemplates(false)}
                />
            )}

            {/* Bottom Navigation */}
            <div className="bottom-nav">
                <div className="nav-grid">
                    {[
                        { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
                        { id: 'funnels', icon: Zap, label: 'Funnels' },
                        { id: 'settings', icon: Settings, label: 'Settings' }
                    ].map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`nav-button ${activeTab === id ? 'active' : ''}`}
                        >
                            <Icon size={22} />
                            <span style={{ fontSize: '12px' }}>{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <TelegramProvider>
            <AppContent />
        </TelegramProvider>
    );
};

export default App;