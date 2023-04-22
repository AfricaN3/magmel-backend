import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "./pinecone.js";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import * as dotenv from "dotenv";

dotenv.config();

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

export const ingestData = async (filePath, nameSpace) => {
  try {
    /*load raw docs from the uploaded file */
    console.log("ingesting data");

    const PINECONE_NAME_SPACE = nameSpace;

    const loader = new PDFLoader(filePath);

    const rawDocs = await loader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log("split docs");

    console.log("creating vector store...");
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    //embed the PDF documents
    const args = {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: "text",
    };
    await PineconeStore.fromDocuments(docs, embeddings, args);
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to ingest your data");
  }
};

export const deleteVector = async (nameSpace) => {
  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    await index.delete1({
      namespace: nameSpace,
      deleteAll: true,
    });
  } catch (error) {
    console.log(error);
  }
};
