// Telegram Web App integration
class FunnelGramApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.supabase = null;
        this.currentFunnel = null;
        this.currentStep = null;
        this.userProgress = null;

        this.init();
    }

    async init() {
        // Initialize Supabase
        this.supabase = window.supabase.createClient(
            'YOUR_SUPABASE_URL',
            'YOUR_SUPABASE_ANON_KEY'
        );

        // Expand Web App to full height
        this.tg.expand();
        this.tg.ready();
        this.tg.enableClosingConfirmation();

        // Set theme colors
        this.applyTheme();

        // Load funnel data from URL parameters
        await this.loadFunnelFromURL();

        // Set up main button
        this.setupMainButton();
    }

    applyTheme() {
        document.documentElement.style.setProperty('--tg-theme-bg-color', this.tg.themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', this.tg.themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', this.tg.themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', this.tg.themeParams.link_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-color', this.tg.themeParams.button_color || '#40a7e3');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', this.tg.themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', this.tg.themeParams.secondary_bg_color || '#f1f1f1');
    }

    async loadFunnelFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const funnelId = urlParams.get('funnel_id');
        const stepNumber = parseInt(urlParams.get('step')) || 1;
        const userId = urlParams.get('user_id') || this.tg.initDataUnsafe.user?.id;

        if (!funnelId) {
            this.showError('No funnel specified');
            return;
        }

        try {
            // Load funnel data
            const { data: funnel, error: funnelError } = await this.supabase
                .from('funnels')
                .select('*')
                .eq('id', funnelId)
                .single();

            if (funnelError) throw funnelError;
            this.currentFunnel = funnel;

            // Load step data
            const { data: step, error: stepError } = await this.supabase
                .from('funnel_steps')
                .select('*')
                .eq('funnel_id', funnelId)
                .eq('step_order', stepNumber)
                .single();

            if (stepError) throw stepError;
            this.currentStep = step;

            // Load or create user progress
            if (userId) {
                await this.loadUserProgress(funnelId, userId, step.id);
            }

            // Render the step
            this.renderStep(step);

            // Track analytics
            this.trackEvent('step_view', {
                funnel_id: funnelId,
                step_id: step.id,
                step_number: stepNumber
            });

        } catch (error) {
            console.error('Error loading funnel:', error);
            this.showError('Failed to load funnel');
        }
    }

    async loadUserProgress(funnelId, userId, stepId) {
        const { data: progress, error } = await this.supabase
            .from('user_progress')
            .select('*')
            .eq('funnel_id', funnelId)
            .eq('telegram_user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error loading progress:', error);
            return;
        }

        if (!progress) {
            // Create new progress record
            const { data: newProgress, error: createError } = await this.supabase
                .from('user_progress')
                .insert([{
                    funnel_id: funnelId,
                    telegram_user_id: userId,
                    current_step_id: stepId,
                    progress_data: {}
                }])
                .select()
                .single();

            if (!createError) {
                this.userProgress = newProgress;
            }
        } else {
            this.userProgress = progress;

            // Update current step if needed
            if (progress.current_step_id !== stepId) {
                const { error: updateError } = await this.supabase
                    .from('user_progress')
                    .update({ current_step_id: stepId })
                    .eq('id', progress.id);

                if (updateError) {
                    console.error('Error updating progress:', updateError);
                }
            }
        }
    }

    renderStep(step) {
        const container = document.getElementById('funnelStep');
        if (!container) return;

        let stepHTML = '';

        switch (step.type) {
            case 'landing':
                stepHTML = this.renderLandingStep(step);
                break;
            case 'lead_capture':
                stepHTML = this.renderLeadCaptureStep(step);
                break;
            case 'thank_you':
                stepHTML = this.renderThankYouStep(step);
                break;
            default:
                stepHTML = this.renderBasicStep(step);
        }

        container.innerHTML = stepHTML;
        this.attachEventListeners();
    }

    renderLandingStep(step) {
        return `
            <div class="step-content">
                <h1 class="step-title">${step.title}</h1>
                <p class="step-description">${step.content}</p>
            </div>
            <div class="step-actions">
                <button class="btn btn-primary" id="nextStepBtn">
                    ${step.button_text || 'Get Started'}
                </button>
            </div>
        `;
    }

    renderLeadCaptureStep(step) {
        const formFields = step.form_fields || [
            { name: 'name', label: 'Full Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true }
        ];

        const formHTML = formFields.map(field => `
            <div class="form-group">
                <label for="${field.name}">${field.label}</label>
                <input type="${field.type}" 
                       id="${field.name}" 
                       class="form-input" 
                       ${field.required ? 'required' : ''}
                       placeholder="Enter your ${field.label.toLowerCase()}">
            </div>
        `).join('');

        return `
            <div class="step-content">
                <h1 class="step-title">${step.title}</h1>
                <p class="step-description">${step.content}</p>
            </div>
            <div class="lead-form">
                <form id="leadForm">
                    ${formHTML}
                </form>
            </div>
            <div class="step-actions">
                <button class="btn btn-primary" id="submitFormBtn">
                    ${step.button_text || 'Submit'}
                </button>
            </div>
        `;
    }

    renderThankYouStep(step) {
        return `
            <div class="step-content">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                    <h1 class="step-title">${step.title}</h1>
                    <p class="step-description">${step.content}</p>
                </div>
            </div>
            <div class="step-actions">
                <button class="btn btn-primary" id="closeAppBtn">
                    ${step.button_text || 'Close'}
                </button>
            </div>
        `;
    }

    renderBasicStep(step) {
        return `
            <div class="step-content">
                <h1 class="step-title">${step.title}</h1>
                <p class="step-description">${step.content}</p>
            </div>
            <div class="step-actions">
                <button class="btn btn-primary" id="nextStepBtn">
                    ${step.button_text || 'Continue'}
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        // Next step button
        const nextStepBtn = document.getElementById('nextStepBtn');
        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => this.goToNextStep());
        }

        // Form submission
        const submitFormBtn = document.getElementById('submitFormBtn');
        if (submitFormBtn) {
            submitFormBtn.addEventListener('click', () => this.submitForm());
        }

        // Close app button
        const closeAppBtn = document.getElementById('closeAppBtn');
        if (closeAppBtn) {
            closeAppBtn.addEventListener('click', () => this.tg.close());
        }
    }

    setupMainButton() {
        const MainButton = this.tg.MainButton;

        MainButton.setText("Continue");
        MainButton.show();

        MainButton.onClick(() => {
            this.handleMainButtonClick();
        });
    }

    handleMainButtonClick() {
        if (this.currentStep.type === 'lead_capture') {
            this.submitForm();
        } else {
            this.goToNextStep();
        }
    }

    async goToNextStep() {
        const nextStepNumber = this.currentStep.step_order + 1;

        try {
            // Check if there's a next step
            const { data: nextStep, error } = await this.supabase
                .from('funnel_steps')
                .select('*')
                .eq('funnel_id', this.currentFunnel.id)
                .eq('step_order', nextStepNumber)
                .single();

            if (error || !nextStep) {
                // No more steps, complete the funnel
                await this.completeFunnel();
                return;
            }

            // Navigate to next step
            const newUrl = `${window.location.pathname}?funnel_id=${this.currentFunnel.id}&step=${nextStepNumber}`;
            window.location.href = newUrl;

        } catch (error) {
            console.error('Error navigating to next step:', error);
            this.showError('Failed to proceed');
        }
    }

    async submitForm() {
        const form = document.getElementById('leadForm');
        if (!form) return;

        const formData = new FormData(form);
        const formValues = {};

        for (let [key, value] of formData.entries()) {
            formValues[key] = value;
        }

        // Basic validation
        if (!formValues.email || !formValues.name) {
            this.showError('Please fill in all required fields');
            return;
        }

        try {
            // Save lead to database
            const { error: leadError } = await this.supabase
                .from('leads')
                .insert([{
                    funnel_id: this.currentFunnel.id,
                    telegram_user_id: this.tg.initDataUnsafe.user?.id,
                    email: formValues.email,
                    name: formValues.name,
                    submitted_data: formValues
                }]);

            if (leadError) throw leadError;

            // Track lead capture event
            await this.trackEvent('lead_captured', {
                funnel_id: this.currentFunnel.id,
                step_id: this.currentStep.id,
                form_data: formValues
            });

            // Send data back to bot
            this.tg.sendData(JSON.stringify({
                event_type: 'lead_captured',
                funnel_id: this.currentFunnel.id,
                step_id: this.currentStep.id,
                user_id: this.tg.initDataUnsafe.user?.id,
                form_data: formValues
            }));

            // Proceed to next step
            this.goToNextStep();

        } catch (error) {
            console.error('Error submitting form:', error);
            this.showError('Failed to submit form');
        }
    }

    async completeFunnel() {
        const userId = this.tg.initDataUnsafe.user?.id;

        if (userId && this.userProgress) {
            // Mark funnel as completed
            const { error } = await this.supabase
                .from('user_progress')
                .update({ completed: true })
                .eq('id', this.userProgress.id);

            if (error) {
                console.error('Error completing funnel:', error);
            }
        }

        // Track completion
        await this.trackEvent('funnel_completed', {
            funnel_id: this.currentFunnel.id
        });

        // Show completion message
        this.showCompletion();
    }

    async trackEvent(eventType, eventData) {
        try {
            const { error } = await this.supabase
                .from('funnel_analytics')
                .insert([{
                    funnel_id: this.currentFunnel.id,
                    step_id: this.currentStep?.id,
                    telegram_user_id: this.tg.initDataUnsafe.user?.id,
                    event_type: eventType,
                    event_data: eventData
                }]);

            if (error) {
                console.error('Error tracking event:', error);
            }
        } catch (error) {
            console.error('Error in trackEvent:', error);
        }
    }

    showCompletion() {
        const container = document.getElementById('funnelStep');
        if (container) {
            container.innerHTML = `
                <div class="step-content">
                    <div style="text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                        <h1 class="step-title">Amazing! You've Completed the Funnel</h1>
                        <p class="step-description">Thank you for your participation. The funnel owner has been notified.</p>
                    </div>
                </div>
                <div class="step-actions">
                    <button class="btn btn-primary" onclick="window.Telegram.WebApp.close()">
                        Close
                    </button>
                </div>
            `;
        }
    }

    showError(message) {
        const container = document.getElementById('funnelStep') || document.body;
        const errorHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">😕</div>
                <h2>Oops! Something went wrong</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                    Try Again
                </button>
            </div>
        `;
        container.innerHTML = errorHTML;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FunnelGramApp();
});

// Utility functions
window.FunnelGram = {
    trackEvent: (event, data) => {
        // Implementation for custom event tracking
        console.log('Track event:', event, data);
    }
};