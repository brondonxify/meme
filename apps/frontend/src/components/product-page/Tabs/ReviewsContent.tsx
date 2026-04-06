"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import ReviewCard from "@/components/common/ReviewCard";
import { reviewsData } from "@/app/page";
import Link from "next/link";
import { Star } from "lucide-react";
import { post } from "@/lib/api-client";
import { cn } from "@/lib/utils";

import type { Review } from "@/types/product.types";

interface ReviewsContentProps {
  articleId: number;
  reviews?: Review[];
}

const ReviewsContent = ({ articleId, reviews }: ReviewsContentProps) => {
  const [displayReviews, setDisplayReviews] = useState<Review[]>(reviews && reviews.length > 0 ? reviews : reviewsData);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  const reviewCount = displayReviews.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !content) return;

    setIsSubmitting(true);
    try {
      const response = await post<Review>(`/api/v1/articles/${articleId}/reviews`, {
        user: userName,
        content,
        rating,
      });

      if (response.success) {
        setDisplayReviews([response.data, ...displayReviews]);
        setUserName("");
        setContent("");
        setRating(5);
        setIsSheetOpen(false);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between flex-col sm:flex-row mb-5 sm:mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <h3 className="text-xl sm:text-2xl font-bold text-black mr-2">
            All Reviews
          </h3>
          <span className="text-sm sm:text-base text-black/60">({reviewCount})</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <Select defaultValue="latest">
            <SelectTrigger className="min-w-[120px] font-medium text-xs sm:text-base px-4 py-3 sm:px-5 sm:py-4 text-black bg-[#F0F0F0] border-none rounded-full h-12 outline-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="most-relevant">Most Relevant</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                className="sm:min-w-[166px] px-4 py-3 sm:px-5 sm:py-4 rounded-full bg-black font-medium text-xs sm:text-base h-12 hover:bg-black/90"
              >
                Write a Review
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">Write a Review</SheetTitle>
                <SheetDescription>
                  Share your experience with others about this high-tech component.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/60 uppercase tracking-wider">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "w-8 h-8",
                            star <= rating ? "fill-[#FF9900] text-[#FF9900]" : "text-gray-300"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="user-name" className="text-sm font-medium text-black/60 uppercase tracking-wider">Your Name</label>
                  <Input
                    id="user-name"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="rounded-xl h-12 border-black/10 focus:border-[#FF9900] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="review-content" className="text-sm font-medium text-black/60 uppercase tracking-wider">Review Details</label>
                  <textarea
                    id="review-content"
                    placeholder="Tell us what you think..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={6}
                    className="w-full p-4 rounded-xl border border-black/10 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-all outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-full font-bold text-lg shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Post Review"}
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 sm:mb-9">
        {displayReviews.map((review) => (
          <ReviewCard key={review.id} data={review} isAction isDate />
        ))}
      </div>
      {displayReviews.length > 0 && (
        <div className="w-full px-4 sm:px-0 text-center">
          <Link
            href="#"
            className="inline-block w-[230px] px-11 py-4 border rounded-full hover:bg-black hover:text-white text-black transition-all font-medium text-sm sm:text-base border-black/10"
          >
            Load More Reviews
          </Link>
        </div>
      )}
    </section>
  );
};

export default ReviewsContent;
