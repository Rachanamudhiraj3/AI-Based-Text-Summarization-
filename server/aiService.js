import axios from "axios";

export const summarizeWithChunks = async (text) => {
  const chunkSize = 1000;
  const maxChunks = 5;

  let promises = [];

  for (let i = 0; i < text.length && promises.length < maxChunks; i += chunkSize) {
    const chunk = text.substring(i, i + chunkSize);

    promises.push(
      axios.post(
        "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
        {
          inputs: `
Give:
1. Summary
2. Bullet Points
3. Keywords

Text:
${chunk}
`
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          },
        }
      )
    );
  }

  const responses = await Promise.all(promises);

  const summaries = responses.map(r => r.data[0]?.summary_text);

  return summaries.join("\n\n");
};