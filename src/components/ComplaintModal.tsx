import React, { useState } from 'react';
import { Mail, Twitter, Copy, Check, X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Issue } from '../types';

interface ComplaintModalProps {
  issue: Issue;
  onClose: () => void;
}

export default function ComplaintModal({ issue, onClose }: ComplaintModalProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'tweet'>('email');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState('');
  const [tweetDraft, setTweetDraft] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedTweet, setCopiedTweet] = useState(false);

  React.useEffect(() => {
    let active = true;
    const fetchDraft = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/generate-complaint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: issue.title,
            description: issue.description,
            locality: issue.locality,
            category: issue.category
          }),
        });

        if (!response.ok) {
          throw new Error('Server returned an error generating your complaint.');
        }

        const data = await response.json();
        if (active) {
          setEmailDraft(data.emailDraft || '');
          setTweetDraft(data.tweetDraft || '');
        }
      } catch (err: any) {
        console.error(err);
        if (active) {
          setError(err.message || "Failed to contact complaint generator. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDraft();
    return () => {
      active = false;
    };
  }, [issue]);

  const handleCopy = (text: string, type: 'email' | 'tweet') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedTweet(true);
      setTimeout(() => setCopiedTweet(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" id="complaint_modal">
      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh] transition-colors">
        
        {/* Modal Header */}
        <div className="bg-slate-950 p-6 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="flex items-center space-x-3 z-10">
            <div className="bg-primary-500/25 border border-primary-500/30 p-2 rounded-xl text-primary-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">AI Civic Complaint Draftsman</h3>
              <p className="text-xs text-slate-400">Powered by Gemini • Real-time escalation drafting</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all z-10"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Issue Summary Context */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-sm transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Escalating Issue</span>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-1">{issue.title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">📍 {issue.locality}</p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
                <Sparkles className="w-5 h-5 text-primary-500 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium text-slate-800 dark:text-slate-200">Drafting professional escalations...</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Writing a high-impact municipal letter and public tweet</p>
              </div>
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-4">
              <div className="inline-flex bg-rose-50 p-3.5 rounded-full text-rose-600">
                <AlertCircle className="w-8 h-8" />
              </div>
              <p className="text-slate-700 text-sm font-medium">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Quick fake trigger to restart useEffect
                  onClose();
                }}
                className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-slate-800 transition-all"
              >
                Close & Retry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Tab Selector */}
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl transition-colors">
                <button
                  type="button"
                  id="tab_email_btn"
                  onClick={() => setActiveTab('email')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
                    activeTab === 'email' 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                  <span>Municipal Email</span>
                </button>
                <button
                  type="button"
                  id="tab_tweet_btn"
                  onClick={() => setActiveTab('tweet')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
                    activeTab === 'tweet' 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Twitter className="w-4 h-4 text-sky-500" />
                  <span>Twitter / X Alert</span>
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl bg-neutral-50 dark:bg-slate-900/50 overflow-hidden transition-colors">
                
                {/* Email Draft Area */}
                {activeTab === 'email' && (
                  <div className="p-5 font-sans">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Formal Complaint Draft</span>
                      <button
                        onClick={() => handleCopy(emailDraft, 'email')}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                          copiedEmail 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                      </button>
                    </div>
                    <pre className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed max-h-[300px] overflow-y-auto pr-2">
                      {emailDraft}
                    </pre>
                  </div>
                )}

                {/* Tweet Draft Area */}
                {activeTab === 'tweet' && (
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Public Campaign Tweet</span>
                      <button
                        onClick={() => handleCopy(tweetDraft, 'tweet')}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                          copiedTweet 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {copiedTweet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedTweet ? 'Copied!' : 'Copy Tweet'}</span>
                      </button>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative transition-colors">
                      <div className="flex space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 text-xs font-bold flex-shrink-0">
                          CH
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">Community Hero</span>
                            <span className="text-slate-400 text-xs">@CommunityHeroApp • Local</span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                            {tweetDraft}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                      <span>Character count: {tweetDraft.length}</span>
                      <span>Targeting municipal handles</span>
                    </div>

                  </div>
                )}

              </div>

              {/* Instructions / Tips */}
              <div className="bg-primary-50 dark:bg-primary-950/30 p-4 rounded-2xl border border-primary-100 dark:border-primary-800/50 text-xs text-primary-900 dark:text-primary-100 leading-relaxed flex items-start space-x-2.5 transition-colors">
                <Sparkles className="w-4.5 h-4.5 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">What should I do with this draft?</p>
                  <p className="mt-1 text-primary-800 dark:text-primary-200/80">
                    Copy the email draft to paste into your municipal portal, or copy the tweet draft to share on Twitter/X, tagging your local ward commissioner to demand accountability.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3 transition-colors">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
