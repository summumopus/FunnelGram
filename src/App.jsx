// ... (keep all the previous imports)
import FunnelEditor from './components/FunnelEditor';
import TemplateGallery from './components/TemplateGallery';
import PaymentProcessor from './components/PaymentProcessor';

const AppContent = () => {
    const { tg, user } = useTelegramContext();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [funnels, setFunnels] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [editingFunnel, setEditingFunnel] = useState(null);
    const [showPayment, setShowPayment] = useState(false);

    const { loading, authWithTelegram, getFunnels, createFunnel, deleteFunnel } = useApi();

    useEffect(() => {
        initializeApp();
    }, [tg]);

    const initializeApp = async () => {
        if (tg) {
            const initData = tg.initData;
            const authResult = await authWithTelegram(initData);

            if (authResult.success) {
                setCurrentUser(authResult.user);
                const funnelsResult = await getFunnels(authResult.user.id);
                setFunnels(funnelsResult.funnels || []);
            }
        }
    };

    // ... (keep previous metrics calculations)

    const handleCreateFromTemplate = async (template) => {
        if (!currentUser) return;

        const funnelName = `${template.name} - ${new Date().toLocaleDateString()}`;

        const result = await fetch('/api/funnels/from-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                templateId: template.id,
                funnelName: funnelName
            })
        }).then(r => r.json());

        if (result.success) {
            setFunnels(prev => [result.funnel, ...prev]);
            setShowTemplates(false);
            tg.showAlert(`Funnel "${funnelName}" created from template!`);
        }
    };

    const handleEditFunnel = (funnel) => {
        setEditingFunnel(funnel);
    };

    const handleSaveFunnel = () => {
        tg.showAlert('Funnel saved successfully!');
        setEditingFunnel(null);
        // Reload funnels to get updated data
        initializeApp();
    };

    const handlePaymentSuccess = () => {
        tg.showAlert('Welcome to FunnelGram Pro!');
        setShowPayment(false);
        // Update user to pro status
        setCurrentUser(prev => ({ ...prev, subscription_tier: 'pro' }));
    };

    // If editing funnel, show editor
    if (editingFunnel) {
        return (
            <FunnelEditor
                funnel={editingFunnel}
                onSave={handleSaveFunnel}
                onExit={() => setEditingFunnel(null)}
            />
        );
    }

    // ... (keep previous DashboardView, FunnelsView, SettingsView)

    const EnhancedFunnelsView = () => (
        <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--tg-theme-text-color)' }}>My Funnels</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowTemplates(true)}
                        className="btn-primary"
                    >
                        <Download size={16} />
                        Templates
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
                onPreview={(funnel) => tg.showAlert(`Preview: ${funnel.name}`)}
                onClone={(funnel) => tg.showAlert(`Clone: ${funnel.name}`)}
                onDelete={handleDeleteFunnel}
            />
        </div>
    );

    const EnhancedSettingsView = () => (
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

            {/* ... rest of settings ... */}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--tg-theme-secondary-bg-color)', paddingBottom: '80px' }}>
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'funnels' && <EnhancedFunnelsView />}
            {activeTab === 'settings' && <EnhancedSettingsView />}

            <CreateFunnelModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onFunnelCreate={handleCreateFunnel}
            />

            {showTemplates && (
                <TemplateGallery
                    onTemplateSelect={handleCreateFromTemplate}
                    onClose={() => setShowTemplates(false)}
                />
            )}

            {showPayment && (
                <PaymentProcessor
                    amount={29}
                    funnelId={null}
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