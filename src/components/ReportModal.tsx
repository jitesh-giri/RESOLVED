import React, { useState, useRef } from 'react';
import { X, Camera, AlertCircle, Sparkles, Plus, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';
import { Issue } from '../types';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (issueData: Omit<Issue, 'id' | 'upvotes' | 'downvotes' | 'status' | 'createdAt' | 'createdBy' | 'createdByName' | 'votedUsers'>) => Promise<void>;
}

const PRESET_IMAGES = [
  {
    name: 'Pothole/Road',
    url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Garbage/Trash',
    url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Broken Pipe/Water',
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Vandalism/Graffiti',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Park/Positive',
    url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=800'
  }
];

export default function ReportModal({ onClose, onSubmit }: ReportModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Issue['category']>('infrastructure');
  const [locality, setLocality] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);

    setAnalyzingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        try {
          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64String,
              mimeType: file.type
            })
          });

          if (!response.ok) {
            throw new Error('Failed to analyze image');
          }

          const data = await response.json();
          if (data.analysis) {
            setDescription(prev => prev ? `${prev}\n\n[Image Analysis]: ${data.analysis}` : data.analysis);
          }
        } catch (error) {
          console.error("Analysis error:", error);
          setError("Failed to analyze image with AI.");
        } finally {
          setAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setAnalyzingImage(false);
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locality.trim() || !description.trim()) {
      setError('Please fill in all required fields (Title, Locality, and Description).');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Default image if none provided
    const finalImageUrl = imageUrl.trim() || PRESET_IMAGES[0].url;

    try {
      await onSubmit({
        title: title.trim(),
        category,
        locality: locality.trim(),
        description: description.trim(),
        imageUrl: finalImageUrl
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while saving the issue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" id="report_modal">
      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh] transition-colors">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">Report an Issue</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add detailed information to alert your neighbors</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Issue Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Blocked Main Road Drainage Channel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              required
            />
          </div>

          {/* Category & Locality row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Issue['category'])}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-slate-900 transition-all text-sm text-slate-800 dark:text-slate-100"
              >
                <option value="infrastructure">Infrastructure Damage</option>
                <option value="safety">Public Safety Hazard</option>
                <option value="trash">Sanitation & Trash</option>
                <option value="vandalism">Vandalism / Property Issue</option>
                <option value="positive">Positive Community Update</option>
              </select>
            </div>

            {/* Locality */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Locality / Area <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Bandra West, Mumbai"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              placeholder="Describe the severity, duration, and local impacts of this concern..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              required
            />
          </div>

          {/* Image Upload/Preset Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Visual Reference Image
              </label>
              {analyzingImage && (
                <div className="flex items-center text-primary-600 dark:text-primary-400 text-[10px] font-semibold animate-pulse space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Analyzing with AI...</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzingImage}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Analyze</span>
              </button>
              <div className="hidden sm:flex items-center justify-center text-slate-400 text-xs font-medium">OR</div>
              <input
                type="url"
                placeholder="Paste external image URL (Optional)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Or choose from sandbox stock illustrations:</span>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_IMAGES.map((img) => (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => setImageUrl(img.url)}
                    className={`relative rounded-lg overflow-hidden h-11 border-2 transition-all ${
                      imageUrl === img.url ? 'border-primary-500 scale-95 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[8px] text-white font-medium text-center px-0.5 leading-tight">
                      {img.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* AI Helper Banner */}
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 p-3.5 rounded-2xl flex items-start space-x-2.5">
            <Sparkles className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed">
              <span className="font-semibold block">AI Automation Enabled</span>
              Once reported, any resident can generate professionally formatted complaint letters or official tweets based on your details.
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3 transition-colors">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="report_submit_btn"
              disabled={submitting}
              className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-sm rounded-xl shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-60"
            >
              <span>{submitting ? 'Reporting...' : 'Publish Issue'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
