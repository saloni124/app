
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, X, Plus, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhotoGallery({ 
  imageList, 
  eventName, 
  canAddPhotos, 
  onImageUpload, 
  isUploading, 
  currentUser,
  onImageDelete,
  isDeleting,
  imageMetadata = [] // Array of metadata for each image including uploader info
}) {
    const allImages = imageList || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    const openModal = (index) => {
        setSelectedImageIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const nextImage = (e) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const handleFileUpload = (e) => {
        if (onImageUpload) {
            onImageUpload(e);
        }
    };

    const handleDeleteClick = (e, imageUrl, index) => {
        e.stopPropagation();
        setImageToDelete({ url: imageUrl, index });
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (imageToDelete && onImageDelete) {
            onImageDelete(imageToDelete.url, imageToDelete.index);
        }
        setShowDeleteConfirm(false);
        setImageToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setImageToDelete(null);
    };

    // Check if user can delete a specific image (only their own photos)
    const canDeleteImage = (index) => {
        if (!currentUser || !onImageDelete || !imageMetadata || !imageMetadata[index]) {
            return false;
        }
        
        const imageMeta = imageMetadata[index];
        // A user can delete an image if their email matches the uploader's email in the metadata.
        return imageMeta.uploaded_by === currentUser.email;
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-2">
                {allImages.map((image, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
                        onClick={() => openModal(index)}
                    >
                        <img
                            src={image}
                            alt={`${eventName} photo ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Delete button - only show for user's own photos */}
                        {canDeleteImage(index) && (
                            <button
                                onClick={(e) => handleDeleteClick(e, image, index)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete photo"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </motion.div>
                ))}
                
                {/* Add Photo Button */}
                {canAddPhotos && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: allImages.length * 0.1 }}
                        className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-center group"
                    >
                        <label className="cursor-pointer w-full h-full flex items-center justify-center">
                            {isUploading ? (
                                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                            ) : (
                                <div className="text-center">
                                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mx-auto mb-1" />
                                    <span className="text-xs text-gray-500 group-hover:text-blue-600 font-medium">Add Photo</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={isUploading}
                            />
                        </label>
                    </motion.div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center text-center p-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Photo</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this photo? This action cannot be undone.</p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={cancelDelete}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Modal */}
            {allImages.length > 0 && (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl p-0 bg-black">
                        <div className="relative">
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            {/* Delete button in modal - only for user's own photos */}
                            {canDeleteImage(selectedImageIndex) && (
                                <button
                                    onClick={(e) => handleDeleteClick(e, allImages[selectedImageIndex], selectedImageIndex)}
                                    className="absolute top-4 right-16 z-10 w-8 h-8 bg-red-500/70 hover:bg-red-600/70 rounded-full flex items-center justify-center text-white transition-colors"
                                    title="Delete photo"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                            
                            <div className="relative h-[80vh] flex items-center justify-center">
                                <img
                                    src={allImages[selectedImageIndex]}
                                    alt={`${eventName} photo ${selectedImageIndex + 1}`}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
