import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Sparkles, MapPin, Calendar, User, Eye, AlertCircle, CheckCircle, MessageSquare, Send, AtSign, X } from 'lucide-react';
import { Issue } from '../types';

interface IssueCardProps {
  key?: string;
  issue: Issue;
  currentUserId: string | null;
  onVote: (issueId: string, voteType: 'up' | 'down') => Promise<void> | void;
  onGenerateComplaint: (issue: Issue) => void;
  onAddComment?: (issueId: string, text: string) => void;
  userContributionCounts?: Record<string, number>;
}

const CATEGORY_COLORS = {
  vandalism: { bg: 'bg-rose-50 text-rose-700 border-rose-100', label: 'Vandalism' },
  infrastructure: { bg: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Infrastructure' },
  trash: { bg: 'bg-purple-50 text-purple-700 border-purple-100', label: 'Sanitation & Trash' },
  safety: { bg: 'bg-red-50 text-red-700 border-red-100', label: 'Public Safety' },
  positive: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Positive Update' }
};

const STATUS_COLORS = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Escalated: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200'
};

export default function IssueCard({ issue, currentUserId, onVote, onGenerateComplaint, onAddComment, userContributionCounts }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const getContributionBadge = (userId: string) => {
    const count = userContributionCounts?.[userId] || 0;
    if (count >= 10) return { label: 'Super Contributor', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' };
    if (count >= 3) return { label: 'Local Hero', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' };
    return { label: 'Newcomer', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' };
  };

  // Check if current user has already voted
  const userVote = currentUserId && issue.votedUsers ? issue.votedUsers[currentUserId] : null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && onAddComment) {
      onAddComment(issue.id, commentText.trim());
      setCommentText('');
      setShowTagDropdown(false);
    }
  };

  const taggableUsers = Array.from(new Set([
    issue.createdByName || 'Creator',
    ...(issue.comments || []).map(c => c.authorName)
  ])).filter(name => name !== currentUserId && name); // Basic filter

  const insertTag = (name: string) => {
    setCommentText(prev => `${prev}@${name} `);
    setShowTagDropdown(false);
  };

  const formatCommentText = (text: string) => {
    // Basic formatting to highlight @mentions
    const parts = text.split(/(@[\w\s]+)/);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-primary-600 dark:text-primary-400 font-semibold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div 
      className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
      id={`issue_card_${issue.id}`}
    >
      
      {/* Visual Header Image */}
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden group">
        {issue.imageUrl ? (
          <img 
            src={issue.imageUrl} 
            alt={issue.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700">
            <MapPin className="w-12 h-12 stroke-1" />
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[issue.category]?.bg || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
            {CATEGORY_COLORS[issue.category]?.label || 'General'}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[issue.status] || 'bg-slate-100'}`}>
            {issue.status}
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2.5">
          {/* Locality Block */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="truncate">{issue.locality}</span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base leading-snug hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {issue.title}
          </h3>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            {expanded ? issue.description : `${issue.description.substring(0, 110)}${issue.description.length > 110 ? '...' : ''}`}
            {issue.description.length > 110 && (
              <button 
                type="button" 
                onClick={() => setExpanded(!expanded)}
                className="text-primary-600 hover:text-primary-700 font-semibold ml-1 focus:outline-none"
              >
                {expanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </p>
        </div>

        {/* Reporter Meta & Voting Actions */}
        <div className="space-y-4 pt-3 border-t border-slate-50 dark:border-slate-800/50">
          
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <div className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="truncate font-medium text-slate-500 dark:text-slate-400">{issue.createdByName || 'Anonymous Hero'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{formatDate(issue.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Voting Component */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => onVote(issue.id, 'up')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                  userVote === 'up'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Upvote to raise urgency"
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${userVote === 'up' ? 'fill-current' : ''}`} />
                <span className="text-xs font-bold">{issue.upvotes}</span>
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

              <button
                type="button"
                onClick={() => onVote(issue.id, 'down')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                  userVote === 'down'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Downvote"
              >
                <ThumbsDown className={`w-3.5 h-3.5 ${userVote === 'down' ? 'fill-current' : ''}`} />
                <span className="text-xs font-bold">{issue.downvotes}</span>
              </button>
            </div>

            {/* Comment Toggle Button */}
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border transition-all ${
                showComments
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                  : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{issue.comments?.length || 0}</span>
            </button>
            
            {/* AI Generator Button */}
            <button
              type="button"
              id={`ai_draft_btn_${issue.id}`}
              onClick={() => onGenerateComplaint(issue)}
              className="flex-1 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1 border border-slate-900 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Generate Complaint</span>
              <span className="sm:hidden">AI</span>
            </button>
          </div>
        </div>

        {/* Comment Thread Section - Fixed Height overlay */}
        {showComments && (
          <div className="absolute inset-x-0 bottom-0 max-h-[85%] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-20 border-t border-slate-200 dark:border-slate-800 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.3)] flex flex-col rounded-b-3xl">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
               <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                 <MessageSquare className="w-3.5 h-3.5" />
                 Discussion
               </span>
               <button 
                  onClick={() => setShowComments(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
               >
                 <X className="w-3.5 h-3.5" />
               </button>
            </div>

            {/* Existing Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {(issue.comments || []).length === 0 ? (
                <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-xs italic">
                  No comments yet. Be the first to start the discussion!
                </div>
              ) : (
                (issue.comments || []).map((comment) => {
                  const badge = getContributionBadge(comment.authorId);
                  const isVerified = (userContributionCounts?.[comment.authorId] || 0) >= 3;
                  
                  return (
                    <div key={comment.id} className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            {comment.authorName}
                            {isVerified && (
                              <CheckCircle className="w-3 h-3 text-blue-500 fill-blue-500/20" />
                            )}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">
                          {new Date(comment.createdAt).toLocaleDateString('en-IN', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 break-words mt-1.5">{formatCommentText(comment.text)}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment Form */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
            {currentUserId ? (
              <form onSubmit={handleAddComment} className="flex gap-2 relative">
                <button
                  type="button"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="absolute left-2 top-1 bottom-1 p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
                  title="Tag someone"
                >
                  <AtSign className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-10 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                />
                <button 
                  type="submit" 
                  disabled={!commentText.trim()}
                  className="absolute right-1 top-1 bottom-1 p-1.5 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>

                {/* Tag Dropdown */}
                {showTagDropdown && taggableUsers.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20">
                    <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">
                      Mention User
                    </div>
                    <ul className="max-h-32 overflow-y-auto">
                      {taggableUsers.map((user, idx) => (
                        <li key={idx}>
                          <button
                            type="button"
                            onClick={() => insertTag(user)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                          >
                            @{user}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            ) : (
              <div className="text-center py-2 text-[10px] text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                Please log in to join the discussion.
              </div>
            )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
