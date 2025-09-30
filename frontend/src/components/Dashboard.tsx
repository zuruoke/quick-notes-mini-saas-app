import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../contexts/AuthContext';
import { Plus, Search, Edit, Trash2, LogOut, User, Sparkles, Filter } from 'lucide-react';
import NoteModal from './NoteModal';


interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const notesPerPage = 10;

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, [currentPage, searchTerm, selectedTags]);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm, selectedTags]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: notesPerPage.toString(),
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      
      const response = await api.get(`/notes?${params}`);
      setNotes(response.data.notes);
      setTotalPages(Math.ceil(response.data.total / notesPerPage));
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/notes/tags');
      setAllTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const filterNotes = () => {
    let filtered = notes;
    
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter((note) =>
        selectedTags.every((tag) => note.tags.includes(tag))
      );
    }
    
    setFilteredNotes(filtered);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.delete(`/notes/${noteId}`);
        fetchNotes();
        fetchTags();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleNoteSaved = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    fetchNotes();
    fetchTags();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 relative overflow-hidden mobile-px-4">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-neutral-200/50 sticky top-0 z-40 mobile-px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mobile-px-4 mobile-py-6">
          <div className="flex justify-between items-center h-16 mobile-flex-col mobile-space-y-4">
            <div className="flex items-center space-x-4 mobile-w-full mobile-justify-between">
              <div className="flex items-center space-x-3 mobile-w-full mobile-justify-center">
                <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl mobile-text-xl font-bold gradient-text">QuickNotes</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-neutral-100/50 rounded-full mobile-hidden">
                <div className="h-8 w-8 bg-gradient-to-br from-primary-400 to-success-400 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm mobile-text-sm font-medium text-neutral-700">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="btn-secondary group flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mobile-px-4 mobile-py-6">
        {/* Controls */}
        <div className="mb-8 space-y-6 mobile-space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mobile-flex-col mobile-items-stretch mobile-space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md mobile-w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search your notes..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field pl-12 bg-white/70 backdrop-blur-sm border-neutral-200/50 focus:bg-white transition-all duration-200 mobile-w-full"
                />
              </div>
              
              {/* Add Note Button */}
              <button
                onClick={handleCreateNote}
                className="btn-primary group flex items-center space-x-2 whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-200 mobile-w-full mobile-justify-center"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                <span>Create Note</span>
              </button>
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 mobile-px-4 mobile-py-6 border border-neutral-200/50">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 text-sm mobile-text-base font-medium text-neutral-600">
                  <Filter className="h-4 w-4" />
                  <span>Filter by tags:</span>
                </div>
                <div className="flex flex-wrap gap-2 mobile-grid-1 mobile-space-y-4">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? 'bg-gradient-to-r from-primary-500 to-success-500 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                          : 'bg-white/70 text-neutral-700 border border-neutral-200 hover:bg-white hover:border-primary-300 hover:text-primary-600 hover:shadow-md'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64 mobile-py-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-success-500 opacity-20 animate-pulse"></div>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16 mobile-py-8">
            <div className="mx-auto w-24 h-24 mobile-w-16 mobile-h-16 bg-gradient-to-br from-primary-100 to-success-100 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-primary-500" />
            </div>
            <h3 className="text-xl mobile-text-lg font-semibold text-neutral-700 mb-2">No notes found</h3>
            <p className="text-neutral-500 mobile-text-sm mb-6 max-w-md mx-auto">
              {searchTerm || selectedTags.length > 0
                ? 'Try adjusting your search terms or filters to find what you\'re looking for'
                : 'Start your journey by creating your first note. Capture ideas, thoughts, and inspiration!'}
            </p>
            <button
              onClick={handleCreateNote}
              className="btn-primary inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 mobile-w-full mobile-justify-center"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Note</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mobile-grid-1 tablet-grid-2 desktop-grid-3 gap-6 mobile-space-y-4">
            {filteredNotes.map((note, index) => (
              <div 
                key={note.id} 
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 mobile-px-4 mobile-py-6 border border-neutral-200/50 hover:border-primary-300/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-4 mobile-flex-col mobile-space-y-4">
                  <h3 className="font-bold text-lg mobile-text-base text-neutral-800 truncate flex-1 mr-3 group-hover:text-primary-700 transition-colors">
                    {note.title}
                  </h3>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0 mobile-opacity-100">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 hover:scale-110"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-neutral-600 text-sm mobile-text-sm mb-4 line-clamp-3 leading-relaxed">
                  {note.content}
                </p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gradient-to-r from-primary-100 to-success-100 text-primary-700 text-xs font-medium rounded-full border border-primary-200/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div className="text-xs mobile-text-xs text-neutral-500 font-medium">
                    {note.updatedAt !== note.createdAt ? 'Updated' : 'Created'}{' '}
                    {formatDate(note.updatedAt)}
                  </div>
                  <div className="w-2 h-2 bg-gradient-to-r from-primary-400 to-success-400 rounded-full opacity-60"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center mobile-px-4 mobile-py-6">
            <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-2xl p-2 border border-neutral-200/50 mobile-flex-col mobile-space-y-4 mobile-w-full">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-primary-300 hover:text-primary-600 transition-all duration-200 disabled:hover:bg-transparent disabled:hover:border-neutral-200 disabled:hover:text-neutral-600 mobile-w-full mobile-justify-center"
              >
                Previous
              </button>
              <div className="flex space-x-2 mobile-flex-wrap mobile-justify-center mobile-gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 text-sm font-medium border rounded-xl transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-primary-500 to-success-500 text-white border-transparent shadow-md'
                        : 'text-neutral-600 border-neutral-200 hover:bg-white hover:border-primary-300 hover:text-primary-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-primary-300 hover:text-primary-600 transition-all duration-200 disabled:hover:bg-transparent disabled:hover:border-neutral-200 disabled:hover:text-neutral-600 mobile-w-full mobile-justify-center"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        note={editingNote}
        onSave={handleNoteSaved}
      />
    </div>
  );
};

export default Dashboard;