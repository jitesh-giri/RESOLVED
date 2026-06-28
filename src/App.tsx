import React, { useState, useEffect } from 'react';
import { authService } from './lib/authService';
import { dbService } from './lib/dbService';
import { Issue, UserProfile } from './types';
import { 
  Building2, Plus, LogOut, Sparkles, Filter, Search, 
  MapPin, CheckCircle, Clock, AlertTriangle, ShieldCheck, Heart, User, Award, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import our modular components
import LoginView from './components/LoginView';
import IssueCard from './components/IssueCard';
import ReportModal from './components/ReportModal';
import ComplaintModal from './components/ComplaintModal';
import MapVisualizer from './components/MapVisualizer';
import MyProfileView from './components/MyProfileView';
import ThemeToggle from './components/ThemeToggle';
import BackgroundEffects from './components/BackgroundEffects';

type ActiveView = 'home' | 'profile';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  
  // Feed states
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIssueForComplaint, setSelectedIssueForComplaint] = useState<Issue | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    escalated: 0,
    resolved: 0,
    positive: 0
  });

  // Current Local Time Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Listen to Auth State using our fallback service
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      } else {
        setCurrentUser(null);
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to Firestore and Local Issues using our robust dbService
  useEffect(() => {
    const unsubscribe = dbService.subscribeToIssues((issuesData) => {
      setIssues(issuesData);
      setLoadingIssues(false);

      // Compute metrics
      const total = issuesData.length;
      const escalated = issuesData.filter(i => i.status === 'Escalated').length;
      const resolved = issuesData.filter(i => i.status === 'Resolved').length;
      const positive = issuesData.filter(i => i.category === 'positive').length;
      setStats({ total, escalated, resolved, positive });
    });
    return unsubscribe;
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  // Submit new issue using our robust dbService
  const handleCreateIssue = async (issueData: any) => {
    if (!currentUser) return;

    const newIssue: Omit<Issue, 'id'> = {
      ...issueData,
      upvotes: 1,
      downvotes: 0,
      status: 'Pending',
      createdAt: Date.now(),
      createdBy: currentUser.uid,
      createdByName: currentUser.displayName || 'Anonymous Resident',
      votedUsers: { [currentUser.uid]: 'up' }
    };

    await dbService.createIssue(newIssue);
  };

  // Handle upvoting / downvoting using our robust dbService
  const handleVote = async (issueId: string, voteType: 'up' | 'down') => {
    if (!currentUser) {
      alert("Please log in or launch the instant sandbox to vote on issues.");
      return;
    }
    await dbService.voteIssue(issueId, currentUser.uid, voteType);
  };

  // Filter and search logic
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.locality.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const userContributionCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    issues.forEach(issue => {
      if (issue.createdBy) {
        counts[issue.createdBy] = (counts[issue.createdBy] || 0) + 1;
      }
    });
    return counts;
  }, [issues]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 16) return 'Good afternoon';
    return 'Good evening';
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary-500"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">Securing local sandbox connection...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 pb-16 flex flex-col transition-colors relative overflow-hidden">
      
      {/* Universal Background Effects */}
      <div className="absolute inset-0 z-0">
        <BackgroundEffects />
      </div>

      {/* Dynamic Top Navigation Header */}
      <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors" id="main_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md">
              <Building2 className="w-5.5 h-5.5 text-primary-400" />
            </div>
            <div>
              <span className="font-display font-black text-slate-900 dark:text-white text-lg tracking-tight block">Resolved</span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block tracking-wider uppercase">अंतः अस्ति प्रारंभः</span>
            </div>
          </div>

          {/* Sandbox Local Clock & Active User Controls */}
          <div className="flex items-center space-x-6">
            
            {/* Live Clock Indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono transition-colors">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{currentTime.toLocaleTimeString('en-IN', { hour12: false })} IST</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">2026-06-26</span>
            </div>

            {/* Profile info & Signout */}
            <div className="flex items-center space-x-3 border-l border-slate-100 dark:border-slate-800 pl-4 sm:pl-6 transition-colors">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">{currentUser.displayName}</p>
                <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium">Local Champion</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-slate-100">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-all dark:hover:bg-rose-950/30"
                title="Sign Out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>

        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeView === 'home' ? (
          <motion.main 
            key="home"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full flex-1 flex flex-col mb-20 relative z-10"
          >
            {/* Hero Welcome Panel */}
            <section className="bg-slate-950/20 dark:bg-slate-950/50 backdrop-blur-sm text-slate-900 dark:text-white py-12 px-4 relative overflow-hidden" id="hero_section">
              {/* Decorative background vectors */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/10 dark:bg-primary-600/10 rounded-full blur-3xl -mr-64 -mt-64"></div>
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl -ml-64 -mb-64"></div>

              <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="max-w-3xl space-y-4">
                    <span className="bg-amber-100 dark:bg-primary-500/10 text-amber-700 dark:text-primary-300 border border-amber-200 dark:border-primary-500/20 text-xs font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full inline-block">
                      ⚡ Action Center
                    </span>
                    <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                      Mobilize Your Neighborhood. <br className="hidden sm:inline" />
                      Solve Issues with <span className="text-orange-500 dark:text-primary-400">AI Escalation</span>.
                    </h1>
                    <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
                      Report infrastructure hazards, coordinate neighborhood votes, and instantly generate professionally drafted legal complaints and public tweets to escalate concerns directly to local authorities.
                    </p>
                  </div>
                  
                  {/* Time-based Greeting Box */}
                  <div className="flex-shrink-0 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden group hover:bg-white/50 dark:hover:bg-white/10 transition-colors duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 dark:bg-primary-500/20 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-amber-400/30 dark:group-hover:bg-primary-500/30 transition-colors"></div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        {getGreeting() === 'Good morning' ? '🌅' : getGreeting() === 'Good afternoon' ? '☀️' : '🌙'}
                        {getGreeting()},
                      </h3>
                      <h4 className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600 dark:from-primary-400 dark:to-emerald-400">
                        {currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Citizen'}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 font-medium flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-orange-500 dark:text-primary-400" />
                        Ready to make an impact?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Core Metrics Bento Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-900/10 dark:border-slate-800">
                  <div className="bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-2xl p-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Cases Reported</span>
                    <span className="text-2xl sm:text-3xl font-bold block mt-1 text-slate-900 dark:text-slate-50">{stats.total}</span>
                  </div>
                  <div className="bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-2xl p-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Escalated via Upvotes</span>
                      <Flame className="w-4 h-4 text-orange-500 dark:text-amber-500 animate-pulse" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-bold block mt-1 text-orange-600 dark:text-amber-400">{stats.escalated}</span>
                  </div>
                  <div className="bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-2xl p-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Community Victories</span>
                    <span className="text-2xl sm:text-3xl font-bold block mt-1 text-emerald-600 dark:text-emerald-400">{stats.resolved}</span>
                  </div>
                  <div className="bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-2xl p-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Positive Updates</span>
                    <span className="text-2xl sm:text-3xl font-bold block mt-1 text-sky-600 dark:text-primary-400">{stats.positive}</span>
                  </div>
                </div>
              </div>
            </section>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 w-full flex-1 flex flex-col space-y-6">
          
          {/* Map Visualization */}
          <div className="w-full">
            <MapVisualizer issues={filteredIssues} />
          </div>

          {/* Controls Bar: Search, Category, Status, Report Button */}
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Search issues, descriptions, or localities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm text-slate-800 dark:text-slate-200 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="raise_issue_btn"
                  onClick={() => setShowReportModal(true)}
                  className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-white font-semibold py-3 px-5 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5 text-primary-400" />
                  <span>Report Local Issue</span>
                </button>
              </div>

            </div>

            {/* Filtering row */}
            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-50 dark:border-slate-800/50 text-xs font-semibold transition-colors">
              
              {/* Category Filter Group */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Topic:</span>
                <div className="flex flex-wrap gap-1">
                  {['all', 'infrastructure', 'safety', 'trash', 'vandalism', 'positive'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                        categoryFilter === cat 
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm' 
                          : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat === 'all' ? 'All Topics' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

              {/* Status Filter Group */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Status:</span>
                <div className="flex gap-1">
                  {['all', 'Pending', 'Escalated', 'Resolved'].map((stat) => (
                    <button
                      key={stat}
                      onClick={() => setStatusFilter(stat)}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        statusFilter === stat 
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm' 
                          : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {stat === 'all' ? 'All Status' : stat}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Live Feed Cards Grid */}
          <div className="flex-1">
            {loadingIssues ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white dark:bg-slate-950 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 space-y-4 animate-pulse transition-colors">
                    <div className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-100 dark:bg-slate-800/50 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-full"></div>
                    <div className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full mt-4"></div>
                  </div>
                ))}
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 transition-colors">
                <div className="inline-flex bg-slate-50 dark:bg-slate-900 p-4 rounded-full text-slate-400 dark:text-slate-500">
                  <Search className="w-8 h-8 stroke-1.5" />
                </div>
                <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-lg">No reported concerns found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  We couldn't find any issues matching your active search filters. Try adjusting your category or write a new report to trigger change!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                  className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  Clear Search & Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {filteredIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    currentUserId={currentUser.uid}
                    onVote={handleVote}
                    onGenerateComplaint={setSelectedIssueForComplaint}
                    onAddComment={(issueId, text) => {
                      dbService.addComment(issueId, currentUser.uid, currentUser.displayName || currentUser.email, text);
                    }}
                    userContributionCounts={userContributionCounts}
                  />
                ))}
              </div>
            )}
          </div>
          </div>

          </motion.main>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full flex-1 flex flex-col mb-20"
          >
            <MyProfileView issues={issues} currentUser={currentUser} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instagram-like Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-around items-center z-40 transition-colors">
        <button
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            activeView === 'home' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className={`w-6 h-6 ${activeView === 'home' ? 'fill-primary-500/20' : ''}`} />
          <span className="text-[10px] font-semibold">Home</span>
        </button>
        
        <button
          onClick={() => setShowReportModal(true)}
          className="relative group p-3 rounded-2xl shadow-lg transition-all hover:scale-110"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 dark:from-cyan-400 dark:via-indigo-500 dark:to-purple-500 rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 dark:from-cyan-400 dark:via-indigo-500 dark:to-purple-500 rounded-2xl"></div>
          <Plus className="w-6 h-6 text-white relative z-10 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <button
          onClick={() => setActiveView('profile')}
          className={`relative flex flex-col items-center justify-center space-y-1 transition-colors ${
            activeView === 'profile' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <User className={`w-6 h-6 ${activeView === 'profile' ? 'fill-primary-500/20' : ''}`} />
            {currentUser && issues.filter(i => i.createdBy === currentUser.uid && i.status !== 'Pending').length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950">
                {issues.filter(i => i.createdBy === currentUser.uid && i.status !== 'Pending').length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">My Issues</span>
        </button>
      </div>

      {/* Floating Raise Issue Button for Mobile screens (removed since we have bottom nav) */}

      {/* Render Report Modal */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleCreateIssue}
        />
      )}

      {/* Render Complaint Modal */}
      {selectedIssueForComplaint && (
        <ComplaintModal
          issue={selectedIssueForComplaint}
          onClose={() => setSelectedIssueForComplaint(null)}
        />
      )}

    </div>
  );
}
