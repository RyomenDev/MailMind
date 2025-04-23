import { HfInference } from "@huggingface/inference";

// Initialize the Hugging Face client
// In a production app, you'd use environment variables for this
const inference = new HfInference(process.env.VITE_HUGGINGFACE_API_KEY);

/**
 * Generate a summary of the provided text
 * @param text The text to summarize
 * @returns The generated summary
 */
export async function generateSummary(text: string): Promise<string> {
  try {
    // Truncate text if it's too long
    const maxInputLength = 1000;
    const truncatedText =
      text.length > maxInputLength ? text.substring(0, maxInputLength) : text;

    // Use the Hugging Face summarization model
    const result = await inference.summarization({
      model: "facebook/bart-large-cnn",
      inputs: truncatedText,
      parameters: {
        max_length: 100,
        min_length: 30,
      },
    });

    return result.summary_text;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Unable to generate summary.";
  }
}

/**
 * Classify the priority of an email
 * @param text The text to classify
 * @returns The predicted priority (high, medium, low)
 */
export async function classifyEmailPriority(text: string): Promise<string> {
  try {
    // Truncate text if it's too long
    const maxInputLength = 1000;
    const truncatedText =
      text.length > maxInputLength ? text.substring(0, maxInputLength) : text;

    // Use the Hugging Face zero-shot classification model
    const response = await inference.zeroShotClassification({
      model: "facebook/bart-large-mnli",
      inputs: truncatedText,
      parameters: {
        candidate_labels: ["high priority", "medium priority", "low priority"],
      },
    });

    // The response format can vary based on the actual HuggingFace API response
    // For simplicity and to avoid type errors, let's use a simple approach:
    const result = response as any;

    // Find the label with the highest score
    let highestScore = 0;
    let highestLabel = "medium priority";

    if (result.scores && result.labels) {
      // Original expected format
      const index = result.scores.indexOf(Math.max(...result.scores));
      highestLabel = result.labels[index];
    } else if (Array.isArray(result)) {
      // Alternative format
      for (const item of result) {
        if (item.score > highestScore) {
          highestScore = item.score;
          highestLabel = item.label;
        }
      }
    }

    // Convert label to our priority type
    if (highestLabel.includes("high")) return "high";
    if (highestLabel.includes("medium")) return "medium";
    return "low";
  } catch (error) {
    console.error("Error classifying priority:", error);
    return "medium"; // Default to medium if there's an error
  }
}
