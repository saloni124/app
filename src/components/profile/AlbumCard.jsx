import React from 'react';
import { MoreVertical, Edit3, Users, EyeOff, Eye, Trash2, FolderPlus, FolderMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AlbumCard({ album, isOwnProfile, onEdit, onToggleHidden, onChooseAudience, onDelete }) {
  const [showManageEntriesDialog, setShowManageEntriesDialog] = React.useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
      >
        <div className="flex w-full relative">
          {isOwnProfile && (
            <div className="absolute top-3 right-3 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(album)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    <span>Edit Album</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowManageEntriesDialog(true)}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    <span>Add Entries</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowManageEntriesDialog(true)}>
                    <FolderMinus className="mr-2 h-4 w-4" />
                    <span>Remove Entries</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChooseAudience(album)}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Choose Audience</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleHidden(album)}>
                    {album.is_hidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                    <span>{album.is_hidden ? 'Unhide Album' : 'Hide Album'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(album)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Album</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          <div className="w-24 md:w-32 flex-shrink-0">
            <img
              src={album.cover_image || 'https://images.pexels.com/photos/635279/pexels-photo-635279.jpeg?_gl=1*1p2yi1y*_ga*MTg1NjEyMTQxNS4xNzYzOTM2NDQ5*_ga_8JE65Q40S6*czE3NjM5MzY0NDgkbzEkZzEkdDE3NjM5MzY2MTAkajU5JGwwJGgww=400&h=400&fit=crop'}
              alt={album.title}
              className="mx-2 my-2 w-full h-40 object-cover rounded-xl border"
              onError={(e) => { e.target.src = 'https://images.pexels.com/photos/635279/pexels-photo-635279.jpeg?_gl=1*1p2yi1y*_ga*MTg1NjEyMTQxNS4xNzYzOTM2NDQ5*_ga_8JE65Q40S6*czE3NjM5MzY0NDgkbzEkZzEkdDE3NjM5MzY2MTAkajU5JGwwJGgww=400&h=400&fit=crop'; }}
            />
          </div>
          
          <div className="p-3 md:p-4 flex-1 flex flex-col min-w-0">
            <div className="flex-grow flex flex-col">
              <div className="px-1 pr-12">
                <h4 className="text-gray-900 text-base font-medium mb-1">
                  {album.title}
                </h4>
                {isOwnProfile && album.is_hidden && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 mb-2">
                    Hidden
                  </Badge>
                )}
                {album.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {album.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {album.entry_count || 0} {album.entry_count === 1 ? 'entry' : 'entries'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Manage Entries Coming Soon Dialog */}
      {showManageEntriesDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowManageEntriesDialog(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Feature Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              Managing album entries is coming soon! You'll be able to add and remove entries from your albums.
            </p>
            <Button onClick={() => setShowManageEntriesDialog(false)} className="w-full">
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}