import React, { useState, useEffect } from 'react';
import { BarChart3, Zap, Settings, PlusCircle, Users, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { TelegramProvider, useTelegramContext } from './context/TelegramContext';
import FunnelList from './components/FunnelList';
import CreateFunnelModal from './components/CreateFunnelModal';
import MetricsCard from './components/MetricsCard';
import TemplateGallery from './components/TemplateGallery';
import PaymentProcessor from './components/PaymentProcessor';
import CompleteFunnelBuilder from './components/CompleteFunnelBuilder';
import { Toaster, toast } from 'react-hot-toast';
import { useApi } from './hooks/useApi';

const AppContent = () => {
    const { tg, user, initData } = useTelegramContext();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [funnels, setFunnels] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [editingFunnel, setEditingFunnel] = useState(null);
    const [showPayment, setShowPayment] = useState(false);

    const { loading, authWithTelegram, getFunnels, createFunnel, deleteFunnel, getTemplates, updateFunnel } = useApi();

    useEffect(() => {
        initializeApp();
    }, [tg]);

    const initializeApp = async () => {
        if (tg) {
            const authResult = await authWithTelegram(initData);

            if (authResult.success) {
                setCurrentUser(authResult.user);
                const funnelsResult = await getFunnels(authResult.user.id, initData);
                setFunnels(funnelsResult.funnels || []);

                // Show welcome message
                toast.success(`Welcome ${authResult.user.first_name}! 🎉`, {
                    duration: 4000,
                });
            } else {
                // Demo mode
                setCurrentUser({
                    id: 'demo-user-' + Date.now(),
                    first_name: 'Demo',
                    last_name: 'User',
                    telegram_username: 'demo_user'
                });

                toast('👋 Welcome to FunnelGram! Start building your first funnel.', {
                    duration: 5000,
                });
            }
        }
    };

    const totalLeads = funnels.reduce((sum, f) => sum + (f.leads || 0), 0);
    const totalConversions = funnels.reduce((sum, f) => sum + (f.conversions || 0), 0);
    const totalRevenue = funnels.reduce((sum, f) => sum + (f.revenue || 0), 0);
    const activeFunnels = funnels.filter(f => f.status === 'published').length;

    const handleCreateFunnel = async (newFunnel) => {
        if (!currentUser) {
            toast.error('Please wait while we set up your account...');
            return;
        }

        const result = await createFunnel({
            userId: currentUser.id,
            name: newFunnel.name,
            funnelType: newFunnel.type
        }, initData);

        if (result.success) {
            const createdFunnel = {
                ...result.funnel,
                leads: 0,
                conversions: 0,
                revenue: 0,
                status: 'Draft'
            };

            setFunnels(prev => [createdFunnel, ...prev]);
            setEditingFunnel(createdFunnel); // Auto-open editor

            toast.success(`🎉 Funnel "${newFunnel.name}" created! Let's build it!`, {
                duration: 4000,
            });
        } else {
            toast.error('Failed to create funnel. Please try again.');
        }
    };

    const handleEditFunnel = (funnel) => {
        setEditingFunnel(funnel);
        toast('Opening funnel builder... 🎨', {
            icon: '🚀',
        });
    };


    const handleSaveFunnel = async (funnelData) => {
        // Attempt to persist to server
        try {
            const updates = {
                name: funnelData.name,
                elements: funnelData.elements,
                status: funnelData.status || 'draft'
            };

            const result = await updateFunnel(funnelData.id, updates, initData);
            if (result && result.success && result.funnel) {
                const serverF = result.funnel;
                setFunnels(prev => prev.map(f => f.id === serverF.id ? { ...f, ...serverF } : f));
                toast.success('✅ Funnel saved to server!', { duration: 3000 });
            } else {
                // fallback: update locally
                setFunnels(prev => prev.map(f => f.id === funnelData.id ? { ...f, ...funnelData } : f));
                toast.success('✅ Funnel saved locally (server unavailable)', { duration: 3000 });
            }
        } catch (e) {
            console.error('Save funnel failed:', e);
            setFunnels(prev => prev.map(f => f.id === funnelData.id ? { ...f, ...funnelData } : f));
            toast.error('Failed to save to server; saved locally');
        }

        setEditingFunnel(null);

        if (tg) {
            tg.showAlert('🎉 Funnel saved! You can now share it with your audience.');
        }
    };

    const handleDeleteFunnel = async (funnelToDelete) => {
        if (tg) {
            tg.showConfirm(`Delete "${funnelToDelete.name}"? This cannot be undone.`, async (confirmed) => {
                if (confirmed) {
                    const result = await deleteFunnel(funnelToDelete.id, initData);
                    if (result.success) {
                        setFunnels(prev => prev.filter(f => f.id !== funnelToDelete.id));
                        toast.success('Funnel deleted');
                    }
                }
            });
        } else if (window.confirm(`Delete "${funnelToDelete.name}"?`)) {
            const result = await deleteFunnel(funnelToDelete.id, initData);
            if (result.success) {
                setFunnels(prev => prev.filter(f => f.id !== funnelToDelete.id));
                toast.success('Funnel deleted');
            }
        }
    };

    const handlePaymentSuccess = () => {
        toast.success('🎉 Welcome to FunnelGram Pro! All features unlocked.', {
            duration: 5000,
        });
        setShowPayment(false);
        setCurrentUser(prev => ({ ...prev, subscription_tier: 'pro' }));
    };

    // Show CompleteFunnelBuilder when editing
    if (editingFunnel) {
        return (
            <>
                <CompleteFunnelBuilder
                    funnel={editingFunnel}
                    onSave={handleSaveFunnel}
                    onClose={() => setEditingFunnel(null)}
                    tg={tg}
                />
                <Toaster position="top-center" />
            </>
        );
    }

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
                    onEdit={handleEditFunnel}
                    onPreview={(funnel) => {
                        toast('Preview feature coming soon! 👀');
                        if (tg) tg.showAlert(`Preview: ${funnel.name} (Coming Soon)`);
                    }}
                    onClone={(funnel) => {
                        toast('Clone feature coming soon! 📋');
                        if (tg) tg.showAlert(`Clone: ${funnel.name} (Coming Soon)`);
                    }}
                    onDelete={handleDeleteFunnel}
                />

                {funnels.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                        <h4 style={{ color: 'var(--tg-theme-text-color)', marginBottom: '8px' }}>No funnels yet</h4>
                        <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px', marginBottom: '20px' }}>
                            Create your first funnel to start capturing leads and making sales
                        </p>
                        <button
                            onClick={() => setShowTemplates(true)}
                            className="btn-primary"
                        >
                            <PlusCircle size={16} />
                            Create Your First Funnel
                        </button>
                    </div>
                )}
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
                onEdit={handleEditFunnel}
                onPreview={(funnel) => {
                    toast('Preview feature coming soon! 👀');
                    if (tg) tg.showAlert(`Preview: ${funnel.name} (Coming Soon)`);
                }}
                onClone={(funnel) => {
                    toast('Clone feature coming soon! 📋');
                    if (tg) tg.showAlert(`Clone: ${funnel.name} (Coming Soon)`);
                }}
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
                        <span style={{
                            color: currentUser?.subscription_tier === 'pro' ? '#10B981' : 'var(--tg-theme-button-color)',
                            fontWeight: '500'
                        }}>
                            {currentUser?.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>Funnels Used</span>
                        <span style={{ color: 'var(--tg-theme-text-color)' }}>{funnels.length}/{
                            currentUser?.subscription_tier === 'pro' ? 'Unlimited' : '3'
                        }</span>
                    </div>

                    {currentUser?.subscription_tier !== 'pro' && (
                        <button
                            onClick={() => setShowPayment(true)}
                            className="btn-primary"
                            style={{ width: '100%' }}
                        >
                            <CreditCard size={16} />
                            Upgrade to Pro - $29/month
                        </button>
                    )}
                </div>
            </div>

            <div className="metrics-card">
                <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--tg-theme-border-color)' }}>
                    <h3 style={{ fontWeight: '600', color: 'var(--tg-theme-text-color)' }}>Support</h3>
                </div>
                <div style={{ paddingTop: '16px' }}>
                    <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px', marginBottom: '16px' }}>
                        Need help? Contact us through Telegram or check our documentation.
                    </p>
                    <button
                        onClick={() => {
                            toast('📧 Support: contact@funnelgram.com');
                            if (tg) tg.showAlert('Contact: @FunnelGramSupport on Telegram');
                        }}
                        className="btn-secondary"
                        style={{ width: '100%' }}
                    >
                        Get Help
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--tg-theme-secondary-bg-color)', paddingBottom: '80px' }}>
            <Toaster position="top-center" />

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

            {showPayment && (
                <PaymentProcessor
                    amount={29}
                    funnelId={null}
                    userId={currentUser?.id}
                    onSuccess={handlePaymentSuccess}
                    onClose={() => setShowPayment(false)}
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