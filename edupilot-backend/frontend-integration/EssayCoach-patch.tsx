/**
 * INSTRUCTIONS for EssayCoach.tsx
 *
 * Step 1 — Add this import at the top:
 *   import { analyzeEssay } from '../../lib/api';
 *
 * Step 2 — Find the function that handles essay analysis
 *   (look for the button with onClick that triggers analysis).
 *   Replace its handler with the handleAnalyze function below.
 *
 * Step 3 — The response shape matches exactly what your EssayCoach
 *   already expects (overall_score, scores[], improved_version, plagiarism).
 *   So the rest of your existing render code works unchanged.
 */

// ─── PASTE this function inside your EssayCoach component ────────────────────

const handleAnalyze = async () => {
  if (!essay.trim()) return;

  // Reset previous results & start step animation
  setCurrentStep(0);
  setIsAnalyzing(true);

  // Run through the visual step animation while the real API call happens
  const stepInterval = setInterval(() => {
    setCurrentStep((prev) => {
      if (prev >= ANALYSIS_STEPS.length - 1) {
        clearInterval(stepInterval);
        return prev;
      }
      return prev + 1;
    });
  }, 600);

  try {
    const result = await analyzeEssay(essay, essayType as "sop" | "personal" | "diversity");

    // Wait for the last animation step to finish before showing results
    await new Promise((r) => setTimeout(r, 500));

    if (result.error) {
      console.error("Essay API error:", result.message);
      return;
    }

    // Build the EssayVersion object your existing state expects
    const newVersion = {
      id: Date.now().toString(),
      essayText: essay,
      essayType,
      overallScore:     result.overall_score,
      scores:           result.scores,
      improvedVersion:  result.improved_version,
      plagiarism:       result.plagiarism,
      timestamp:        new Date(),
      wordCount:        result.word_count,
    };

    // Add to history and set as current (adjust state setters to match yours)
    setVersionHistory((prev: typeof newVersion[]) => [newVersion, ...prev]);
    setCurrentVersion(newVersion);
  } catch (err) {
    console.error("Failed to analyze essay:", err);
  } finally {
    clearInterval(stepInterval);
    setIsAnalyzing(false);
  }
};
