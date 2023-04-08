import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { Buffer } from "buffer";
import axios from "axios";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/* GENERATE IMAGE */

// export const generateImage = async (req, res) => {
//   try {
//     const { prompt } = req.body;

//     const aiResponse = await openai.createImage({
//       prompt,
//       n: 1,
//       size: "1024x1024",
//       response_format: "b64_json",
//     });

//     const image = aiResponse.data.data[0].b64_json;
//     const formatted_image = `data:image/jpeg;base64,${image}`;
//     res.status(200).json({ photo: formatted_image });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .send(error?.response.data.error.message || "Something went wrong");
//   }
// });

export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    // You can replace this with different model API's
    const URL = `https://api-inference.huggingface.co/models/prompthero/openjourney`;
    const styledPrompts = `mdjrny-v4 style ${prompt}`;

    // Send the request
    const response = await axios({
      url: URL,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        inputs: styledPrompts,
        options: { wait_for_model: true },
      }),
      responseType: "arraybuffer",
    });

    const data = response.data;
    const type = response.headers["content-type"];

    const base64data = Buffer.from(data).toString("base64");
    const img = `data:${type};base64,` + base64data; // <-- This is so we can render it on the page

    res.status(200).json({ photo: img, data: data });
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.response?.statusText || "Something went wrong");
  }
};

/* GENERATE PROMPT */
export const generatePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    const aiResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a prompt generator for Midjourney's artificial intelligence program. Your job is to provide detailed and creative descriptions that will inspire unique and interesting images from the AI. Keep in mind that the AI is capable of understanding a wide range of language and can interpret abstract concepts, so feel free to be as imaginative and descriptive as possible. The prompt must not exceed thirty words. For example, you could describe a scene from a futuristic city, or a surreal landscape filld with strange creatures. The more detailed and imaginative your description, the more interesting the resulting image will be.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const completions = aiResponse.data.choices[0].message.content;
    const finishReason = aiResponse.data.choices[0].finish_reason;
    if (finishReason === "stop") {
      res.status(200).json({ generated: completions });
    } else if (finishReason === "length") {
      res
        .status(400)
        .send(
          "Incomplete model output due to max_tokens parameter or token limit"
        );
    } else if (finishReason === "content_filter") {
      res
        .status(400)
        .send("Omitted content due to a flag from our content filters");
    } else {
      res.status(400).send("API response is incomplete");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.response.statusText || "Something went wrong");
  }
};

/* SUMMARIZE PROMPT */
export const summarizePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    const aiResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a prompt generator for Midjourney's artificial intelligence program. Your job is to summarize the input provided by the user and provide detailed and concise descriptions that will inspire unique and interesting images from the AI. Keep in mind that the AI is capable of understanding a wide range of language and can interpret abstract concepts, so feel free to be as concise and descriptive as possible. The prompt must not exceed thirty words. The more detailed and concise your description from the input, the more interesting the resulting image will be.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const completions = aiResponse.data.choices[0].message.content;
    const finishReason = aiResponse.data.choices[0].finish_reason;
    if (finishReason === "stop") {
      res.status(200).json({ generated: completions });
    } else if (finishReason === "length") {
      res
        .status(400)
        .send(
          "Incomplete model output due to max_tokens parameter or token limit"
        );
    } else if (finishReason === "content_filter") {
      res
        .status(400)
        .send("Omitted content due to a flag from our content filters");
    } else {
      res.status(400).send("API response still in progress or incomplete");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.response.statusText || "Something went wrong");
  }
};
