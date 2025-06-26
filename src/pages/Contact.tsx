
import { useState } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Mail, Phone, Send, MessageSquare, HelpCircle, AlertCircle,
  Linkedin, Twitter, Instagram
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Contact = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form data
      if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
        throw new Error("Please fill in all required fields");
      }
      
      // Insert the form data into Supabase
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: form.name,
          email: form.email,
          message: form.subject ? `${form.subject}: ${form.message}` : form.message,
          user_id: user?.id || null
        });
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      toast({
        title: "Message sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      
      // Reset form
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission failed",
        description: error.message || "There was a problem sending your message. Please try again.",
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
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gradient mb-2">Contact Us</h1>
              <p className="text-gray-400 max-w-xl mx-auto">
                Have questions or feedback? We'd love to hear from you. Get in touch with us!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Form */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-cutelist-primary" />
                    Send Us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Your email address"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What is this regarding?"
                        value={form.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Your message"
                        value={form.message}
                        onChange={handleChange}
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2 text-cutelist-primary" />
                      Get in Touch
                    </CardTitle>
                    <CardDescription>
                    We are here to help with any questions or concerns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-cutelist-primary/10 rounded-full mr-3">
                        <Mail className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email Us</p>
                        <a
                          href="mailto:cutelist23@gmail.com"
                          className="text-sm text-green-500 hover:underline"
                        >
                          cutelist23@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="p-2 bg-cutelist-primary/10 rounded-full mr-3">
                        <Phone className="h-5 w-5 text-cutelist-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Call or WhatsApp Us</p>
                        <span className="text-sm text-cutelist-accent">
                          7977339435
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-cutelist-primary" />
                      Follow Us
                    </CardTitle>
                    <CardDescription>
                      Connect with us on social media for updates and more.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-around">
                      <a 
                        href="https://www.linkedin.com/in/ujwal-singh-6b3847297" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-cutelist-primary/10 rounded-full hover:bg-cutelist-primary/20 transition-colors"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-6 w-6 text-cutelist-primary" />
                      </a>
                      <a 
                        href="https://x.com/UJWALSINGH23/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-3 bg-cutelist-primary/10 rounded-full hover:bg-cutelist-primary/20 transition-colors"
                        aria-label="Twitter"
                      >
                        <Twitter className="h-6 w-6 text-cutelist-primary" />
                      </a>
                      <a 
                        href="https://www.instagram.com/umorningstar23?igsh=YzQ0b2tsamh3bTFu" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-3 bg-cutelist-primary/10 rounded-full hover:bg-cutelist-primary/20 transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-6 w-6 text-cutelist-primary" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2 text-cutelist-primary" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-medium">Is my data secure?</h3>
                      <p className="text-sm text-gray-400">
                        Yes, your data is safe and handled with care. It is always protected.
                      </p> 
                      </div>
                    <div> <h3 className="font-medium">Forgot your password?</h3>
<p className="text-sm text-gray-400">
  Just contact us with your login email. You can describe your problem or simply write magic link in the message and send it to us. We'll send you a login link so you can access your CuteList account and get back to organizing your life.
</p>

                    </div>
                  </CardContent>
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
