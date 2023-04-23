import openai from "../utils/openAi.js";

/* MODERATES PROMPT */
export const moderatePrompt = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    const sanitizedPrompt = prompt.trim().replace(/\n/g, " ");

    const moderationResponse = await openai.createModeration({
      input: sanitizedPrompt,
    });

    const [results] = moderationResponse.data.results;

    if (results.flagged) {
      return res.status(401).send("Flagged Content");
    }

    req.flagged = results.flagged;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.response?.statusText || "Something went wrong");
  }
};
