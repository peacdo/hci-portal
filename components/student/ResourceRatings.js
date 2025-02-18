import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    addResourceRating,
    getResourceRatings,
    addResourceComment,
    getResourceComments,
    addCommentReply,
    likeComment
} from '../../lib/resourceService';
import {
    Star,
    MessageSquare,
    ThumbsUp,
    Reply,
    Send,
    AlertTriangle,
    Loader
} from 'lucide-react';

const ResourceRatings = ({ courseId, moduleId, resourceId }) => {
    const { user } = useAuth();
    const [ratings, setRatings] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);

    useEffect(() => {
        fetchRatingsAndComments();
    }, [courseId, moduleId, resourceId]);

    const fetchRatingsAndComments = async () => {
        try {
            setLoading(true);
            const [fetchedRatings, fetchedComments] = await Promise.all([
                getResourceRatings(courseId, moduleId, resourceId),
                getResourceComments(courseId, moduleId, resourceId)
            ]);
            
            setRatings(fetchedRatings);
            setComments(fetchedComments);
            
            const userRating = fetchedRatings.find(r => r.userId === user.uid)?.rating || 0;
            setUserRating(userRating);
            
            const total = fetchedRatings.length;
            const average = total > 0
                ? fetchedRatings.reduce((sum, r) => sum + r.rating, 0) / total
                : 0;
            setAverageRating(average);
            setTotalRatings(total);
        } catch (err) {
            setError('Failed to fetch ratings and comments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRating = async (rating) => {
        try {
            await addResourceRating(courseId, moduleId, resourceId, user.uid, rating);
            setUserRating(rating);
            fetchRatingsAndComments();
        } catch (err) {
            console.error('Failed to add rating:', err);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await addResourceComment(courseId, moduleId, resourceId, user.uid, newComment.trim());
            setNewComment('');
            fetchRatingsAndComments();
        } catch (err) {
            console.error('Failed to add comment:', err);
        }
    };

    const handleAddReply = async (commentId) => {
        if (!replyText.trim()) return;

        try {
            await addCommentReply(courseId, moduleId, resourceId, commentId, user.uid, replyText.trim());
            setReplyingTo(null);
            setReplyText('');
            fetchRatingsAndComments();
        } catch (err) {
            console.error('Failed to add reply:', err);
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            await likeComment(courseId, moduleId, resourceId, commentId, user.uid);
            fetchRatingsAndComments();
        } catch (err) {
            console.error('Failed to like comment:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Rating Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-medium">Resource Rating</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'} •{' '}
                            {averageRating.toFixed(1)} average
                        </p>
                    </div>
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                                key={rating}
                                onClick={() => handleRating(rating)}
                                className={`p-1 hover:scale-110 transition-transform ${
                                    rating <= userRating
                                        ? 'text-yellow-400 dark:text-yellow-300'
                                        : 'text-gray-300 dark:text-gray-600'
                                }`}
                                title={`Rate ${rating} stars`}
                            >
                                <Star className="h-6 w-6 fill-current" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Comments</h3>
                
                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex space-x-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-gray-900 dark:text-white">
                                        {comment.comment}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(comment.timestamp?.toDate()).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleLikeComment(comment.id)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                        <span className="ml-1 text-sm">{comment.likes}</span>
                                    </button>
                                    <button
                                        onClick={() => setReplyingTo(comment.id)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                    >
                                        <Reply className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Replies */}
                            {comment.replies?.length > 0 && (
                                <div className="ml-8 space-y-2">
                                    {comment.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                                        >
                                            <p className="text-gray-900 dark:text-white">
                                                {reply.reply}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(reply.timestamp?.toDate()).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Form */}
                            {replyingTo === comment.id && (
                                <div className="ml-8 flex space-x-2">
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Add a reply..."
                                        className="flex-1 px-3 py-1 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                    />
                                    <button
                                        onClick={() => handleAddReply(comment.id)}
                                        disabled={!replyText.trim()}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {comments.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No comments yet. Be the first to comment!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResourceRatings; 