import * as dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "langchain/prompts";
import { Buffer } from "buffer";
import axios from "axios";

dotenv.config();

const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
});

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
    const sanitizedPrompt = prompt.trim().replaceAll("\n", " ");
    // ensure prompt is valid
    // You can replace this with different model API's
    const URL = `https://api-inference.huggingface.co/models/prompthero/openjourney`;
    const styledPrompts = `mdjrny-v4 style ${sanitizedPrompt}`;

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

    const sanitizedPrompt = prompt.trim().replaceAll("\n", " ");

    const translationPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "You are a prompt generator for Midjourney's artificial intelligence program. Your job is to transform texts submitted by users to prompts that will provide detailed and creative descriptions that will inspire unique and interesting images from the AI. Keep in mind that the AI is capable of understanding a wide range of language and can interpret abstract concepts, so feel free to be as imaginative and descriptive as possible. The prompt generated must not exceed forty words. For example, a user text which states: An astronaut riding a horse on the moon can be transformed to the prompt: 'The astronaut and his horse trot across the barren lunar landscape, their long shadows stretching out before them as the Earth looms large in the star-filled sky above'. You could describe a scene from a futuristic city, or a surreal landscape filled with strange creatures. The more detailed and imaginative your description, the more interesting the resulting image will be."
      ),
      HumanMessagePromptTemplate.fromTemplate("{text}"),
    ]);

    const responseA = await chat.generatePrompt([
      await translationPrompt.formatPromptValue({
        text: sanitizedPrompt,
      }),
    ]);

    const completions = responseA.generations[0][0].text;

    // ensure prompt is valid

    res.status(200).json({ generated: completions });
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.response?.statusText || "Something went wrong");
  }
};

/* SUMMARIZE PROMPT */
export const summarizePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    const sanitizedPrompt = prompt.trim().replaceAll("\n", " ");

    const translationPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "You are a prompt generator for Midjourney's artificial intelligence program. Your job is to summarize the input provided by the user which should provide a detailed and concise descriptions that will inspire unique and interesting images from the AI. Keep in mind that the AI is capable of understanding a wide range of language and can interpret abstract concepts, so feel free to be as concise and descriptive as possible. The prompt must not exceed forty words. The more detailed and concise your description from the input, the more interesting the resulting image will be."
      ),
      HumanMessagePromptTemplate.fromTemplate("{text}"),
    ]);

    const responseA = await chat.generatePrompt([
      await translationPrompt.formatPromptValue({
        text: sanitizedPrompt,
      }),
    ]);

    const completions = responseA.generations[0][0].text;

    // ensure prompt is valid

    res.status(200).json({ generated: completions });
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.response?.statusText || "Something went wrong");
  }
};
