// Single source of truth for ZeroCode pricing.
// All pages (landing, admin, chatbot) must read from here — never hardcode prices.

export const WHATSAPP_NUMBER = '6283875727384';

export const PRICING = {
    starter: {
        tier: 'beginner',
        name: 'Starter Pack',
        price: 50000,
        originalPrice: 100000,
        description: 'Foundation Access',
        courseCount: 5,
        courses: ['html5', 'css3', 'js-basics', 'git', 'tailwind'],
        features: [
            'HTML5 & CSS3 Protocols',
            'JavaScript Core',
            'Git Version Control',
            'Tailwind Styling',
            'Lifetime Access'
        ]
    },
    developer: {
        tier: 'intermediate',
        name: 'Developer Pro',
        price: 75000,
        originalPrice: 150000,
        description: 'Standard Operation',
        courseCount: 11,
        courses: ['html5', 'css3', 'js-basics', 'git', 'tailwind', 'dom', 'js-es6', 'react', 'php', 'mysql', 'python'],
        popular: true,
        features: [
            'All Starter Modules',
            'DOM & ES6+ JavaScript',
            'React Framework',
            'PHP & MySQL Backend',
            'Python Scripting'
        ]
    },
    professional: {
        tier: 'advanced',
        name: 'Professional',
        price: 80000,
        originalPrice: 180000,
        description: 'Advanced Clearance',
        courseCount: 19,
        courses: 'all',
        features: [
            'All Developer Modules',
            'TypeScript Safety',
            'Node.js & Express',
            'MongoDB & PostgreSQL',
            'Next.js & DevOps'
        ]
    },
    master: {
        tier: 'fullstack',
        name: 'Master Key Bundle',
        price: 164000,
        originalPrice: 250000,
        description: 'Unlock Everything',
        courseCount: 19,
        courses: 'all',
        popular: true,
        features: [
            'ALL Courses + Future Updates',
            'Complete Full-Stack Path',
            'Lifetime Access Guarantee',
            'Priority Support'
        ]
    }
};

// Format price as Indonesian Rupiah string (e.g. "Rp 164.000")
export const formatPrice = (value) => `Rp ${value.toLocaleString('id-ID')}`;

// Build a WhatsApp purchase message for a given plan key
export const buildPurchaseMessage = (planKey, user = null) => {
    const plan = PRICING[planKey];
    if (!plan) return '';
    return [
        '[SYSTEM_REQUEST]: Initialize purchase',
        '',
        `Plan: ${plan.name}`,
        `Price: ${formatPrice(plan.price)}`,
        `Courses: ${plan.courseCount}`,
        '',
        `USER_ID: ${user?.email || 'GUEST'}`,
        `USER_NAME: ${user?.name || 'UNKNOWN'}`
    ].join('\n');
};

export const whatsappLink = (message) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
