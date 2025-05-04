
import { MessageSquare, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { QuoteCard } from "./QuoteCard";

interface Quote {
  id: string;
  user_id: string;
  content: string;
  author: string;
  created_at: string;
}

interface QuotesTabProps {
  quotes: Quote[];
  isLoading: boolean;
  currentUserId?: string;
  onDeleteQuote: (id: string) => void;
  onAddQuote: () => void;
  isMobile: boolean;
}

export const QuotesTab = ({
  quotes,
  isLoading,
  currentUserId,
  onDeleteQuote,
  onAddQuote,
  isMobile,
}: QuotesTabProps) => {
  return (
    <div>
      <div className="mb-6 bg-cutelist-primary/10 p-5 rounded-xl border border-cutelist-primary/20">
        <h3 className="text-lg font-medium mb-2">Share Inspiration</h3>
        <p className="text-gray-400 text-sm mb-4">
          Share your favorite quotes, affirmations, or words of wisdom with the community.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={onAddQuote}
            size={isMobile ? "sm" : "default"}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Quote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="opacity-50">
              <CardHeader>
                <div className="h-6 w-3/4 bg-cutelist-dark/70 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-cutelist-dark/70 rounded animate-pulse mb-2" />
                <div className="h-4 w-5/6 bg-cutelist-dark/70 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-cutelist-dark/70 rounded animate-pulse mt-2 ml-auto" />
              </CardContent>
            </Card>
          ))
        ) : quotes && quotes.length > 0 ? (
          quotes.map(quote => (
            <QuoteCard
              key={quote.id}
              id={quote.id}
              user_id={quote.user_id}
              content={quote.content}
              author={quote.author}
              created_at={quote.created_at}
              currentUserId={currentUserId}
              onDelete={onDeleteQuote}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-16 w-16 mb-4 text-gray-600" />
            <h3 className="text-xl font-medium mb-2">No quotes yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Be the first to share an inspiring quote
            </p>
            <Button onClick={onAddQuote}>
              Add Quote
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
