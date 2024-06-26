import OpenAI from "openai";

export const getRandomNumber = (len) => {
  return Math.floor(Math.random() * len);
};

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});

export const generatePrompt = async (prompt) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          'You are a prompt generator for AI image generator to guide it to craft the best photos which I can sell as a stock photo on adobe stock.Don\'t write in the prompt asking about many thing just focus on the main subject and add some details to make it more interesting.and define how the image should look like. and also add some details about the image. and background,write propmt in a way that it should be easy to understand for the AI image generator. like create comma separated keywords dont write full sentences. As a prompt generator for a generative AI called "Midjourney", you will create image prompts for the AI to visualize. I will give you a concept, and you will provide a detailed prompt for Midjourney AI to generate an image.\r\n\r\nPlease adhere to the structure and formatting below, and follow these guidelines:\r\n\r\n- Do not use the words "description" or ":" in any form.\r\n\r\nStructure:\r\n[1] = [PROMPT]\r\n[2] = a detailed description of [1] with specific imagery details.\r\n[3] = a detailed description of the scene\'s environment.\r\n[4] = a detailed description of the scene\'s mood, feelings, and atmosphere.\r\n[5] = A style (e.g. photography, painting, illustration, sculpture, artwork, paperwork, 3D, etc.) for [1].\r\n[6] = A description of how [5] will be executed (e.g. camera model and settings, painting materials, rendering engine settings, etc.)\r\n\r\nFormatting: \r\nFollow this prompt structure: "[1], [2], [3], [4], [5], [6]".\r\n\r\nYour task: Create a prompt for concept [1]\r\n\r\n- Do not describe unreal concepts as "real" or "photographic".\r\n- Include one realistic photographic style prompt with lens type and size.\r\n\r\nExample Prompts:\r\nPrompt 1:\r\n A stunning Halo Reach landscape with a Spartan on a hilltop, lush green forests surround them, clear sky, distant city view, focusing on the Spartan\'s majestic pose, intricate armor, and weapons, Artwork, oil painting on canvas\r\nPrompt 2:\r\n/ A captivating Halo Reach landscape with a Spartan amidst a battlefield, fallen enemies around, smoke and fire in the background, emphasizing the Spartan\'s determination and bravery, detailed environment blending chaos and beauty, Illustration, digital art. Dont add any special characters',
      },
      {
        role: "user",
        content: `Generate a prompt based on the keyword ${prompt}`,
      },
    ],
    model: "gpt-3.5-turbo",
  });
  return chatCompletion.choices[0].message.content;
};

export const createSVGFromJSON = (data) => {
  const { width, height, shapes, styles } = data;

  const styleDict = styles.reduce((acc, style, index) => {
    acc[index] = style;
    return acc;
  }, {});

  const paths = shapes
    .map((shape, index) => {
      const style = styleDict[shape.style_index];
      const fill = style.fill.solid_color.rgba_hex;
      const stroke =
        style.stroke.style_type === "none" ? "none" : style.stroke.style_type;
      const strokeWidth = style.stroke_width;

      return `<path d="${shape.svg_path}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
    })
    .join("");

  const svgString = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${paths}</svg>`;

  return svgString;
};
