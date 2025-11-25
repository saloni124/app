
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, MoreVertical, Pin, Trash2, Edit3, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function SceneCommentsModal({ isOpen, onClose, postId, postTitle, postImage, currentUser, organizerEmail }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const inputRef = useRef(null); // inputRef is still used for focusing
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission status

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('comments-modal-open');

      // Sample comments data
      const sampleComments = [
      {
        id: '1',
        user_name: 'Sarah Chen',
        user_email: 'sarah@example.com',
        user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop',
        text: 'This looks amazing! Count me in 🎉',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        liked_by: [],
        replies: [
        {
          id: 'reply_1',
          user_name: 'Maya Patel',
          user_email: 'maya@example.com',
          user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop',
          text: 'Same here! See you there!',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          likes: 3,
          liked_by: [],
          pinned: true
        }],

        pinned: true
      },
      {
        id: '2',
        user_name: 'Marcus Johnson',
        user_email: 'marcus@example.com',
        user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
        text: 'Can\'t wait! The vibes are always perfect at these events',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        liked_by: [],
        replies: [
        {
          id: 'reply_2',
          user_name: 'Jordan Kim',
          user_email: 'jordan@example.com',
          user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
          text: 'Absolutely! Last time was incredible',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes: 2,
          liked_by: [],
          pinned: false
        },
        {
          id: 'reply_3',
          user_name: 'Alex Rivera',
          user_email: 'alex@example.com',
          user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
          text: 'For real! Can\'t miss this one',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          likes: 1,
          liked_by: [],
          pinned: false
        }],

        pinned: false
      },
      {
        id: '3',
        user_name: 'Alex Rivera',
        user_email: 'alex@example.com',
        user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
        text: 'Who else is going? Would love to meet some new people!',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 5,
        liked_by: [],
        replies: [],
        pinned: false
      }];


      setComments(sampleComments);
    } else {
      document.body.classList.remove('comments-modal-open');
    }

    return () => {
      document.body.classList.remove('comments-modal-open');
    };
  }, [isOpen]);

  const handlePinComment = (commentId) => {
    setComments((prevComments) => prevComments.map((comment) => {
      // Check if it's a top-level comment
      if (comment.id === commentId) {
        return { ...comment, pinned: !comment.pinned };
      }
      // Check if it's a reply
      if (comment.replies && comment.replies.some((r) => r.id === commentId)) {
        return {
          ...comment,
          replies: comment.replies.map((reply) =>
          reply.id === commentId ? { ...reply, pinned: !reply.pinned } : reply
          )
        };
      }
      return comment;
    }));
  };

  const handleDeleteComment = (idToDelete) => {
    setComments((prevComments) => {
      // First, try to delete a top-level comment
      const newComments = prevComments.filter((c) => c.id !== idToDelete);
      if (newComments.length < prevComments.length) {
        return newComments; // A top-level comment was deleted
      }

      // If not a top-level comment, check if it's a reply and delete it from its parent
      return prevComments.map((comment) => {
        if (comment.replies && comment.replies.some((r) => r.id === idToDelete)) {
          return {
            ...comment,
            replies: comment.replies.filter((r) => r.id !== idToDelete)
          };
        }
        return comment;
      });
    });
  };

  const handleEditComment = (idToEdit) => {
    let commentToEdit = null;

    // Try to find in top-level comments
    commentToEdit = comments.find((c) => c.id === idToEdit);

    // If not found, search in replies
    if (!commentToEdit) {
      for (const comment of comments) {
        if (comment.replies) {
          commentToEdit = comment.replies.find((r) => r.id === idToEdit);
          if (commentToEdit) break;
        }
      }
    }

    if (commentToEdit) {
      setNewComment(commentToEdit.text);
      setEditingCommentId(idToEdit);
      setReplyTo(null); // Clear reply context when editing
      inputRef.current?.focus();
    }
  };

  const handleReportComment = (commentId) => {
    alert('Comment reported. We will review it shortly.');
  };

  const handleLikeComment = (idToLike) => {
    setComments((prevComments) => prevComments.map((comment) => {
      // Check if it's a top-level comment
      if (comment.id === idToLike) {
        const liked = comment.liked_by?.includes(currentUser?.email);
        return {
          ...comment,
          likes: liked ? comment.likes - 1 : comment.likes + 1,
          liked_by: liked ?
          comment.liked_by.filter((email) => email !== currentUser?.email) :
          [...(comment.liked_by || []), currentUser?.email]
        };
      }
      // Check if it's a reply
      if (comment.replies && comment.replies.some((r) => r.id === idToLike)) {
        return {
          ...comment,
          replies: comment.replies.map((reply) => {
            if (reply.id === idToLike) {
              const liked = reply.liked_by?.includes(currentUser?.email);
              return {
                ...reply,
                likes: liked ? reply.likes - 1 : reply.likes + 1,
                liked_by: liked ?
                reply.liked_by.filter((email) => email !== currentUser?.email) :
                [...(reply.liked_by || []), currentUser?.email]
              };
            }
            return reply;
          })
        };
      }
      return comment;
    }));
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.justAdded && !b.justAdded) return -1;
    if (!a.justAdded && b.justAdded) return 1;
    return (b.likes || 0) - (a.likes || 0);
  });

  // Consolidated handler for adding new comments/replies and saving edits
  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingCommentId) {
        setComments((prev) => prev.map((c) => {
          if (c.id === editingCommentId) {// Top-level comment
            return { ...c, text: newComment.trim() };
          }
          // Check replies
          if (c.replies && c.replies.some((r) => r.id === editingCommentId)) {
            return {
              ...c,
              replies: c.replies.map((r) =>
              r.id === editingCommentId ? { ...r, text: newComment.trim() } : r
              )
            };
          }
          return c;
        }));
        setEditingCommentId(null);
        setReplyTo(null); // Clear replyTo when editing is done
      } else {
        const commentData = {
          id: `comment_${Date.now()}`,
          user_name: currentUser?.full_name || 'Anonymous',
          user_email: currentUser?.email || 'anonymous@example.com',
          user_avatar: currentUser?.avatar || '',
          text: newComment.trim(),
          timestamp: new Date().toISOString(),
          likes: 0,
          liked_by: [],
          replies: [],
          pinned: false,
          justAdded: true
        };

        if (replyTo) {
          setComments((prev) => prev.map((c) =>
          c.id === replyTo.id ?
          { ...c, replies: [...(c.replies || []), commentData] } :
          c
          ));
          setReplyTo(null);
        } else {
          setComments((prev) => [commentData, ...prev]);
        }
      }
      setNewComment('');
    } catch (error) {
      console.error("Failed to process comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setComments((prev) => prev.map((c) => ({ ...c, justAdded: false })));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen &&
      <>
          {/* Backdrop for the modal */}
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[300]" // Updated z-index and opacity
          onClick={onClose} />


          {/* Main modal content */}
          <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }} className="bg-white rounded-lg fixed bottom-0 left-0 right-0 z-[301] flex flex-col md:w-[375px] md:max-w-[375px] md:rounded-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2"
          // Updated positioning and responsiveness
          style={{ maxHeight: '75vh' }} // Updated max height
          onClick={(e) => e.stopPropagation()}>

            <div className="px-4 py-3 rounded-none flex items-center justify-center border-b border-gray-200 h-14 relative">
              <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
              <button
              onClick={onClose}
              className="absolute right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">

                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-4 py-2"> {/* Updated padding */}
              {sortedComments.length === 0 ?
            <div className="text-center py-8 text-gray-500">
                  <p>No comments yet. Be the first to comment!</p>
                </div> :

            sortedComments.map((comment) => {
              const isPostOwner = currentUser?.email === organizerEmail;
              const isMyComment = currentUser?.email === comment.user_email;

              return (
                <div key={comment.id} className="flex gap-3 py-2"> {/* Added vertical padding for comments */}
                      <img
                    src={comment.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_name)}`}
                    alt={comment.user_name}
                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover" /> {/* Added object-cover */}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-gray-900">{comment.user_name}</span>
                              {comment.pinned && <Pin className="w-3 h-3 text-blue-500" />}
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true })}</span>
                              <button
                            className="hover:text-gray-700"
                            onClick={() => {
                              setReplyTo(comment);
                              setEditingCommentId(null); // Clear editing state when replying
                              inputRef.current?.focus();
                            }}>

                                Reply
                              </button>
                              <button
                            onClick={() => handleLikeComment(comment.id)}
                            className="flex items-center gap-1 hover:text-red-500 transition-colors">

                                <Heart className={`w-3 h-3 ${comment.liked_by?.includes(currentUser?.email) ? 'fill-red-500 text-red-500' : ''}`} />
                                {comment.likes > 0 && <span>{comment.likes}</span>}
                              </button>
                            </div>
                          </div>

                          {/* Three dots dropdown for main comments */}
                          <div className="relative">
                            <button
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === comment.id ? null : comment.id);
                          }}>

                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>

                            {openDropdown === comment.id &&
                        <>
                                <div
                            className="fixed inset-0 z-[105]"
                            onClick={() => setOpenDropdown(null)} />

                                <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[190px] z-[110]"
                            onClick={(e) => e.stopPropagation()}>

                                  {isPostOwner && !isMyComment &&
                            <>
                                      <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinComment(comment.id);
                                  setOpenDropdown(null);
                                }}>

                                        <Pin className="w-4 h-4" />
                                        {comment.pinned ? 'Unpin' : 'Pin'} Comment
                                      </button>
                                      <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComment(comment.id);
                                  setOpenDropdown(null);
                                }}>

                                        <Trash2 className="w-4 h-4" />
                                        Delete Comment
                                      </button>
                                    </>
                            }
                                  {isMyComment &&
                            <>
                                      {isPostOwner &&
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinComment(comment.id);
                                  setOpenDropdown(null);
                                }}>

                                          <Pin className="w-4 h-4" />
                                          {comment.pinned ? 'Unpin' : 'Pin'} Comment
                                        </button>
                              }
                                      <button
                                className="text-slate-950 px-4 py-2 text-sm text-left w-full hover:bg-gray-100 flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditComment(comment.id);
                                  setOpenDropdown(null);
                                }}>

                                        <Edit3 className="w-4 h-4" />
                                        Edit Comment
                                      </button>
                                      <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComment(comment.id);
                                  setOpenDropdown(null);
                                }}>

                                        <Trash2 className="w-4 h-4" />
                                        Delete Comment
                                      </button>
                                    </>
                            }
                                  {!isMyComment && !isPostOwner &&
                            <button
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReportComment(comment.id);
                                setOpenDropdown(null);
                              }}>

                                      <Flag className="w-4 h-4" />
                                      Report Comment
                                    </button>
                            }
                                </motion.div>
                              </>
                        }
                          </div>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 &&
                    <div className="mt-3 space-y-3 pl-4">
                            {[...comment.replies].
                      sort((a, b) => {
                        // Pinned replies first
                        if (a.pinned && !b.pinned) return -1;
                        if (!a.pinned && b.pinned) return 1;
                        return 0;
                      }).
                      map((reply) => {
                        const isMyReply = currentUser?.email === reply.user_email;

                        return (
                          <div key={reply.id} className="flex gap-2">
                                    <img
                              src={reply.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user_name)}`}
                              alt={reply.user_name}
                              className="w-6 h-6 rounded-full flex-shrink-0 object-cover" />

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-gray-900">{reply.user_name}</span>
                                            {reply.pinned && <Pin className="w-3 h-3 text-blue-500" />}
                                          </div>
                                          <p className="text-sm text-gray-700 mt-0.5">{reply.text}</p>
                                          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                                            <span>{formatDistanceToNow(parseISO(reply.timestamp), { addSuffix: true })}</span>
                                            <button
                                      className="hover:text-gray-700"
                                      onClick={() => {
                                        setReplyTo(comment); // Reply to the parent comment
                                        setEditingCommentId(null); // Clear editing state when replying
                                        inputRef.current?.focus();
                                      }}>

                                              Reply
                                            </button>
                                            <button
                                      onClick={() => handleLikeComment(reply.id)}
                                      className="flex items-center gap-1 hover:text-red-500 transition-colors">

                                              <Heart className={`w-3 h-3 ${reply.liked_by?.includes(currentUser?.email) ? 'fill-red-500 text-red-500' : ''}`} />
                                              {reply.likes > 0 && <span>{reply.likes}</span>}
                                            </button>
                                          </div>
                                        </div>

                                        {/* Three dots for replies */}
                                        <div className="relative">
                                          <button
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdown(openDropdown === reply.id ? null : reply.id);
                                    }}>

                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                          </button>

                                          {openDropdown === reply.id &&
                                  <>
                                              <div
                                      className="fixed inset-0 z-[105]"
                                      onClick={() => setOpenDropdown(null)} />

                                              <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[190px] z-[110]"
                                      onClick={(e) => e.stopPropagation()}>

                                                {isPostOwner && !isMyReply &&
                                      <>
                                                    <button
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePinComment(reply.id);
                                            setOpenDropdown(null);
                                          }}>

                                                      <Pin className="w-4 h-4" />
                                                      {reply.pinned ? 'Unpin' : 'Pin'} Comment
                                                    </button>
                                                    <button
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteComment(reply.id);
                                            setOpenDropdown(null);
                                          }}>

                                                      <Trash2 className="w-4 h-4" />
                                                      Delete Comment
                                                    </button>
                                                  </>
                                      }
                                                {isMyReply &&
                                      <>
                                                    {isPostOwner &&
                                        <button
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePinComment(reply.id);
                                            setOpenDropdown(null);
                                          }}>

                                                        <Pin className="w-4 h-4" />
                                                        {reply.pinned ? 'Unpin' : 'Pin'} Comment
                                                      </button>
                                        }
                                                    <button
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditComment(reply.id);
                                            setOpenDropdown(null);
                                          }}>

                                                      <Edit3 className="w-4 h-4" />
                                                      Edit
                                                    </button>
                                                    <button
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteComment(reply.id);
                                            setOpenDropdown(null);
                                          }}>

                                                      <Trash2 className="w-4 h-4" />
                                                      Delete
                                                    </button>
                                                  </>
                                      }
                                                {!isMyReply && !isPostOwner &&
                                      <button
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReportComment(reply.id);
                                          setOpenDropdown(null);
                                        }}>

                                                    <Flag className="w-4 h-4" />
                                                    Report
                                                  </button>
                                      }
                                              </motion.div>
                                            </>
                                  }
                                        </div>
                                      </div>
                                    </div>
                                  </div>);

                      })}
                          </div>
                    }
                      </div>
                    </div>);

            })
            }
            </div>

            {/* Reply To section, if active and not editing */}
            {replyTo && !editingCommentId &&
          <div className="text-xs text-gray-500 mb-2 px-4 flex justify-between items-center">
                <span>Replying to <span className="font-semibold text-gray-700">@{replyTo.user_name}</span></span>
                <button type="button" onClick={() => setReplyTo(null)} className="p-1 rounded-full hover:bg-gray-100">
                  <X className="w-3 h-3" />
                </button>
              </div>
          }

            {/* Add Comment Input with Profile Pic */}
            <div className="bg-white mb-1 px-3 py-2 flex-shrink-0 border-t border-gray-200">
              <div className="mb-3 flex items-center gap-3">
                <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop'}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0" />

                <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={editingCommentId ? "Edit your comment..." : replyTo ? `Replying to ${replyTo.user_name}...` : "Add a comment..."}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newComment.trim()) {
                    e.preventDefault(); // Prevent default form submission or newline
                    handleAddComment();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                <button
                type="button" // Important: changed type to "button" since not inside a <form>
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors">

                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}