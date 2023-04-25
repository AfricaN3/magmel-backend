import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { makeChain } from "../utils/makeChain.js";
import { pinecone } from "../utils/pinecone.js";
import openai from "../utils/openAi.js";
import * as dotenv from "dotenv";

dotenv.config();

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

export async function chatWithFile(req, res) {
  const { question, history } = req.body;
  const { fileId } = req.params;

  if (!question) {
    return res.status(400).json({ message: "No question in the request" });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replace(/\n/g, " ");

  try {
    const moderationResponse = await openai.createModeration({
      input: sanitizedQuestion,
    });

    const [results] = moderationResponse.data.results;

    if (results.flagged) {
      return res.status(401).send("Flagged Content");
    }

    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: "text",
        namespace: fileId,
      }
    );

    //create chain
    const chain = makeChain(vectorStore);
    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
}
