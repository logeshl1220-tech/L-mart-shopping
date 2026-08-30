export type ReviewScore = { rating: number };

export function summarizeReviews(reviews: ReviewScore[]) {
  return {
    count: reviews.length,
    average: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null,
  };
}
