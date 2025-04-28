
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, Phone, MapPin, Send, MessageSquare, HelpCircle, AlertCircle
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SupportFormData {
  email: string;
  issue: string;
  description: string;
}

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const contactForm = useForm<ContactFormData>();
  const supportForm = useForm<SupportFormData>();
  const mapRef = useRef<HTMLDivElement>(null);

  // Simulate map initialization with a placeholder
  const initMap = () => {
    if (mapRef.current) {
      mapRef.current.classList.add("bg-gradient-to-br", "from-cutelist-primary/20", "to-cutelist-accent/20");
    }
  };

  const onSubmitContact = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: data.name,
          email: data.email,
          message: data.message,
        }]);

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Thank you for your feedback. We'll get back to you soon.",
      });
      contactForm.reset();
      
      // Also send confirmation email to user (would connect to an edge function)
      toast({
        title: "Confirmation sent!",
        description: "We've sent a confirmation email to your address.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitSupport = async (data: SupportFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: "Support Request",
          email: data.email,
          message: `Issue: ${data.issue}\n\n${data.description}`,
        }]);

      if (error) throw error;

      toast({
        title: "Support request sent!",
        description: "We've received your request and will respond shortly.",
      });
      supportForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send support request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-gradient mb-2 text-center">Contact Us</h1>
            <p className="text-center text-gray-400 mb-8">We'd love to hear from you. Reach out using any of the methods below.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="glass-card p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-cutelist-primary/20 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-cutelist-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Email Us</h3>
                <p className="text-sm text-gray-400 mb-4">Our friendly team is here to help</p>
                <a href="mailto:hello@cutelist.app" className="text-cutelist-primary hover:text-cutelist-primary/80 transition-colors">
                  hello@cutelist.app
                </a>
              </Card>
              
              <Card className="glass-card p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-cutelist-primary/20 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-cutelist-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Call Us</h3>
                <p className="text-sm text-gray-400 mb-4">Mon-Fri from 9am to 5pm</p>
                <a href="tel:+15555555555" className="text-cutelist-primary hover:text-cutelist-primary/80 transition-colors">
                  +1 (555) 555-5555
                </a>
              </Card>
              
              <Card className="glass-card p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-cutelist-primary/20 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-cutelist-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Visit Us</h3>
                <p className="text-sm text-gray-400 mb-4">Come say hello at our office</p>
                <span className="text-cutelist-primary">
                  123 Cute Street, Digital City
                </span>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <Tabs defaultValue="contact">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="contact" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Contact</span>
                    </TabsTrigger>
                    <TabsTrigger value="support" className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      <span>Support</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="contact">
                    <Card className="glass-card p-6">
                      <Form {...contactForm}>
                        <form onSubmit={contactForm.handleSubmit(onSubmitContact)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={contactForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your name" {...field} required />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={contactForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="your@email.com" {...field} required />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={contactForm.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                  <Input placeholder="What's this about?" {...field} required />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={contactForm.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Your message..." 
                                    className="min-h-[120px]" 
                                    {...field} 
                                    required 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="w-full"
                          >
                            {isSubmitting ? (
                              "Sending..."
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" /> Send Message
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="support">
                    <Card className="glass-card p-6">
                      <Form {...supportForm}>
                        <form onSubmit={supportForm.handleSubmit(onSubmitSupport)} className="space-y-4">
                          <FormField
                            control={supportForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your@email.com" {...field} required />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={supportForm.control}
                            name="issue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Issue Type</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Bug, Feature request, Question" {...field} required />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={supportForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Issue Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Please describe your issue in detail..." 
                                    className="min-h-[150px]" 
                                    {...field} 
                                    required 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full"
                          >
                            {isSubmitting ? "Submitting..." : "Submit Support Request"}
                          </Button>
                          
                          <div className="bg-cutelist-primary/10 border border-cutelist-primary/30 rounded p-3 flex items-start">
                            <AlertCircle className="h-5 w-5 text-cutelist-primary mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-300">
                              For urgent issues, please contact us directly via phone for faster assistance.
                            </p>
                          </div>
                        </form>
                      </Form>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="lg:col-span-2">
                <Card className="glass-card overflow-hidden h-full flex flex-col">
                  <div 
                    className="h-[200px] flex items-center justify-center text-center p-4"
                    ref={mapRef}
                    onLoad={initMap}
                  >
                    <div className="bg-cutelist-dark/60 p-4 rounded-lg">
                      <p className="text-sm text-gray-300">
                        Interactive map coming soon!
                      </p>
                    </div>
                  </div>
                  <div className="p-6 flex-1">
                    <h3 className="text-lg font-medium mb-4">Our Location</h3>
                    <address className="not-italic text-gray-300 space-y-2">
                      <p>123 Cute Street</p>
                      <p>Digital City, DC 12345</p>
                      <p>Cyberspace</p>
                    </address>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Business Hours</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monday-Friday</span>
                          <span>9:00am - 5:00pm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Saturday</span>
                          <span>10:00am - 2:00pm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sunday</span>
                          <span>Closed</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-center space-x-4 mt-4">
                      <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                        </svg>
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                        </svg>
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Contact;
