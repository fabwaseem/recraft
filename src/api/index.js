import axios from "axios";
import { createSVGFromJSON, getRandomNumber } from "../lib/utils";
import Image from "image-js";

export const generateImages = async ({
  token,
  prompt,
  layer_size,
  image_type = "realistic_image",
}) => {
  try {
    const payload = {
      prompt,
      image_type,
      negative_prompt: "",
      user_controls: {},
      layer_size,
      random_seed: getRandomNumber(10),
      developer_params: {},
    };

    const response = await axios.post(
      `https://api.recraft.ai/queue_recraft/prompt_to_image`,
      { ...payload },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response;
  } catch (error) {
    throw error;
  }
};
export const getImagesById = async ({ token, id, prompt }) => {
  try {
    const response = await axios.get(
      `https://api.recraft.ai/poll_recraft?operation_id=${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const imagesData = response.data.images;
    const images = [];
    for (const image of imagesData) {
      if (image.vector_image) {
        console.log(image);
        const svgData = createSVGFromJSON(image.rector);
        console.log(svgData);
      } else {
        const newImage = await getImageById({
          token,
          id: image.image_id,
          prompt,
        });
        images.push(newImage);
      }
    }
    return images;
  } catch (error) {
    throw error;
  }
};
export const getImageById = async ({ token, id, prompt }) => {
  try {
    const response = await axios.get(`https://api.recraft.ai/image/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "arraybuffer",
    });
    const blob = new Blob([response.data], { type: "image/png" });
    const imageURL = URL.createObjectURL(blob);
    const image = await Image.load(imageURL);
    const imageData = {
      url: imageURL,
      width: image.width,
      height: image.height,
      prompt,
      bgRemoved: false,
      loading: false,
      upscaled: false,
    };
    return imageData;
  } catch (error) {
    throw error;
  }
};

export const removeBg = async ({ image, token }) => {
  try {
    const response = await axios.post(
      `https://api.recraft.ai/project/82338175-2411-4983-9c0a-4acb10191148/remove_background`,
      {
        image: {
          data_url: image,
        },
        return_vector: false,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response;
  } catch (error) {
    throw error;
  }
};
export const upscale = async ({ image, token }) => {
  try {
    const response = await axios.post(
      `https://api.recraft.ai/project/82338175-2411-4983-9c0a-4acb10191148/super_resolution`,
      {
        image: {
          data_url: image,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response;
  } catch (error) {
    throw error;
  }
};
