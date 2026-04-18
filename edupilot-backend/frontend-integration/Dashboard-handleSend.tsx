/**
 * INSTRUCTIONS: In your Dashboard.tsx, replace the entire handleSend function
 * (from `const handleSend = () => {` to its closing `}`) with the code below.
 *
 * Also add this import at the top of Dashboard.tsx:
 *   import { chatSend, type ChatMessage } from '../../lib/api';
 *
 * And add this state variable near your other useState declarations:
 *   const [isLoading, setIsLoading] = useState(false);
 */

// ─── PASTE THIS handleSend replacement into Dashboard.tsx ────────────────────

const handleSend = async () => {
  if (!input.trim() || isLoading) return;

  const userMessage = { role: "user" as const, content: input };
  const updatedMessages = [...messages, userMessage];
  setMessages(updatedMessages);
  setInput("");
  setIsLoading(true);

  // Add a "thinking" placeholder
  setMessages((prev) => [
    ...prev,
    { role: "assistant", content: "..." },
  ]);

  try {
    // Read user profile from localStorage (saved during Onboarding)
    const storedProfile = localStorage.getItem("edupilot-user");
    const userProfile = storedProfile ? JSON.parse(storedProfile) : {};

    const response = await chatSend(
      updatedMessages.map((m) => ({ role: m.role as ChatMessage["role"], content: m.content })),
      userProfile
    );

    // Replace the "..." placeholder with the real reply
    setMessages((prev) => [
      ...prev.slice(0, -1),
      { role: "assistant", content: response.reply },
    ]);
  } catch (err) {
    setMessages((prev) => [
      ...prev.slice(0, -1),
      {
        role: "assistant",
        content: "⚠️ Couldn't reach the AI mentor right now. Make sure the backend is running.",
      },
    ]);
  } finally {
    setIsLoading(false);
  }
};

// ─── Also update your send button JSX to disable while loading ───────────────
// Find your <Button onClick={handleSend}> and change it to:
//
//   <Button onClick={handleSend} disabled={isLoading}>
//     {isLoading ? (
//       <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
//     ) : (
//       <Send className="w-4 h-4" />
//     )}
//   </Button>
