import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Star, CheckCircle2, AlertTriangle, X, HeartHandshake,
  MessageSquare, Sparkles
} from 'lucide-react';

const QUICK_TAGS = [
  'Punctual & Prompt',
  'Master Workmanship',
  'Fair Standard Tariff',
  'Clean & Safe Work',
  'Polite & Courteous',
  'Explained Everything Well',
];

export default function ReviewModal({ isOpen, booking, onClose, onReviewSubmitted, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Punctual & Prompt', 'Master Workmanship']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;
  if (!booking) return null;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullComment = selectedTags.length > 0
      ? `${selectedTags.join(', ')}. ${comment}`.trim()
      : comment.trim();

    try {
      const res = await api.submitReview({
        bookingId: booking.id,
        rating,
        comment: fullComment || 'Excellent cooperative service!',
      });
      setSubmitted(true);
      if (onReviewSubmitted) onReviewSubmitted(res);
      if (onSuccess) onSuccess(res);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Review submit failed:', err);
      setError(err.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-blue-900" />
            <h3 className="font-bold text-sm text-blue-950">Rate Cooperative Service</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 size={40} className="mx-auto text-emerald-600 animate-bounce" />
            <h4 className="font-bold text-base text-gray-900">Thank you for your feedback!</h4>
            <p className="text-xs text-gray-500">Your review helps maintain the highest standards of artisan quality.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <span className="text-xs text-gray-500 block mb-1">Artisan: <strong>{booking.worker_name}</strong></span>
              <div className="flex justify-center gap-2 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-amber-400 hover:scale-110 transition"
                  >
                    <Star
                      size={28}
                      className={
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tags */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                What went well?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        isSelected
                          ? 'bg-blue-950 text-white border-blue-950 font-bold'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Additional Comments (Optional)
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full p-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-sm font-bold"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
