import React from 'react';
import { Issue, UserProfile } from '../types';
import { Sparkles, Eye, ThumbsUp, MapPin, Calendar, Star, Cloud } from 'lucide-react';
import { motion } from 'motion/react';

interface MyProfileViewProps {
  issues: Issue[];
  currentUser: UserProfile;
}

export default function MyProfileView({ issues, currentUser }: MyProfileViewProps) {
  const userIssues = issues.filter(issue => issue.createdBy === currentUser.uid);

  return (
    <div className="mx-auto w-full flex-1 flex flex-col relative overflow-hidden min-h-[80vh] bg-transparent transition-colors duration-700">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 w-full flex flex-col space-y-8 relative z-10 pb-24">
      {/* Header section */}
      <div className="text-center space-y-4 py-8 relative">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-amber-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-indigo-200 dark:via-purple-200 dark:to-pink-200 tracking-tight inline-block relative z-10 dark:drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">
          My Reported Issues
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {userIssues.length === 0 ? (
          <div className="col-span-1 md:col-span-2 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white/50 dark:border-indigo-500/20 rounded-3xl p-12 text-center shadow-sm dark:shadow-[0_0_30px_rgba(79,70,229,0.1)]">
            <Sparkles className="w-8 h-8 text-amber-500 dark:text-indigo-400 mx-auto mb-4 animate-pulse" />
            <h3 className="font-display font-bold text-slate-800 dark:text-indigo-100 text-lg">No issues raised yet</h3>
            <p className="text-slate-600 dark:text-indigo-200/60 text-sm mt-2">
              Be the change in your neighborhood. Start reporting issues to see them here!
            </p>
          </div>
        ) : (
          userIssues.map(issue => (
            <div key={issue.id} className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-white dark:border-indigo-500/20 rounded-3xl p-5 shadow-sm hover:shadow-md dark:shadow-[0_0_15px_rgba(79,70,229,0.05)] dark:hover:shadow-[0_0_25px_rgba(236,72,153,0.15)] hover:border-amber-300 dark:hover:border-pink-500/30 transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
              {/* Image or placeholder */}
              <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-950/80 rounded-2xl mb-4 overflow-hidden">
                {issue.imageUrl ? (
                  <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-slate-300 dark:text-indigo-500/40" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-950/80 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-indigo-500/30 text-slate-700 dark:text-indigo-200 capitalize">
                  {issue.status}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <h3 className="font-display font-bold text-slate-900 dark:text-indigo-50 text-base line-clamp-1">{issue.title}</h3>
                <p className="text-slate-600 dark:text-indigo-200/60 text-xs flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{issue.locality}</span>
                </p>
                <p className="text-slate-500 dark:text-indigo-200/50 text-xs flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                </p>
              </div>

              {/* Stats Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-indigo-500/10 flex items-center justify-between text-xs text-slate-600 dark:text-indigo-200/70 font-medium">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5" title="Total Views">
                    <Eye className="w-4 h-4 text-primary-500 dark:text-cyan-400" />
                    <span>{issue.views || Math.floor(Math.random() * 500) + 10}</span>
                  </div>
                  <div className="flex items-center space-x-1.5" title="Community Upvotes">
                    <ThumbsUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>{issue.upvotes}</span>
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-indigo-950/50 border border-slate-200 dark:border-indigo-500/20 text-slate-600 dark:text-indigo-300 px-2 py-1 rounded-md text-[10px] uppercase tracking-wider">
                  {issue.category}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
