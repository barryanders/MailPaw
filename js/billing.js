/* --- FREE ACCESS STATE --- */

const EXTPAY_EXTENSION_ID = '';
const EXTPAY_TRIAL_DAYS = 0;
const EXTPAY_PLAN_NICKNAMES = {};

function isBillingConfigured() {
    return false;
}

function getBillingState(cb) {
    if (typeof cb === 'function') {
        cb({
            isPremium: true,
            isTrial: false,
            daysLeft: 0,
            licenseStatus: 'free',
            planLabel: 'Free',
            billingConfigured: false
        });
    }
}

function openPaymentPage() {
    return false;
}

function openTrialPage() {
    return false;
}

function openLoginPage() {
    return false;
}

function openBillingPortal() {
    return false;
}

if (typeof window !== 'undefined') {
    window.ZT_BILLING = {
        EXTPAY_EXTENSION_ID,
        EXTPAY_TRIAL_DAYS,
        EXTPAY_PLAN_NICKNAMES,
        isBillingConfigured,
        getBillingState,
        openPaymentPage,
        openTrialPage,
        openLoginPage,
        openBillingPortal
    };
}
