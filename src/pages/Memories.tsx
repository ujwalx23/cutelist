
import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Image, Plus, X, Upload } from "lucide-react";
import { Quote as QuoteIcon } from "lucide-react";
import { Memory, Quote, MAX_MEMORIES_PHOTOS } from "@/types/memory";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";

export default function Memories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("memories");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [quoteContent, setQuoteContent] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Track online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Tell service worker we're online
      navigator.serviceWorker.controller?.postMessage({
        type: "ONLINE_STATUS_CHANGE",
        online: true
      });
      
      // Request sync when online
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          // Use the registration object to register sync when available
          if ('sync' in registration) {
            registration.sync.register('sync-offline-data').catch(err => {
              console.error('Sync registration failed:', err);
            });
          }
        });
      }
      
      // Refresh data
      fetchMemories();
      fetchQuotes();
      
      toast({
        title: "You're back online!",
        description: "Your changes will now sync with the server.",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      // Tell service worker we're offline
      navigator.serviceWorker.controller?.postMessage({
        type: "ONLINE_STATUS_CHANGE",
        online: false
      });
      
      toast({
        title: "You're offline",
        description: "Don't worry, changes will be saved locally and synced when you're back online.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchMemories = useCallback(async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      // Try to fetch from Supabase if online
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from("memories")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        setMemories(data || []);
        
        // Store in IndexedDB for offline use
        if ('indexedDB' in window) {
          try {
            const dbRequest = indexedDB.open('offlineData', 1);
            
            dbRequest.onsuccess = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              const transaction = db.transaction(['memories'], 'readwrite');
              const store = transaction.objectStore('memories');
              
              // Clear existing data
              store.clear();
              
              // Add new data
              data?.forEach(memory => {
                store.add(memory);
              });
            };
          } catch (err) {
            console.error("Error storing memories in IndexedDB:", err);
          }
        }
      } 
      // Try to get from IndexedDB if offline
      else if ('indexedDB' in window) {
        try {
          const dbRequest = indexedDB.open('offlineData', 1);
          
          dbRequest.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(['memories'], 'readonly');
            const store = transaction.objectStore('memories');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
              if (getAllRequest.result) {
                setMemories(getAllRequest.result);
              }
            };
          };
        } catch (err) {
          console.error("Error accessing offline memories:", err);
        }
      }
    } catch (error) {
      console.error("Error fetching memories:", error);
      toast({
        title: "Error",
        description: "Failed to load memories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchQuotes = useCallback(async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      // Try to fetch from Supabase if online
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        setQuotes(data || []);
        
        // Store in IndexedDB for offline use
        if ('indexedDB' in window) {
          try {
            const dbRequest = indexedDB.open('offlineData', 1);
            
            dbRequest.onsuccess = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              const transaction = db.transaction(['quotes'], 'readwrite');
              const store = transaction.objectStore('quotes');
              
              // Clear existing data
              store.clear();
              
              // Add new data
              data?.forEach(quote => {
                store.add(quote);
              });
            };
          } catch (err) {
            console.error("Error storing quotes in IndexedDB:", err);
          }
        }
      } 
      // Try to get from IndexedDB if offline
      else if ('indexedDB' in window) {
        try {
          const dbRequest = indexedDB.open('offlineData', 1);
          
          dbRequest.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(['quotes'], 'readonly');
            const store = transaction.objectStore('quotes');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
              if (getAllRequest.result) {
                setQuotes(getAllRequest.result);
              }
            };
          };
        } catch (err) {
          console.error("Error accessing offline quotes:", err);
        }
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast({
        title: "Error",
        description: "Failed to load quotes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMemories();
      fetchQuotes();
    }
  }, [user, fetchMemories, fetchQuotes]);

  // Check memory image count
  const checkMemoryImageLimit = useCallback(async () => {
    try {
      if (!user) return true; // Allow if not logged in
      
      // Count existing images
      const existingImagesCount = memories.filter(memory => memory.image_url).length;
      
      return existingImagesCount < MAX_MEMORIES_PHOTOS;
    } catch (error) {
      console.error("Error checking image limit:", error);
      return false;
    }
  }, [memories, user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      // Check photo limit
      const canUpload = await checkMemoryImageLimit();
      
      if (!canUpload) {
        toast({
          title: "Upload limit reached",
          description: `You can only upload a maximum of ${MAX_MEMORIES_PHOTOS} photos. Please delete some existing memories with photos first.`,
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // If offline, store in IndexedDB for later upload
      if (!navigator.onLine) {
        // Convert file to base64 for storing in IndexedDB
        const reader = new FileReader();
        reader.onload = function(event) {
          if (event.target) {
            const base64String = event.target.result as string;
            
            // Store in IndexedDB for later upload
            if ('indexedDB' in window) {
              try {
                const dbRequest = indexedDB.open('offlineData', 1);
                
                dbRequest.onsuccess = (event) => {
                  const db = (event.target as IDBOpenDBRequest).result;
                  const transaction = db.transaction(['pendingUploads'], 'readwrite');
                  const store = transaction.objectStore('pendingUploads');
                  
                  const pendingUpload = {
                    id: Date.now().toString(),
                    fileName: filePath,
                    fileData: base64String,
                    fileType: file.type,
                    bucket: "memories",
                    time: new Date().toISOString()
                  };
                  
                  store.add(pendingUpload);
                  
                  // Update UI with temporary URL for preview
                  setImageUrl(URL.createObjectURL(file));
                  
                  transaction.oncomplete = () => {
                    toast({
                      title: "Image saved offline",
                      description: "Your image will be uploaded when you're back online.",
                    });
                    setUploading(false);
                  };
                };
              } catch (err) {
                console.error("Error storing image for offline use:", err);
                setUploading(false);
              }
            }
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage.from("memories").getPublicUrl(filePath);
      
      if (data?.publicUrl) {
        setImageUrl(data.publicUrl);
        setUploadedImages([...uploadedImages, data.publicUrl]);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCreateMemory = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to create memories.",
          variant: "destructive",
        });
        return;
      }

      if (!title.trim()) {
        toast({
          title: "Title Required",
          description: "Please enter a title for your memory.",
          variant: "destructive",
        });
        return;
      }
      
      const newMemory: Memory = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl,
        tags: tags.length > 0 ? tags : null,
        created_at: new Date().toISOString(),
        id: crypto.randomUUID()
      };
      
      // If offline, store in IndexedDB
      if (!navigator.onLine) {
        if ('indexedDB' in window) {
          try {
            const dbRequest = indexedDB.open('offlineData', 1);
            
            dbRequest.onsuccess = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              
              // Add to memories store
              const memoriesTransaction = db.transaction(['memories'], 'readwrite');
              const memoriesStore = memoriesTransaction.objectStore('memories');
              memoriesStore.add(newMemory);
              
              // Add to pending changes for later sync
              const pendingTransaction = db.transaction(['pendingChanges'], 'readwrite');
              const pendingStore = pendingTransaction.objectStore('pendingChanges');
              
              const apiUrl = new URL("/rest/v1/memories", supabase.getUrl()).toString();
              pendingStore.add({
                id: Date.now().toString(),
                url: apiUrl,
                method: 'POST',
                body: newMemory,
                time: new Date().toISOString()
              });
              
              // Update UI immediately
              setMemories([newMemory, ...memories]);
              
              // Reset form
              resetMemoryForm();
              
              toast({
                title: "Memory saved offline",
                description: "Your memory has been saved locally and will sync when you're back online.",
              });
            };
          } catch (err) {
            console.error("Error saving memory offline:", err);
            toast({
              title: "Error",
              description: "Failed to save memory offline. Please try again later.",
              variant: "destructive",
            });
          }
        }
        return;
      }

      // Insert memory to Supabase
      const { error } = await supabase.from("memories").insert(newMemory);

      if (error) throw error;

      // Refresh memories
      fetchMemories();
      
      // Reset form
      resetMemoryForm();
      
      toast({
        title: "Memory Created",
        description: "Your memory has been saved successfully.",
      });
    } catch (error) {
      console.error("Error creating memory:", error);
      toast({
        title: "Error",
        description: "Failed to create memory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateQuote = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to save quotes.",
          variant: "destructive",
        });
        return;
      }

      if (!quoteContent.trim()) {
        toast({
          title: "Quote Required",
          description: "Please enter a quote.",
          variant: "destructive",
        });
        return;
      }
      
      const newQuote: Quote = {
        user_id: user.id,
        content: quoteContent.trim(),
        author: quoteAuthor.trim() || null,
        created_at: new Date().toISOString(),
        id: crypto.randomUUID()
      };
      
      // If offline, store in IndexedDB
      if (!navigator.onLine) {
        if ('indexedDB' in window) {
          try {
            const dbRequest = indexedDB.open('offlineData', 1);
            
            dbRequest.onsuccess = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              
              // Add to quotes store
              const quotesTransaction = db.transaction(['quotes'], 'readwrite');
              const quotesStore = quotesTransaction.objectStore('quotes');
              quotesStore.add(newQuote);
              
              // Add to pending changes for later sync
              const pendingTransaction = db.transaction(['pendingChanges'], 'readwrite');
              const pendingStore = pendingTransaction.objectStore('pendingChanges');
              
              const apiUrl = new URL("/rest/v1/quotes", supabase.getUrl()).toString();
              pendingStore.add({
                id: Date.now().toString(),
                url: apiUrl,
                method: 'POST',
                body: newQuote,
                time: new Date().toISOString()
              });
              
              // Update UI immediately
              setQuotes([newQuote, ...quotes]);
              
              // Reset form
              resetQuoteForm();
              
              toast({
                title: "Quote saved offline",
                description: "Your quote has been saved locally and will sync when you're back online.",
              });
            };
          } catch (err) {
            console.error("Error saving quote offline:", err);
            toast({
              title: "Error",
              description: "Failed to save quote offline. Please try again later.",
              variant: "destructive",
            });
          }
        }
        return;
      }

      // Insert quote to Supabase
      const { error } = await supabase.from("quotes").insert(newQuote);

      if (error) throw error;

      // Refresh quotes
      fetchQuotes();
      
      // Reset form
      resetQuoteForm();
      
      toast({
        title: "Quote Saved",
        description: "Your quote has been saved successfully.",
      });
    } catch (error) {
      console.error("Error creating quote:", error);
      toast({
        title: "Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetMemoryForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setCurrentTag("");
    setImageUrl(null);
  };

  const resetQuoteForm = () => {
    setQuoteContent("");
    setQuoteAuthor("");
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      if (!user) return;
      
      // Find memory to get image URL if any
      const memoryToDelete = memories.find(memory => memory.id === memoryId);
      
      // Delete from Supabase if online
      if (navigator.onLine) {
        // Delete image from storage if exists
        if (memoryToDelete?.image_url) {
          const imagePathMatch = memoryToDelete.image_url.match(/\/([^/]+)$/);
          if (imagePathMatch) {
            const imagePath = imagePathMatch[1];
            await supabase.storage.from("memories").remove([imagePath]);
          }
        }
        
        const { error } = await supabase.from("memories").delete().eq("id", memoryId);
        if (error) throw error;
      } 
      // If offline, mark for deletion
      else if ('indexedDB' in window) {
        try {
          const dbRequest = indexedDB.open('offlineData', 1);
          
          dbRequest.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            
            // Add to pending changes for deletion
            const pendingTransaction = db.transaction(['pendingChanges'], 'readwrite');
            const pendingStore = pendingTransaction.objectStore('pendingChanges');
            
            const apiUrl = new URL(`/rest/v1/memories?id=eq.${memoryId}`, supabase.getUrl()).toString();
            pendingStore.add({
              id: Date.now().toString(),
              url: apiUrl,
              method: 'DELETE',
              body: {},
              time: new Date().toISOString()
            });
            
            // Also mark image for deletion if exists
            if (memoryToDelete?.image_url) {
              const imagePathMatch = memoryToDelete.image_url.match(/\/([^/]+)$/);
              if (imagePathMatch) {
                const imagePath = imagePathMatch[1];
                
                const storageUrl = new URL(`/storage/v1/object/memories/${imagePath}`, supabase.getUrl()).toString();
                pendingStore.add({
                  id: Date.now().toString() + '-img',
                  url: storageUrl,
                  method: 'DELETE',
                  body: {},
                  time: new Date().toISOString()
                });
              }
            }
          };
        } catch (err) {
          console.error("Error marking memory for deletion:", err);
        }
      }
      
      // Update UI
      setMemories(memories.filter((memory) => memory.id !== memoryId));
      
      toast({
        title: "Memory Deleted",
        description: navigator.onLine 
          ? "Your memory has been deleted." 
          : "Your memory will be deleted when you're back online.",
      });
    } catch (error) {
      console.error("Error deleting memory:", error);
      toast({
        title: "Error",
        description: "Failed to delete memory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      if (!user) return;
      
      // Delete from Supabase if online
      if (navigator.onLine) {
        const { error } = await supabase.from("quotes").delete().eq("id", quoteId);
        if (error) throw error;
      } 
      // If offline, mark for deletion
      else if ('indexedDB' in window) {
        try {
          const dbRequest = indexedDB.open('offlineData', 1);
          
          dbRequest.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            
            // Add to pending changes for deletion
            const pendingTransaction = db.transaction(['pendingChanges'], 'readwrite');
            const pendingStore = pendingTransaction.objectStore('pendingChanges');
            
            const apiUrl = new URL(`/rest/v1/quotes?id=eq.${quoteId}`, supabase.getUrl()).toString();
            pendingStore.add({
              id: Date.now().toString(),
              url: apiUrl,
              method: 'DELETE',
              body: {},
              time: new Date().toISOString()
            });
          };
        } catch (err) {
          console.error("Error marking quote for deletion:", err);
        }
      }
      
      // Update UI
      setQuotes(quotes.filter((quote) => quote.id !== quoteId));
      
      toast({
        title: "Quote Deleted",
        description: navigator.onLine 
          ? "Your quote has been deleted." 
          : "Your quote will be deleted when you're back online.",
      });
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast({
        title: "Error",
        description: "Failed to delete quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container py-10">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-2 text-gradient">
              Memories & Quotes
            </h1>
            <p className="text-center text-gray-400 mb-6">
              Save your precious moments and favorite quotes
              {!isOnline && " (Currently in offline mode)"}
            </p>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="memories" className="text-sm sm:text-base">
                  <Image className="h-4 w-4 mr-2" /> Memories
                </TabsTrigger>
                <TabsTrigger value="quotes" className="text-sm sm:text-base">
                  <QuoteIcon className="h-4 w-4 mr-2" /> Quotes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="memories">
                {user && (
                  <Card className="glass-card p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Create New Memory</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter a title for your memory"
                          className="bg-cutelist-dark/50 border-cutelist-primary/30"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Description (optional)
                        </label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe this memory..."
                          className="bg-cutelist-dark/50 border-cutelist-primary/30 resize-none"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tags (optional)
                        </label>
                        <div className="flex items-center">
                          <Input
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add tags and press Enter"
                            className="bg-cutelist-dark/50 border-cutelist-primary/30"
                          />
                          <Button
                            onClick={handleAddTag}
                            disabled={!currentTag.trim()}
                            className="ml-2 bg-cutelist-primary hover:bg-cutelist-secondary"
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="flex items-center gap-1 bg-cutelist-primary/10"
                              >
                                {tag}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => handleRemoveTag(tag)}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Image (optional)
                        </label>
                        <div className="flex items-center">
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="bg-cutelist-dark/70 hover:bg-cutelist-dark/90 border border-dashed border-cutelist-primary/30"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? "Uploading..." : "Upload Image"}
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <div className="ml-2 text-xs text-gray-400">
                            Note: You can upload max {MAX_MEMORIES_PHOTOS} photos
                          </div>
                        </div>

                        {imageUrl && (
                          <div className="mt-4 relative w-fit">
                            <img
                              src={imageUrl}
                              alt="Memory"
                              className="max-w-[200px] rounded-md"
                            />
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full"
                              onClick={() => setImageUrl(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={handleCreateMemory}
                          disabled={!title.trim() || uploading}
                          className="w-full bg-cutelist-primary hover:bg-cutelist-secondary"
                        >
                          Save Memory
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                <h2 className="text-2xl font-semibold mb-4">Your Memories</h2>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="glass-card p-4 overflow-hidden">
                        <Skeleton className="h-32 w-full mb-4" />
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </Card>
                    ))}
                  </div>
                ) : !user ? (
                  <div className="text-center py-10">
                    <Image className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Login to View Memories</h3>
                    <p className="text-gray-400 mb-4">
                      Please login to view and create your memories
                    </p>
                    <Button asChild>
                      <a href="/profile">Login Now</a>
                    </Button>
                  </div>
                ) : memories.length === 0 ? (
                  <div className="text-center py-10">
                    <Image className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Memories Yet</h3>
                    <p className="text-gray-400">
                      Create your first memory to get started!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {memories.map((memory) => (
                      <Card key={memory.id} className="glass-card overflow-hidden">
                        {memory.image_url && (
                          <div className="relative h-48">
                            <img
                              src={memory.image_url}
                              alt={memory.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-lg">{memory.title}</h3>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handleDeleteMemory(memory.id)}
                            >
                              <X className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>
                          {memory.description && (
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                              {memory.description}
                            </p>
                          )}
                          {memory.tags && memory.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {memory.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs bg-cutelist-primary/10"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {memory.tags.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-cutelist-primary/10"
                                >
                                  +{memory.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {format(parseISO(memory.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="quotes">
                {user && (
                  <Card className="glass-card p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Save New Quote</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Quote</label>
                        <Textarea
                          value={quoteContent}
                          onChange={(e) => setQuoteContent(e.target.value)}
                          placeholder="Enter your favorite quote"
                          className="bg-cutelist-dark/50 border-cutelist-primary/30 resize-none"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Author (optional)
                        </label>
                        <Input
                          value={quoteAuthor}
                          onChange={(e) => setQuoteAuthor(e.target.value)}
                          placeholder="Who said this quote?"
                          className="bg-cutelist-dark/50 border-cutelist-primary/30"
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={handleCreateQuote}
                          disabled={!quoteContent.trim()}
                          className="w-full bg-cutelist-primary hover:bg-cutelist-secondary"
                        >
                          Save Quote
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                <h2 className="text-2xl font-semibold mb-4">Your Quotes</h2>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="glass-card p-6">
                        <Skeleton className="h-16 w-full mb-3" />
                        <Skeleton className="h-4 w-1/3" />
                      </Card>
                    ))}
                  </div>
                ) : !user ? (
                  <div className="text-center py-10">
                    <QuoteIcon className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Login to View Quotes</h3>
                    <p className="text-gray-400 mb-4">
                      Please login to view and save your quotes
                    </p>
                    <Button asChild>
                      <a href="/profile">Login Now</a>
                    </Button>
                  </div>
                ) : quotes.length === 0 ? (
                  <div className="text-center py-10">
                    <QuoteIcon className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Quotes Yet</h3>
                    <p className="text-gray-400">Save your first quote to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((quote) => (
                      <Card key={quote.id} className="glass-card p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-lg italic">"{quote.content}"</p>
                            {quote.author && (
                              <p className="text-sm text-gray-400 mt-2">— {quote.author}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {format(parseISO(quote.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleDeleteQuote(quote.id)}
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
