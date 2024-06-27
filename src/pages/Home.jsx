import React, { useEffect, useState } from "react";
import MasonaryLayout from "../components/MasonaryLayout";
import {
  generateImages,
  getImageById,
  getImagesById,
  removeBg,
  upscale,
} from "../api";
import { DownloadButton } from "../components";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { generatePrompt, handleDownloadAll } from "../lib/utils";
import Image from "image-js";
import {
  ArrowsPointingOutIcon,
  ScissorsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { presets, sizes } from "../lib/config";
import DownloadSvg from "../components/DownloadSvg";

const Home = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [selectedPresetType, setSelectedPresetType] = useState(0);

  const [formData, setFormData] = useState({
    prompt: "",
    enhance: false,
    multiplier: 1,
    extension: "jpg",
    token: "",
    filnameLength: 100,
    autoUpscale: false,
  });

  const handleChangePreset = (selectedOptions) => {
    setSelectedPresetType(selectedOptions.value);
    // setSelectedStyles([]);
  };
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        token,
      }));
    }
  }, []);

  const [inProgress, setInProgress] = useState(0);

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (formData.prompt === "") {
      return toast.error("Write a pormpt or a keyword");
    }

    if (selectedStyles.length < 1) {
      return toast.error("Select at least one style");
    }
    if (selectedSizes.length < 1) {
      return toast.error("Select at least one size");
    }

    selectedSizes.forEach(() => {
      selectedStyles.forEach(() => {
        setInProgress((prev) => prev + 2);
      });
    });

    selectedSizes.forEach(async (size) => {
      const layer_size = {
        height: size.height,
        width: size.width,
      };
      selectedStyles.forEach(async (style) => {
        let prompt = formData.prompt;
        if (formData.enhance) {
          prompt = await generatePrompt(
            formData.prompt + " in style of " + style.label,
          );
        }
        setFormData((prev) => {
          return { ...prev, prompt };
        });

        generate(layer_size, style, prompt).then(() => {
          setInProgress((prev) => prev - 2);
        });
      });
    });
  };

  const generate = async (layer_size, style, prompt) => {
    try {
      const response = await generateImages({
        prompt,
        token: formData.token,
        layer_size,
        image_type: style.value,
      });
      await fetchImages(response.data.operationId, prompt);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchImages = async (id, prompt) => {
    try {
      const response = await getImagesById({
        token: formData.token,
        id,
        prompt,
      });

      setImages((prevImages) => [...response, ...prevImages]);

      if (formData.autoUpscale) {
        response.forEach(async (image) => {
          handleUpscale(image);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);

  const sizeOptions = sizes.map((size) => ({
    value: size,
    label: `${size.width} x ${size.height} (${size.ratio})`,
  }));

  const handleChange = (selectedOptions) => {
    setSelectedSizes(
      selectedOptions ? selectedOptions.map((option) => option.value) : [],
    );
    console.log(selectedSizes);
  };
  const handleChangeStyles = (selectedOptions) => {
    setSelectedStyles(
      selectedOptions
        ? selectedOptions.map((option) => {
            return {
              value: option.value,
              label: option.label,
            };
          })
        : [],
    );
    console.log(selectedStyles);
  };

  const handleRemove = async (image) => {
    const imageData = await Image.load(image.url);
    const base64 = await imageData.toDataURL("image/png");
    // set image.loading to true
    setImages((prevImages) => {
      return prevImages.map((prevImage) => {
        if (prevImage.url === image.url) {
          return {
            ...prevImage,
            loading: true,
          };
        }
        return prevImage;
      });
    });
    const res = await removeBg({ image: base64, token: formData.token });
    const newImageId = res.data.result.image_id;

    const newImage = await getImageById({
      token: formData.token,
      id: newImageId,
      prompt: image.prompt,
    });
    setImages((prevImages) => {
      return prevImages.map((prevImage) => {
        if (prevImage.url === image.url) {
          return {
            ...newImage,
            bgRemoved: true,
            loading: false,
          };
        }
        return prevImage;
      });
    });
  };
  const handleUpscale = async (image) => {
    const imageData = await Image.load(image.url);
    const base64 = await imageData.toDataURL("image/png");
    // set image.loading to true
    setImages((prevImages) => {
      return prevImages.map((prevImage) => {
        if (prevImage.url === image.url) {
          return {
            ...prevImage,
            loading: true,
          };
        }
        return prevImage;
      });
    });
    const res = await upscale({ image: base64, token: formData.token });
    const newImageId = res.data.result.image_id;

    const newImage = await getImageById({
      token: formData.token,
      id: newImageId,
      prompt: image.prompt,
    });
    setImages((prevImages) => {
      return prevImages.map((prevImage) => {
        if (prevImage.url === image.url) {
          return {
            ...newImage,
            upscaled: true,
            loading: false,
          };
        }
        return prevImage;
      });
    });
  };

  const handleDelete = (index) => {
    setImages((prevImages) => {
      return prevImages.filter((_, i) => i !== index);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-[600] text-[#414141]  dark:text-white">
            Welcome Mate!
          </h1>
          <h1 className="mt-3 text-3xl text-dark dark:text-white ">
            Generate Some Beautiful Photos Today {inProgress > 0 && inProgress}
          </h1>
        </div>
      </div>

      <form action="" onSubmit={handleGenerate}>
        <div className="mt-8 flex items-center gap-5">
          <div className="h-[4.5rem] flex-1 rounded-full border pr-2 dark:border-gray-600 dark:text-white">
            <div className="flex h-full w-full items-center">
              <input
                type="text"
                className="h-full w-full bg-transparent pl-8 outline-none"
                placeholder="Write a full prompt or just a keyword to let AI imagine the best"
                value={formData.prompt}
                onChange={(e) =>
                  setFormData((prev) => {
                    return { ...prev, prompt: e.target.value };
                  })
                }
              />
              <button
                type="submit"
                className="btn btn-primary h-[80%] bg-primary px-12 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <p>Generate</p>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label
              htmlFor="enhance"
              className="text-xl text-dark dark:text-white "
            >
              Let AI do the magic
            </label>
            <label className="inline-flex cursor-pointer items-center">
              <input
                id="enhance"
                type="checkbox"
                className="peer sr-only"
                checked={formData.enhance}
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, enhance: e.target.checked };
                  });
                }}
              />
              <div className="after:start-[2px] peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {formData.enhance ? "On" : "Off"}
              </span>
            </label>
          </div>
        </div>
      </form>
      <div className="flex gap-5">
        <div className="flex-1">
          <h1 className="mt-5  text-xl text-dark dark:text-white ">Preset</h1>
          <Select
            options={presets.map((preset, index) => ({
              value: index,
              label: preset.preset,
            }))}
            value={{
              value: selectedPresetType,
              label: presets[selectedPresetType].preset,
            }}
            onChange={handleChangePreset}
            classNames={{
              control: () => "dark:bg-darkBg",
              menu: () => "dark:bg-dark",
              option: () => "dark:hover:text-dark ",
            }}
          />
        </div>
        <div className="flex-1">
          <h1 className="mt-5  text-xl text-dark dark:text-white ">
            Image Styles
          </h1>
          <Select
            options={presets[selectedPresetType].styles}
            isMulti
            value={selectedStyles.map((style) => ({
              value: style.value,
              label: style.label,
            }))}
            onChange={handleChangeStyles}
            classNames={{
              control: () => "dark:bg-darkBg",
              menu: () => "dark:bg-dark",
              option: () => "dark:hover:text-dark ",
            }}
          />
        </div>
        <div className="flex-1">
          <h1 className="mt-5  text-xl text-dark dark:text-white ">
            Image Sizes
          </h1>
          <Select
            options={sizeOptions}
            isMulti
            value={selectedSizes.map((size) => ({
              value: size,
              label: `${size.width} x ${size.height} (${size.ratio})`,
            }))}
            classNames={{
              control: () => "dark:bg-darkBg",
              menu: () => "dark:bg-dark",
              option: () => "dark:hover:text-dark ",
            }}
            onChange={handleChange}
          />
        </div>
        <div>
          <h1 className="mt-5  text-xl text-dark dark:text-white ">
            Auto Upscale
          </h1>
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={formData.autoUpscale}
              onChange={(e) => {
                setFormData((prev) => {
                  return { ...prev, autoUpscale: e.target.checked };
                });
              }}
            />
            <div className="after:start-[2px] peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {formData.autoUpscale ? "On" : "Off"}
            </span>
          </label>
        </div>
      </div>
      <div className="mt-5 flex gap-5">
        <div className="relative flex-1">
          <select
            className=" peer block w-full rounded-lg border bg-transparent p-4 text-sm text-dark dark:border-gray-600 dark:text-white [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2"
            onChange={(e) => {
              setFormData((prev) => {
                return { ...prev, extension: e.target.value };
              });
            }}
          >
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
          </select>
          <label
            className="start-0 pointer-events-none absolute top-0 h-full truncate border border-transparent p-4 transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500
    peer-disabled:pointer-events-none
    peer-disabled:opacity-50
    peer-[:not(:placeholder-shown)]:-translate-y-1.5
    peer-[:not(:placeholder-shown)]:text-xs
    peer-[:not(:placeholder-shown)]:text-gray-500
    dark:text-white"
          >
            Extension
          </label>
        </div>
        <div className="relative flex-1">
          <input
            type="number"
            className=" peer block w-full rounded-lg border bg-transparent p-4 text-sm text-dark dark:border-gray-600 dark:text-white [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2"
            min={1}
            value={formData.multiplier}
            onChange={(e) => {
              setFormData((prev) => {
                return { ...prev, multiplier: e.target.value };
              });
            }}
          />
          <label
            className="start-0 pointer-events-none absolute top-0 h-full truncate border border-transparent p-4 transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500
    peer-disabled:pointer-events-none
    peer-disabled:opacity-50
    peer-[:not(:placeholder-shown)]:-translate-y-1.5
    peer-[:not(:placeholder-shown)]:text-xs
    peer-[:not(:placeholder-shown)]:text-gray-500
    dark:text-white"
          >
            Multiplier
          </label>
        </div>
        <div className="relative flex-1">
          <input
            type="number"
            className=" peer block w-full rounded-lg border bg-transparent p-4 text-sm text-dark dark:border-gray-600 dark:text-white [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2"
            min={1}
            value={formData.filnameLength}
            onChange={(e) => {
              setFormData((prev) => {
                return { ...prev, filnameLength: e.target.value };
              });
            }}
          />
          <label
            className="start-0 pointer-events-none absolute top-0 h-full truncate border border-transparent p-4 transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500
    peer-disabled:pointer-events-none
    peer-disabled:opacity-50
    peer-[:not(:placeholder-shown)]:-translate-y-1.5
    peer-[:not(:placeholder-shown)]:text-xs
    peer-[:not(:placeholder-shown)]:text-gray-500
    dark:text-white"
          >
            Filename Length
          </label>
        </div>
      </div>
      <h1 className="mt-8 mb-2 flex items-center gap-2 text-3xl text-dark dark:text-white ">
        Generated Images{" "}
        <button
          className={`rounded-md border p-1 text-xs hover:bg-gray-100 focus:outline-none  focus:ring focus:ring-blue-300`}
          onClick={() => setImages([])}
        >
          Clear all
        </button>
        <button
          className={`rounded-md border p-1 text-xs hover:bg-gray-100 focus:outline-none  focus:ring focus:ring-blue-300`}
          onClick={() => handleDownloadAll(images,formData)}
        >
          Download all
        </button>
      </h1>

      <MasonaryLayout>
        {images.map((image, index) => (
          <div key={index}>
            <div className="group relative overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
              {image.loading && (
                <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center bg-[#00000038] text-white">
                  <div className="h-5 w-5 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></div>
                  <div className="h-5 w-5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></div>
                  <div className="h-5 w-5 animate-bounce rounded-full bg-white"></div>
                </div>
              )}
              {/* remove button */}
              <div className="absolute -top-20 right-2  flex gap-3 opacity-0 transition-all group-hover:top-1 group-hover:opacity-100">
                <span
                  className="mb-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-[#00000038] transition-all hover:bg-[#0000008a]"
                  onClick={() => handleDelete(index)}
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </span>
              </div>
              <div className="absolute bottom-1 left-2 flex h-10 items-center rounded bg-[#00000038] px-4 text-white">
                {formData.multiplier * image.width} x{" "}
                {formData.multiplier * image.height}
              </div>
              <div className="absolute -bottom-20 right-2  flex gap-3 opacity-0 transition-all group-hover:bottom-0 group-hover:opacity-100">
                {image.isVector ? (
                  <DownloadSvg
                    svg={image.url}
                    fileName={
                      image.prompt
                        .replace(/[^a-zA-Z0-9 ]/g, "")
                        .slice(0, formData.filnameLength) || "image"
                    }
                    sizeMultiplier={formData.multiplier}
                    index={index}
                    setImages={setImages}
                  />
                ) : (
                  <DownloadButton
                    blob={image.url}
                    fileName={
                      image.prompt
                        .replace(/[^a-zA-Z0-9 ]/g, "")
                        .slice(0, formData.filnameLength) || "image"
                    }
                    extension={image.bgRemoved ? "png" : formData.extension}
                    sizeMultiplier={formData.multiplier}
                    index={index}
                    setImages={setImages}
                  />
                )}
                {!image.bgRemoved && !image.loading && (
                  <span
                    className="mb-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-[#00000038] transition-all hover:bg-[#0000008a]"
                    onClick={() => handleRemove(image)}
                  >
                    <ScissorsIcon className="h-6 w-6 text-white" />
                  </span>
                )}
                {!image.upscaled && !image.loading && (
                  <span
                    className="mb-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-[#00000038] transition-all hover:bg-[#0000008a]"
                    onClick={() => handleUpscale(image)}
                  >
                    <ArrowsPointingOutIcon className="h-6 w-6 text-white" />
                  </span>
                )}
              </div>
              <img
                src={image.thumb}
                alt={index}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="">{image.prompt}</p>
          </div>
        ))}
      </MasonaryLayout>
    </div>
  );
};

export default Home;
