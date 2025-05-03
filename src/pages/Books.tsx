
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Plus, Search, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BookItem {
  id: string;
  title: string;
  author: string;
  year: string;
  read: boolean;
}

const Books = () => {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load books from database
  useEffect(() => {
    const loadBooks = async () => {
      if (!user) {
        setBooks([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading books:', error);
          setBooks([]);
          return;
        }

        if (data) {
          const formattedBooks = data.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            year: book.year || '',
            read: book.read || false,
          }));
          setBooks(formattedBooks);
        } else {
          setBooks([]);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [user]);

  const addBook = async () => {
    if (!title || !author || !user) return;

    try {
      // Add to database if user is logged in
      if (user) {
        const { data, error } = await supabase
          .from('books')
          .insert([{
            title,
            author,
            year,
            read: false,
            user_id: user.id
          }])
          .select()
          .single();

        if (error) throw error;

        const newBook: BookItem = {
          id: data.id,
          title: data.title,
          author: data.author,
          year: data.year || '',
          read: data.read || false,
        };
        
        setBooks([newBook, ...books]);
        
        toast({
          title: "Book added!",
          description: "Your new book has been added to your collection.",
        });
      }
      
      setTitle("");
      setAuthor("");
      setYear("");
    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        title: "Error",
        description: "Failed to add book. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleRead = async (id: string) => {
    if (!user) return;

    const book = books.find(b => b.id === id);
    if (!book) return;

    try {
      // Update in database
      const { error } = await supabase
        .from('books')
        .update({ read: !book.read })
        .eq('id', id);

      if (error) throw error;

      // Update state after successful database update
      setBooks(
        books.map((b) =>
          b.id === id ? { ...b, read: !b.read } : b
        )
      );
    } catch (error) {
      console.error('Error toggling book read status:', error);
      toast({
        title: "Error",
        description: "Failed to update book. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeBook = async (id: string) => {
    if (!user) return;

    try {
      // Delete from database
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update state after successful database deletion
      setBooks(books.filter((b) => b.id !== id));
      
      toast({
        title: "Book removed!",
        description: "The book has been removed from your collection.",
      });
    } catch (error) {
      console.error('Error removing book:', error);
      toast({
        title: "Error",
        description: "Failed to remove book. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-4xl font-bold text-center mb-2 text-gradient">
                My Books
              </h1>
              <p className="text-center text-gray-400 mb-6">
                Keep track of your reading list and achievements
              </p>

              {user ? (
                <div className="w-full max-w-3xl glass-card p-6 rounded-xl mb-8">
                  <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Input
                      placeholder="Book title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="flex-1 bg-cutelist-dark/50 border-cutelist-primary/30"
                    />
                    <Input
                      placeholder="Author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="flex-1 bg-cutelist-dark/50 border-cutelist-primary/30"
                    />
                    <Input
                      placeholder="Year (optional)"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full md:w-24 bg-cutelist-dark/50 border-cutelist-primary/30"
                    />
                  </div>
                  <Button onClick={addBook} className="bg-cutelist-primary hover:bg-cutelist-secondary">
                    <Plus className="h-4 w-4 mr-1" /> Add Book
                  </Button>
                </div>
              ) : (
                <Card className="w-full max-w-3xl mb-8 bg-cutelist-dark/30 backdrop-blur-sm border-cutelist-primary/20">
                  <CardHeader>
                    <CardTitle>Sign in to add books</CardTitle>
                    <CardDescription>Create an account to start tracking your books</CardDescription>
                  </CardHeader>
                </Card>
              )}

              <div className="w-full max-w-3xl mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-cutelist-dark/50 border-cutelist-primary/30"
                  />
                </div>
              </div>

              <div className="w-full max-w-3xl">
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cutelist-primary"></div>
                  </div>
                ) : filteredBooks.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="flex justify-center mb-4">
                      <Book className="h-12 w-12 text-cutelist-primary opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium text-cutelist-primary mb-2">No books found</h3>
                    <p className="text-gray-400">Add some books to your collection or try a different search</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredBooks.map((book) => (
                      <Card key={book.id} className={`bg-cutelist-dark/30 backdrop-blur-sm border-cutelist-primary/20 ${book.read ? "border-cutelist-primary" : ""}`}>
                        <CardHeader className="pb-2">
                          <CardTitle>{book.title}</CardTitle>
                          <CardDescription>{book.author} {book.year && `(${book.year})`}</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-2 flex justify-between">
                          <Button 
                            variant={book.read ? "default" : "outline"} 
                            onClick={() => toggleRead(book.id)}
                            className={book.read ? "bg-cutelist-primary hover:bg-cutelist-secondary" : ""}
                            size="sm"
                          >
                            {book.read ? "Read" : "Mark as Read"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeBook(book.id)}>
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

export default Books;
