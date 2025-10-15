// Add this import
import SimpleFunnelEditor from './components/SimpleFunnelEditor';

// Replace the editor section with:
if (editingFunnel) {
    return (
        <SimpleFunnelEditor
            funnel={editingFunnel}
            onSave={(elements) => {
                tg.showAlert('Page saved successfully!');
                setEditingFunnel(null);
            }}
            onClose={() => setEditingFunnel(null)}
        />
    );
}