
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
  Linkedin, MessageCircle
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Contact = () => {
  const isMobile = useIsMobile();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    // Here you would typically send the form data to your backend
    alert("Message sent successfully!");
    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
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
                Have questions or feedback? We'd love to hear from you. Get in touch with our team!
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
                    <Button type="submit" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
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
                      Our team is here to help with any questions or concerns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-cutelist-primary/10 rounded-full mr-3">
                        <Mail className="h-5 w-5 text-cutelist-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email Us</p>
                        <a
                          href="mailto:mebeingbetter23@gmail.com">Email me</a>
"
                          className="text-sm text-cutelist-accent hover:underline"
                        >
                          mebeingbetter23@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="p-2 bg-cutelist-primary/10 rounded-full mr-3">
                        <Phone className="h-5 w-5 text-cutelist-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Call Us</p>
                        <a
                          href="unavailable"
                          className="text-sm text-cutelist-accent hover:underline"
                        >
                          unavailable (sorry)
                        </a>
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
                      >
                        <Linkedin className="h-6 w-6 text-cutelist-primary" />
                      </a>
                      <a 
                        href="https://discord.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-3 bg-cutelist-primary/10 rounded-full hover:bg-cutelist-primary/20 transition-colors"
                      >
                        <MessageCircle className="h-6 w-6 text-cutelist-primary" />
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
                      <h3 className="font-medium">How do I create an account?</h3>
                      <p className="text-sm text-gray-400">
                        Click the "Sign In" button in the top right corner and follow the registration process.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Is my data secure?</h3>
                      <p className="text-sm text-gray-400">
                        Yes, your data is safe and handled with care. It is always protected.
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
