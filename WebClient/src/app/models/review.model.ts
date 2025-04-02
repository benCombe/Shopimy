export interface Review {
      id: number;
      productId: number;
      userId: string; // Assuming user ID is a string, adjust if needed
      rating: number;
      comment: string;
      createdAt: Date; // Will be deserialized from string by HttpClient
      // Optional: Add user details if the backend includes them
      // userName?: string;
    }

    export interface AverageRating {
        averageRating: number;
    } 