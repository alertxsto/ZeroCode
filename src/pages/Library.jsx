import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useProgress } from '../contexts/ProgressProvider';
import {
    BookOpen, ExternalLink, Search, Code, Palette, Terminal,
    Database, FileText, Video, Globe, GitBranch, Zap
} from 'lucide-react';
import clsx from 'clsx';

const CATEGORIES = [
    { id: 'all', label: 'ALL_DATA', icon: <Zap size={14} /> },
    { id: 'docs', label: 'DOCS_ARCHIVE', icon: <FileText size={14} /> },
    { id: 'tools', label: 'NEURAL_TOOLS', icon: <Terminal size={14} /> },
    { id: 'tutorials', label: 'SKILL_UPLINKS', icon: <Video size={14} /> },
    { id: 'cheatsheets', label: 'QUICK_HACKS', icon: <Code size={14} /> },
];

const RESOURCES = [
    // Documentation
    { id: 1, title: 'MDN Web Docs', desc: 'The ultimate web development reference. Essential knowledge base.', url: 'https://developer.mozilla.org', category: 'docs', icon: <Globe size={20} className="text-blue-400" /> },
    { id: 2, title: 'React Documentation', desc: 'Official React docs with hooks guide. Component protocols.', url: 'https://react.dev', category: 'docs', icon: <Code size={20} className="text-cyan-400" /> },
    { id: 3, title: 'Node.js Docs', desc: 'Official Node.js API documentation. Server-side runtime specs.', url: 'https://nodejs.org/docs', category: 'docs', icon: <Terminal size={20} className="text-emerald-400" /> },
    { id: 4, title: 'TypeScript Handbook', desc: 'Typed Superset specs. From basics to advanced typing.', url: 'https://www.typescriptlang.org/docs/', category: 'docs', icon: <Code size={20} className="text-blue-500" /> },
    { id: 5, title: 'Tailwind CSS Docs', desc: 'Utility-first CSS framework. Rapid styling protocols.', url: 'https://tailwindcss.com/docs', category: 'docs', icon: <Palette size={20} className="text-cyan-400" /> },

    // Tools
    { id: 6, title: 'VS Code', desc: 'Primary code editor. Integrated Development Environment.', url: 'https://code.visualstudio.com', category: 'tools', icon: <Code size={20} className="text-blue-400" /> },
    { id: 7, title: 'GitHub', desc: 'Version Control System. Code alignment and collaboration.', url: 'https://github.com', category: 'tools', icon: <GitBranch size={20} className="text-white" /> },
    { id: 8, title: 'Figma', desc: 'Interface design tool. Prototyping and vector graphics.', url: 'https://figma.com', category: 'tools', icon: <Palette size={20} className="text-purple-400" /> },
    { id: 9, title: 'Postman', desc: 'API testing suite. Endpoint verification tools.', url: 'https://postman.com', category: 'tools', icon: <Terminal size={20} className="text-orange-400" /> },
    { id: 10, title: 'Vercel', desc: 'Deployment platform. Edge network distribution.', url: 'https://vercel.com', category: 'tools', icon: <Globe size={20} className="text-white" /> },

    // Tutorials
    { id: 11, title: 'freeCodeCamp', desc: 'Open source bootcamp. Certification modules.', url: 'https://freecodecamp.org', category: 'tutorials', icon: <BookOpen size={20} className="text-emerald-400" /> },
    { id: 12, title: 'JavaScript.info', desc: 'Modern JavaScript core concepts. Deep dive protocols.', url: 'https://javascript.info', category: 'tutorials', icon: <Terminal size={20} className="text-yellow-400" /> },
    { id: 13, title: 'CSS-Tricks', desc: 'Styling techniques and hacks. Advanced layout data.', url: 'https://css-tricks.com', category: 'tutorials', icon: <Palette size={20} className="text-orange-400" /> },
    { id: 14, title: 'The Odin Project', desc: 'Full stack path. Open curriculum project.', url: 'https://theodinproject.com', category: 'tutorials', icon: <BookOpen size={20} className="text-yellow-500" /> },

    // Cheatsheets
    { id: 15, title: 'HTML Cheatsheet', desc: 'Tags and attributes reference. Quick syntax lookup.', url: 'https://htmlcheatsheet.com', category: 'cheatsheets', icon: <Code size={20} className="text-orange-400" /> },
    { id: 16, title: 'CSS Cheatsheet', desc: 'Property reference guide. Style definitions.', url: 'https://cssreference.io', category: 'cheatsheets', icon: <Palette size={20} className="text-blue-400" /> },
    { id: 17, title: 'Git Cheatsheet', desc: 'VCS command list. Branch management protocols.', url: 'https://education.github.com/git-cheat-sheet-education.pdf', category: 'cheatsheets', icon: <Terminal size={20} className="text-red-400" /> },
    { id: 18, title: 'Flexbox Guide', desc: 'Flexible Box Layout Module. Alignment guide.', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', category: 'cheatsheets', icon: <Palette size={20} className="text-purple-400" /> },
    { id: 19, title: 'Grid Guide', desc: 'Grid Layout Module. 2D layout system.', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', category: 'cheatsheets', icon: <Palette size={20} className="text-pink-400" /> },
    { id: 20, title: 'React Hooks Cheatsheet', desc: 'Hooks API reference. State and effect management.', url: 'https://react.dev/reference/react', category: 'cheatsheets', icon: <Code size={20} className="text-cyan-400" /> },
];

export default function Library() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { completedCourses } = useProgress();

    const filteredResources = RESOURCES.filter(resource => {
        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#050505] text-gray-300 font-sans p-4 md:p-8">
                {/* Background Grid */}
                <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Header Section */}
                    <div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                                <Database size={14} />
                                <span>External Knowledge Base</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-4">
                                DATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">ARCHIVES</span>
                            </h1>
                            <p className="text-gray-500 max-w-xl text-lg relative pl-4 border-l-2 border-indigo-500/30">
                                Curated set of development protocols, documentation, and tools for operative efficiency.
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="w-full md:w-96 relative group">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex items-center bg-[#0a0a0c] border border-white/10 rounded-lg overflow-hidden group-focus-within:border-indigo-500/50 transition-colors">
                                <div className="pl-4 text-gray-500">
                                    <Search size={16} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="SEARCH_DATABASE..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 bg-transparent text-sm font-mono text-white placeholder-gray-600 focus:outline-none"
                                />
                                <div className="pr-4 hidden md:block">
                                    <kbd className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-500">CTRL+K</kbd>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mb-10 overflow-x-auto pb-4 custom-scrollbar">
                        <div className="flex gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={clsx(
                                        "relative flex items-center gap-2 px-5 py-2.5 rounded-none border border-transparent transition-all",
                                        "font-mono text-xs font-bold uppercase tracking-wider",
                                        selectedCategory === cat.id
                                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                                            : "bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:text-white"
                                    )}
                                >
                                    {selectedCategory === cat.id && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]" />
                                    )}
                                    {cat.icon}
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map((resource, index) => (
                            <a
                                key={resource.id}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative bg-[#0a0a0c] border border-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] overflow-hidden"
                            >
                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Corner Accents */}
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink size={14} className="text-indigo-400" />
                                </div>

                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded bg-[#111113] border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors">
                                        {resource.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-mono font-bold text-indigo-500/70 border border-indigo-500/20 px-1.5 rounded uppercase tracking-wider">
                                                {resource.category}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors mb-2">
                                            {resource.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed font-mono">
                                            {resource.desc}
                                        </p>
                                    </div>
                                </div>

                                {/* Tech Decoration Bottom */}
                                <div className="absolute bottom-3 right-3 flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                                    <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                                    <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                                </div>
                            </a>
                        ))}
                    </div>

                    {filteredResources.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 border border-white/5 border-dashed rounded bg-white/5">
                            <Database size={48} className="text-gray-700 mb-4" />
                            <h3 className="text-xl font-bold text-gray-500">NO DATA FOUND</h3>
                            <p className="text-gray-600 font-mono text-sm mt-2">ADJUST SEARCH PARAMETERS</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
