
import { MessageSquare } from "lucide-react";
import { QuoteCard } from "./QuoteCard";
import type { Quote } from "./types";

interface QuotesTabProps {
  quotes: Quote[];
}

export const QuotesTab = ({ quotes }: QuotesTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quotes && quotes.length > 0 ? (
        quotes.map(quote => (
          <QuoteCard key={quote.id} quote={quote} />
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-16 w-16 mb-4 text-gray-600" />
          <h3 className="text-xl font-medium mb-2">No quotes yet</h3>
          <p className="text-gray-400 text-center mb-4">
            Be the first to share an inspiring quote
          </p>
        </div>
      )}
    </div>
  );
};
