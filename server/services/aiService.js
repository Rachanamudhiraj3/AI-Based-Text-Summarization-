import axios from "axios";

export const summarizeWithChunks = async (text) => {

  const chunkSize = 1200;
  const maxChunks = 3;

  let promises = [];

  for (
    let i = 0;
    i < text.length && promises.length < maxChunks;
    i += chunkSize
  ) {

    const chunk = text.substring(i, i + chunkSize);

    promises.push(

      axios.post(
        "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
        {
          inputs: chunk,
          parameters: {
            max_length: 120,
            min_length: 50
          }
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

  const summaries = responses.map(
    (r) => r.data[0]?.summary_text
  );

  return summaries.join(" ");
};