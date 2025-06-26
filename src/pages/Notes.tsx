
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Note {
  id: string;
  title: string;
  content?: string;
  date?: string;
  created_at: string;
  user_id: string;
  isDefault?: boolean;
}

const Notes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  // Default notes that are visible to all users
  const defaultNotes: Note[] = [
    {
      id: "default-1",
      title: "Welcome to Notes",
      content: "This is your personal note-taking space. Sign in to create, edit, and manage your own notes!",
      created_at: new Date().toISOString(),
      user_id: "default",
      isDefault: true
    },
    {
      id: "default-2", 
      title: "Getting Started",
      content: "• Click the + button to add new notes\n• Edit notes by clicking the edit icon\n• Delete notes you no longer need\n• Your notes are automatically saved",
      created_at: new Date().toISOString(),
      user_id: "default",
      isDefault: true
    }
  ];

  // Fetch user notes
  const { data: userNotes = [] } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Combine default and user notes
  const allNotes = user ? [...userNotes, ...defaultNotes] : defaultNotes;

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (note: { title: string; content: string }) => {
      if (!user) throw new Error("Must be logged in to add notes");
      
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: note.title,
          content: note.content,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setNewNote({ title: "", content: "" });
      setShowAddForm(false);
      toast({
        title: "Note added",
        description: "Your note has been successfully created.",
      });
    }
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      if (!user) throw new Error("Must be logged in to update notes");
      
      const { data, error } = await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditingNote(null);
      toast({
        title: "Note updated",
        description: "Your note has been successfully updated.",
      });
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Must be logged in to delete notes");
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({
        title: "Note deleted",
        description: "Your note has been successfully deleted.",
      });
    }
  });

  const handleAddNote = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create notes.",
        variant: "destructive",
      });
      return;
    }
    
    if (newNote.title.trim()) {
      addNoteMutation.mutate(newNote);
    }
  };

  const handleUpdateNote = (id: string, title: string, content: string) => {
    if (!user) {
      toast({
        title: "Authentication Required", 
        description: "Please sign in to edit notes.",
        variant: "destructive",
      });
      return;
    }
    
    updateNoteMutation.mutate({ id, title, content });
  };

  const handleDeleteNote = (id: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete notes.",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  const canModify = (note: Note) => {
    return user && (note.user_id === user.id || (note.isDefault && user));
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-gradient">
                  My Notes
                </h1>
                <p className="text-gray-400">
                  Capture your thoughts and ideas
                </p>
              </div>
              <Button
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "Authentication Required",
                      description: "Please sign in to create notes.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setShowAddForm(true);
                }}
                className="bg-cutelist-primary hover:bg-cutelist-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>

            {!user && (
              <Card className="glass-card mb-6">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">
                    Sign in to create, edit, and manage your personal notes. Browse the default notes below to see what's possible!
                  </p>
                </CardContent>
              </Card>
            )}

            {showAddForm && (
              <Card className="glass-card mb-6">
                <CardHeader>
                  <CardTitle>Add New Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Write your note here..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddNote} disabled={addNoteMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Note
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewNote({ title: "", content: "" });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isEditing={editingNote === note.id}
                  onEdit={() => canModify(note) ? setEditingNote(note.id) : null}
                  onSave={handleUpdateNote}
                  onCancel={() => setEditingNote(null)}
                  onDelete={handleDeleteNote}
                  canModify={canModify(note)}
                />
              ))}
            </div>

            {allNotes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No notes yet</p>
                <Button
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "Authentication Required",
                        description: "Please sign in to create notes.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setShowAddForm(true);
                  }}
                  className="bg-cutelist-primary hover:bg-cutelist-secondary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first note
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

// Note Card Component
interface NoteCardProps {
  note: Note;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (id: string, title: string, content: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  canModify: boolean;
}

function NoteCard({ note, isEditing, onEdit, onSave, onCancel, onDelete, canModify }: NoteCardProps) {
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content || "");

  useEffect(() => {
    if (isEditing) {
      setEditTitle(note.title);
      setEditContent(note.content || "");
    }
  }, [isEditing, note]);

  const handleSave = () => {
    onSave(note.id, editTitle, editContent);
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-semibold"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-white line-clamp-2">
                {note.title}
              </h3>
              {note.isDefault && (
                <Badge variant="outline" className="text-xs ml-2">
                  Default
                </Badge>
              )}
            </div>
            {note.content && (
              <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                {note.content}
              </p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {new Date(note.created_at).toLocaleDateString()}
              </span>
              {canModify && (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={onEdit}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(note.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default Notes;
