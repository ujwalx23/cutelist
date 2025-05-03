
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Trash, Edit, Save, FileText } from "lucide-react";
import { generateId } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Load notes from localStorage on component mount
  useEffect(() => {
    if (user) {
      const storageKey = `notes-${user.id}`;
      const storedNotes = localStorage.getItem(storageKey);
      
      if (storedNotes) {
        try {
          const parsedNotes = JSON.parse(storedNotes);
          // Convert string dates back to Date objects
          const notesWithDateObjects = parsedNotes.map((note: any) => ({
            ...note,
            date: new Date(note.date)
          }));
          setNotes(notesWithDateObjects);
        } catch (error) {
          console.error("Error parsing stored notes:", error);
          // If there's an error parsing, initialize with default notes
          setDefaultNotes();
        }
      } else {
        // If no notes are found, initialize with default notes
        setDefaultNotes();
      }
    }
  }, [user]);

  // Set default notes if needed
  const setDefaultNotes = () => {
    const defaultNotes = [
      { 
        id: "note1", 
        title: "Welcome Note", 
        content: "Welcome to CuteList Notes! This is a simple note-taking app to help you organize your thoughts and ideas.", 
        date: new Date()
      },
      { 
        id: "note2", 
        title: "Shopping List", 
        content: "- Milk\n- Rice\n- Chips\n- Apples\n- Chocolate", 
        date: new Date(new Date().setDate(new Date().getDate() + 1))
      },
    ];
    setNotes(defaultNotes);
  };
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (user && notes.length > 0) {
      const storageKey = `notes-${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(notes));
    }
  }, [notes, user]);

  const addNote = () => {
    if (title.trim()) {
      const newNote: Note = {
        id: generateId(),
        title,
        content,
        date: new Date(),
      };
      setNotes([newNote, ...notes]);
      setTitle("");
      setContent("");
      
      toast({
        title: "Note added",
        description: `"${title}" has been added to your notes.`,
      });
    }
  };

  const startEdit = (note: Note) => {
    setEditMode(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEdit = (id: string) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? { ...note, title: editTitle, content: editContent, date: new Date() }
          : note
      )
    );
    setEditMode(null);
    
    toast({
      title: "Note updated",
      description: "Your note has been updated successfully.",
    });
  };

  const removeNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    
    toast({
      title: "Note deleted",
      description: "Your note has been deleted.",
    });
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-4xl font-bold text-center mb-2 text-gradient">
                My Notes
              </h1>
              <p className="text-center text-gray-400 mb-6">
                Keep track of your ideas, lists, and thoughts
              </p>

              {user ? (
                <div className="w-full max-w-3xl glass-card p-6 rounded-xl mb-8">
                  <h2 className="text-xl font-semibold mb-4">Create New Note</h2>
                  <div className="space-y-4">
                    <Input
                      placeholder="Note title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-cutelist-dark/50 border-cutelist-primary/30"
                    />
                    <Textarea
                      placeholder="Note content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[100px] bg-cutelist-dark/50 border-cutelist-primary/30"
                    />
                    <Button onClick={addNote} className="bg-cutelist-primary hover:bg-cutelist-secondary">
                      <Plus className="h-4 w-4 mr-1" /> Add Note
                    </Button>
                  </div>
                </div>
              ) : (
                <Card className="w-full max-w-3xl mb-8 bg-cutelist-dark/30 backdrop-blur-sm border-cutelist-primary/20">
                  <CardHeader>
                    <CardTitle>Sign in to add notes</CardTitle>
                    <CardDescription>Create an account to start taking notes</CardDescription>
                  </CardHeader>
                </Card>
              )}

              <div className="w-full max-w-3xl mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-cutelist-dark/50 border-cutelist-primary/30"
                  />
                </div>
              </div>

              <div className="w-full max-w-3xl">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="flex justify-center mb-4">
                      <FileText className="h-12 w-12 text-cutelist-primary opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium text-cutelist-primary mb-2">No notes found</h3>
                    <p className="text-gray-400">Add some notes or try a different search</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotes.map((note) => (
                      <Card key={note.id} className="bg-cutelist-dark/30 backdrop-blur-sm border-cutelist-primary/20">
                        <CardHeader className="pb-2">
                          {editMode === note.id ? (
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="font-bold text-lg mb-1 bg-cutelist-dark/50 border-cutelist-primary/30"
                            />
                          ) : (
                            <CardTitle>{note.title}</CardTitle>
                          )}
                          <CardDescription>{formatDate(note.date)}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          {editMode === note.id ? (
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[100px] bg-cutelist-dark/50 border-cutelist-primary/30"
                            />
                          ) : (
                            <p className="whitespace-pre-wrap text-gray-300">{note.content}</p>
                          )}
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-end gap-2">
                          {editMode === note.id ? (
                            <Button 
                              variant="default" 
                              onClick={() => saveEdit(note.id)}
                              className="bg-cutelist-primary hover:bg-cutelist-secondary"
                              size="sm"
                            >
                              <Save className="h-4 w-4 mr-1" /> Save
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              onClick={() => startEdit(note)}
                              size="sm"
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            onClick={() => removeNote(note.id)}
                            size="sm"
                          >
                            <Trash className="h-4 w-4 text-red-400" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Notes;
