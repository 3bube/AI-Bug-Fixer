import groq from "../utils/grop";

async function getBugFixSuggestion(diff: string) {
  const response = await groq.chat.completions.create({
    model: "mixtral-8x7b-32768", // or 'llama3-70b-8192'
    messages: [
      {
        role: "system",
        content:
          "You are an expert software engineer that explains and fixes bugs in code.",
      },
      {
        role: "user",
        content: `Here is a code diff that may contain a bug:\n\n${diff}\n\nExplain the bug and suggest a fix.`,
      },
    ],
  });

  const reply = response.choices[0]?.message?.content;
  return reply;
}
