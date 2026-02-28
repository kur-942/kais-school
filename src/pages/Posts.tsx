import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePostsStore } from '../store/postsStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploadService } from '../utils/imageUpload';

export const Posts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    posts, 
    comments, 
    isLoading, 
    error,
    fetchPosts, 
    fetchComments, 
    createPost,
    addComment,
    deleteComment,
    toggleLike,
    deletePost
  } = usePostsStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (user?.id) {
      fetchPosts(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (expandedPost) {
      fetchComments(expandedPost);
    }
  }, [expandedPost]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = ImageUploadService.validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!user?.id || !newPost.title || !newPost.content) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let imageUrl = null;
      let imagePublicId = null;

      if (selectedImage) {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 20, 90));
        }, 200);

        const uploadResult = await ImageUploadService.uploadImage(selectedImage);
        clearInterval(progressInterval);
        
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.id;
        setUploadProgress(100);
      }

      await createPost({
        user_id: user.id,
        title: newPost.title,
        content: newPost.content,
        image_url: imageUrl,
        image_public_id: imagePublicId
      });

      // Reset form
      setNewPost({ title: '', content: '' });
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreateModal(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!user?.id || !commentText.trim()) return;
    await addComment(postId, user.id, commentText);
    setCommentText('');
  };

  const handleDeleteComment = async (commentId: number, postId: number) => {
    if (window.confirm('Supprimer ce commentaire ?')) {
      await deleteComment(commentId, postId);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (window.confirm('Supprimer cette publication ?')) {
      await deletePost(postId);
      if (expandedPost === postId) {
        setExpandedPost(null);
      }
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Retour"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate">
                Discussions
              </h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-green-600 hover:to-green-700 transition-colors flex items-center gap-1.5 sm:gap-2 shadow-sm hover:shadow-md active:scale-95 transform"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden xs:inline">Nouvelle</span>
              <span className="xs:hidden">Nouveau</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs sm:text-sm"
          >
            {error}
          </motion.div>
        )}

        {isLoading && posts.length === 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 animate-pulse">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mb-1.5"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
              >
                {/* Post Header */}
                <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                        {post.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-800 truncate">{post.user_name}</h3>
                        <p className="text-xs text-gray-500 truncate">{post.user_niveau}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(post.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                      {post.user_id === user.id && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          aria-label="Supprimer"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Title */}
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mt-2 sm:mt-3 break-words">
                    {post.title}
                  </h2>
                  
                  {/* Post Content */}
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1.5 sm:mt-2 whitespace-pre-wrap break-words">
                    {post.content}
                  </p>

                  {/* Post Image */}
                  {post.image_url && (
                    <div className="mt-3 sm:mt-4 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full max-h-48 sm:max-h-64 lg:max-h-96 object-contain mx-auto"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gray-50 flex items-center gap-4 sm:gap-6">
                  <button
                    onClick={() => toggleLike(post.id, user.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 transition-colors ${
                      post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">{post.likes_count}</span>
                  </button>

                  <button
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">{post.comments_count}</span>
                  </button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {expandedPost === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100 bg-gray-50/50"
                    >
                      <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                        {/* Comments List */}
                        <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                          {(comments[post.id] || []).map((comment) => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-start gap-2 sm:gap-3 group"
                            >
                              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                                {comment.user_name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                                    {comment.user_name}
                                  </span>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                      {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit'
                                      })}
                                    </span>
                                    {comment.user_id === user.id && (
                                      <button
                                        onClick={() => handleDeleteComment(comment.id, post.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                                        aria-label="Supprimer"
                                      >
                                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 break-words">{comment.content}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Add Comment */}
                        <div className="flex flex-col xs:flex-row gap-2">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Écrire un commentaire..."
                            className="w-full xs:flex-1 px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-xs sm:text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentText.trim()}
                            className="w-full xs:w-auto px-4 sm:px-6 py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform"
                          >
                            Envoyer
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {posts.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-12"
              >
                <div className="inline-block p-3 sm:p-4 bg-green-50 rounded-full mb-3 sm:mb-4">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Aucune discussion</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 px-4">Soyez le premier à créer une discussion !</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 sm:px-6 py-2 bg-green-500 text-white rounded-lg text-sm sm:text-base hover:bg-green-600 transition-colors active:scale-95 transform"
                >
                  Créer une discussion
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Nouvelle discussion</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPost({ title: '', content: '' });
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm sm:text-base"
                    placeholder="Titre de la discussion"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Contenu</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm sm:text-base resize-none"
                    placeholder="Écrivez votre message..."
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Image (optionnelle)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {!imagePreview ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors"
                    >
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs sm:text-sm">Cliquez pour ajouter une image</span>
                    </button>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-32 sm:max-h-48 object-contain mx-auto rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-1 sm:space-y-2">
                    <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500">
                      Téléchargement... {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col xs:flex-row gap-2 pt-2 sm:pt-4">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewPost({ title: '', content: '' });
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="w-full xs:flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.title || !newPost.content || isUploading}
                    className="w-full xs:flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base active:scale-95 transform"
                  >
                    {isUploading ? 'Publication...' : 'Publier'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};