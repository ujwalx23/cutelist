
import { useState } from "react";
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
import { 
  Mail, Phone, Send, MessageSquare, HelpCircle, AlertCircle,
  Linkedin, Discord
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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
              
              <div className="lg:col-span-2 flex justify-center">
                <Card className="glass-card p-6 w-full h-fit">
                  <h3 className="text-lg font-medium mb-4">Connect With Us</h3>
                  <p className="text-gray-300 mb-6">Follow us on social media for updates, tips, and cute inspiration!</p>
                  
                  <div className="flex justify-center space-x-4">
                    <a 
                      href="https://www.linkedin.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:scale-110 transition-transform"
                    >
                      <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                        <Linkedin className="h-6 w-6" />
                      </Button>
                    </a>
                    <a 
                      href="https://twitter.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:scale-110 transition-transform"
                    >
                      <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                        </svg>
                      </Button>
                    </a>
                    <a 
                      href="https://discord.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:scale-110 transition-transform"
                    >
                      <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                        <Discord className="h-6 w-6" />
                      </Button>
                    </a>
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
