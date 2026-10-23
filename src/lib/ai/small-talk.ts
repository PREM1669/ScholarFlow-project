const GREETING = /^(hi+|hello|hey|good (morning|afternoon|evening))[\s!.,?]*$/i;
const THANKS =
  /^(thanks|thank you|thx|ty|cheers)[\s!.,]*(a lot|so much|very much)?[\s!.,]*$/i;
const CAPABILITY =
  /^(what can you (do|help( me)? with)|how can you help( me)?|help)[\s?!.]*$/i;

export function smallTalkReply(text: string, courseTitle: string): string | null {
  const question = text.trim();
  if (GREETING.test(question)) {
    return `Hi! I'm the assistant for "${courseTitle}". Ask me about anything covered in the course sections.`;
  }
  if (THANKS.test(question)) {
    return "You're welcome! Ask another question any time.";
  }
  if (CAPABILITY.test(question)) {
    return `I can explain, summarize and clarify topics from "${courseTitle}". Try asking about a specific section.`;
  }
  return null;
}
