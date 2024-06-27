import axios from "axios";
import {
  createSVGFromJSON,
  getRandomNumber,
  svgToPngDataUrl,
} from "../lib/utils";
import Image from "image-js";

export const generateImages = async ({
  token,
  prompt,
  layer_size,
  image_type = "realistic_image",
  formData,
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

    if (formData.complexity) {
      payload.user_controls = {
        complexity: parseInt(formData.complexity),
      };
    }

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
        const svgData = createSVGFromJSON(image.rector);
        const dataUrl = await svgToPngDataUrl(
          svgData,
          image.rector.width,
          image.rector.height,
        );
        const loadedImage = await Image.load(dataUrl);
        const thumb = loadedImage.resize({
          width: 1000,
          preserveAspectRatio: true,
        });
        const thumbUrl = thumb.toDataURL();
        const imageData = {
          thumb: thumbUrl,
          url: svgData,
          width: image.rector.width,
          height: image.rector.height,
          prompt,
          bgRemoved: false,
          loading: false,
          upscaled: false,
          isVector: true,
        };
        images.push(imageData);
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
    const thumb = image.resize({ width: 1000, preserveAspectRatio: true });
    const thumbUrl = thumb.toDataURL();
    const imageData = {
      thumb: thumbUrl,
      url: imageURL,
      width: image.width,
      height: image.height,
      prompt,
      bgRemoved: false,
      loading: false,
      upscaled: false,
      isVector: false,
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
