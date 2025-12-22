/**
 * Accuracy Feedback Component
 * ===========================
 *
 * Allows physicians to rate AI Scribe output accuracy.
 * Collects thumbs up/down and optional detailed feedback.
 *
 * Fase 12: AI Scribe Enhancement
 */

import React, { useState, useCallback } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  X,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
  type FeedbackType,
  type FeedbackRating,
} from '@/types/scribe-metrics';

/**
 * Props for AccuracyFeedback component.
 */
interface AccuracyFeedbackProps {
  /** Callback when feedback is submitted */
  onSubmit: (feedback: FeedbackData) => Promise<void>;
  /** Whether to show expanded feedback form */
  showExpanded?: boolean;
  /** Optional: pre-calculated edit percentage */
  editPercentage?: number;
  /** Optional: generation time in seconds */
  generationTimeSeconds?: number;
  /** Optional: review time in seconds */
  reviewTimeSeconds?: number;
  /** Compact mode (icons only) */
  compact?: boolean;
}

/**
 * Feedback data structure.
 */
export interface FeedbackData {
  type: FeedbackType;
  rating: FeedbackRating;
  categories: FeedbackCategory[];
  comment?: string;
}

/**
 * Positive feedback categories.
 */
const POSITIVE_CATEGORIES: FeedbackCategory[] = [
  'accuracy',
  'completeness',
  'time_saved',
  'formatting',
];

/**
 * Negative feedback categories.
 */
const NEGATIVE_CATEGORIES: FeedbackCategory[] = [
  'hallucination',
  'missing_info',
  'clinical_accuracy',
  'formatting',
];

/**
 * Accuracy Feedback component.
 */
export const AccuracyFeedback: React.FC<AccuracyFeedbackProps> = ({
  onSubmit,
  showExpanded = false,
  compact = false,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [rating, setRating] = useState<FeedbackRating>(3);
  const [selectedCategories, setSelectedCategories] = useState<FeedbackCategory[]>([]);
  const [comment, setComment] = useState('');
  const [showDetails, setShowDetails] = useState(showExpanded);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleThumbsClick = useCallback((type: FeedbackType) => {
    setFeedbackType(type);
    setRating(type === 'positive' ? 5 : 2);
    setSelectedCategories([]);
    setComment('');
    setShowDetails(true);
  }, []);

  const toggleCategory = useCallback((category: FeedbackCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!feedbackType) return;

    setSubmitting(true);
    try {
      await onSubmit({
        type: feedbackType,
        rating,
        categories: selectedCategories,
        comment: comment.trim() || undefined,
      });
      setSubmitted(true);
      setShowDetails(false);
    } finally {
      setSubmitting(false);
    }
  }, [feedbackType, rating, selectedCategories, comment, onSubmit]);

  const handleQuickFeedback = useCallback(
    async (type: FeedbackType) => {
      setSubmitting(true);
      try {
        await onSubmit({
          type,
          rating: type === 'positive' ? 5 : 2,
          categories: [],
        });
        setSubmitted(true);
        setFeedbackType(type);
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmit]
  );

  const handleClose = useCallback(() => {
    setShowDetails(false);
    setFeedbackType(null);
  }, []);

  // Submitted state
  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span>Obrigado pelo feedback!</span>
      </div>
    );
  }

  // Compact mode - icons only
  if (compact && !showDetails) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleQuickFeedback('positive')}
          disabled={submitting}
          className={`p-1.5 rounded-lg transition-colors ${
            feedbackType === 'positive'
              ? 'bg-green-100 text-green-600'
              : 'hover:bg-gray-100 text-gray-400 hover:text-green-600'
          }`}
          title="Útil"
        >
          <ThumbsUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleQuickFeedback('negative')}
          disabled={submitting}
          className={`p-1.5 rounded-lg transition-colors ${
            feedbackType === 'negative'
              ? 'bg-red-100 text-red-600'
              : 'hover:bg-gray-100 text-gray-400 hover:text-red-600'
          }`}
          title="Não útil"
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowDetails(true)}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          title="Dar feedback detalhado"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quick feedback buttons */}
      {!showDetails && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Esta nota foi útil?</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleThumbsClick('positive')}
              disabled={submitting}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                feedbackType === 'positive'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              Sim
            </button>
            <button
              onClick={() => handleThumbsClick('negative')}
              disabled={submitting}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                feedbackType === 'negative'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              Não
            </button>
          </div>
        </div>
      )}

      {/* Expanded feedback form */}
      {showDetails && feedbackType && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {feedbackType === 'positive' ? '👍 O que foi bom?' : '👎 O que pode melhorar?'}
            </h4>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {(feedbackType === 'positive' ? POSITIVE_CATEGORIES : NEGATIVE_CATEGORIES).map(
              (category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategories.includes(category)
                      ? feedbackType === 'positive'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {FEEDBACK_CATEGORY_LABELS[category]}
                </button>
              )
            )}
          </div>

          {/* Optional comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentário adicional (opcional)..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Feedback
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccuracyFeedback;

