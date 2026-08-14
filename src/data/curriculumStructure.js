// BUILD_TRIGGER: 2025-12-26-05:22
// ZeroCode Curriculum Structure
// Flow: Lesson → Quiz → Project → Informational (like Codecademy)

export const CONTENT_TYPES = {
    LESSON: 'lesson',
    QUIZ: 'quiz',
    PROJECT: 'project',
    INFORMATIONAL: 'informational'
};

export const LEVELS = {
    BEGINNER: {
        id: 'beginner',
        label: { id: 'New Recruit', en: 'New Recruit' },
        tagline: { id: 'Membangun fondasi web development dari nol', en: 'Static Web, Basic Logic, & Professional Workflow' },
        color: 'from-blue-600 to-blue-800',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        icon: '🎖️'
    },
    INTERMEDIATE: {
        id: 'intermediate',
        label: { id: 'Systems Engineer', en: 'Systems Engineer' },
        tagline: { id: 'Menguasai interaktivitas dan sistem backend', en: 'Interactivity, Frameworks, & Dynamic Data' },
        color: 'from-purple-600 to-purple-800',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-500',
        icon: '⚙️'
    },
    ADVANCED: {
        id: 'advanced',
        label: { id: 'Lead Architect', en: 'Lead Architect' },
        tagline: { id: 'Membangun aplikasi production-ready', en: 'Scale, Types, & Industrial Production' },
        color: 'from-red-700 to-red-900',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        icon: '🏗️'
    }
};

// Course metadata (high-level)
export const courses = {
    'html5': {
        id: 'html5',
        title: 'HTML5 Fundamentals',
        level: 'beginner',
        order: 1,
        duration: '4 hours',
        prerequisites: [],
        shortDesc: 'Structure, Semantic tags, Forms, and Accessibility',
        icon: 'html5',
        totalUnits: 11
    },
    'css3': {
        id: 'css3',
        title: 'CSS3 Styling',
        level: 'beginner',
        order: 2,
        duration: '6 hours',
        prerequisites: [], // Beginner courses are always accessible
        shortDesc: 'Box Model, Flexbox, Grid, and Animations',
        icon: 'css3',
        totalUnits: 17
    },
    'js-basics': {
        id: 'js-basics',
        title: 'JavaScript Basics',
        level: 'beginner',
        order: 3,
        duration: '8 hours',
        prerequisites: [], // Beginner courses are always accessible
        shortDesc: 'Variables, Functions, Conditionals, Loops',
        icon: 'javascript',
        totalUnits: 11
    },
    'git': {
        id: 'git',
        title: 'Git & GitHub',
        level: 'beginner',
        order: 4,
        duration: '3 hours',
        prerequisites: [],
        shortDesc: 'Version Control, Commits, Branches, Pull Requests',
        icon: 'git',
        totalUnits: 7
    },
    'tailwind': {
        id: 'tailwind',
        title: 'Tailwind CSS',
        level: 'beginner',
        order: 5,
        duration: '5 hours',
        prerequisites: [], // Beginner courses are always accessible
        shortDesc: 'Utility-first CSS, Responsive Design, Components',
        icon: 'tailwind',
        totalUnits: 11
    },
    'python': {
        id: 'python',
        title: 'Python Fundamentals',
        level: 'beginner',
        order: 6,
        duration: '7 hours',
        prerequisites: [],
        shortDesc: 'Syntax, Data Structures, Functions',
        icon: 'python',
        totalUnits: 12
    },
    'dom': {
        id: 'dom',
        title: 'DOM Manipulation',
        level: 'intermediate',
        order: 7,
        duration: '5 hours',
        prerequisites: ['js-basics'],
        shortDesc: 'Selectors, Events, Dynamic Content',
        icon: 'dom',
        totalUnits: 5
    },
    'js-es6': {
        id: 'js-es6',
        title: 'Modern JavaScript (ES6+)',
        level: 'intermediate',
        order: 7,
        duration: '6 hours',
        prerequisites: ['js-basics'],
        shortDesc: 'Arrow Functions, Destructuring, Promises, Async/Await',
        icon: 'javascript',
        totalUnits: 5
    },
    'react': {
        id: 'react',
        title: 'React.js Fundamentals',
        level: 'intermediate',
        order: 8,
        duration: '12 hours',
        prerequisites: ['js-es6', 'dom'],
        shortDesc: 'Components, Props, State, Hooks',
        icon: 'react',
        totalUnits: 8
    },
    'php': {
        id: 'php',
        title: 'PHP Backend',
        level: 'intermediate',
        order: 9,
        duration: '10 hours',
        prerequisites: ['js-basics'],
        shortDesc: 'Server-side Logic, Forms, Sessions',
        icon: 'php',
        totalUnits: 6
    },
    'mysql': {
        id: 'mysql',
        title: 'MySQL Database',
        level: 'intermediate',
        order: 10,
        duration: '8 hours',
        prerequisites: ['php'],
        shortDesc: 'SQL Queries, CRUD, Joins, Relationships',
        icon: 'mysql',
        totalUnits: 5
    },

    'vue': {
        id: 'vue',
        title: 'Vue.js Mastery',
        level: 'intermediate',
        order: 12,
        duration: '10 hours',
        prerequisites: ['js-es6', 'dom'],
        shortDesc: 'Reactivity, Composition API, Directives',
        icon: 'vue',
        totalUnits: 1
    },
    'typescript': {
        id: 'typescript',
        title: 'TypeScript',
        level: 'advanced',
        order: 12,
        duration: '8 hours',
        prerequisites: ['js-es6'],
        shortDesc: 'Types, Interfaces, Generics',
        icon: 'typescript',
        totalUnits: 5
    },
    'node': {
        id: 'node',
        title: 'Node.js & Express',
        level: 'advanced',
        order: 13,
        duration: '10 hours',
        prerequisites: ['js-es6'],
        shortDesc: 'REST APIs, Middleware, Authentication',
        icon: 'node',
        totalUnits: 6
    },
    'express': {
        id: 'express',
        title: 'Express.js Framework',
        level: 'intermediate',
        order: 12,
        duration: '8 hours',
        prerequisites: ['node', 'js-es6'],
        shortDesc: 'Web Framework, Middleware, REST APIs, Routes',
        icon: 'express',
        totalUnits: 2
    },
    'mongodb': {
        id: 'mongodb',
        title: 'MongoDB',
        level: 'advanced',
        order: 14,
        duration: '8 hours',
        prerequisites: ['node'],
        shortDesc: 'NoSQL, Documents, Mongoose',
        icon: 'mongodb',
        totalUnits: 5
    },
    'nextjs': {
        id: 'nextjs',
        title: 'Next.js',
        level: 'advanced',
        order: 15,
        duration: '12 hours',
        prerequisites: ['react', 'node'],
        shortDesc: 'SSR, SSG, App Router, Full-stack',
        icon: 'nextjs',
        totalUnits: 6
    },
    'cicd': {
        id: 'cicd',
        title: 'CI/CD & DevOps',
        level: 'advanced',
        order: 16,
        duration: '6 hours',
        prerequisites: ['git', 'node'],
        shortDesc: 'GitHub Actions, Docker, Deployment',
        icon: 'cicd',
        totalUnits: 4
    },
    'postgresql': {
        id: 'postgresql',
        title: 'PostgreSQL Database',
        level: 'intermediate',
        order: 11,
        duration: '15 hours',
        prerequisites: [],
        shortDesc: 'SQL, Relations, Transactions, Performance',
        icon: 'postgresql',
        totalUnits: 2
    }
};

// Helper functions
export const getCoursesByLevel = (level) => {
    return Object.values(courses)
        .filter(course => course.level === level)
        .sort((a, b) => a.order - b.order);
};

export const getCourse = (courseId) => courses[courseId] || null;

export const checkPrerequisites = (courseId, completedCourses = []) => {
    const course = courses[courseId];
    if (!course) return false;

    // All beginner level courses are always accessible
    if (course.level === 'beginner') return true;

    return course.prerequisites.every(prereq => completedCourses.includes(prereq));
};

export const getOverallProgress = (completedCourses = []) => {
    const total = Object.keys(courses).length;
    const completed = completedCourses.length;
    return { total, completed, percentage: Math.round((completed / total) * 100) };
};
