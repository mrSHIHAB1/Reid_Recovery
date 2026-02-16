import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient({
     keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export const extractTextFromImageBuffer = async (buffer: Buffer) => {
  const [result] = await client.textDetection({
    image: { content: buffer },
  });

  const annotations = result.textAnnotations;
  const fullText = annotations?.[0]?.description || "";
  return fullText;
};
