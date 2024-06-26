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
import { toast } from "react-toastify";
import Select from "react-select";
import { generatePrompt } from "../lib/utils";
import Image from "image-js";
import {
  ArrowsPointingOutIcon,
  ScissorsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { presets, sizes } from "../lib/config";
import axios from "axios";
import { saveAs } from "file-saver";
import JSZip from "jszip";

const Auto = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPresetType, setSelectedPresetType] = useState(0);

  const [formData, setFormData] = useState({
    query: "",
    multiplier: 1,
    extension: "jpg",
    token: "",
    filnameLength: 100,
    autoUpscale: false,
    page: 1,
  });

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
  };
  const handleChangePreset = (selectedOptions) => {
    setSelectedPresetType(selectedOptions.value);
    // setSelectedStyles([]);
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

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (formData.query === "") {
      return toast.error("Write a keyword or link");
    }
    if (selectedStyles.length < 1) {
      return toast.error("Select at least one style");
    }
    if (selectedSizes.length < 1) {
      return toast.error("Select at least one size");
    }
    setLoading(true);
    let url = "";
    if (formData.query.includes("http")) {
      url = formData.query;
      if (url.includes("search_page")) {
        url = url.replace(/search_page=\d+/, `search_page=${formData.page}`);
      } else {
        url = `${url}&search_page=${formData.page}`;
      }
    } else {
      const searchUrl = `https://stock.adobe.com/search/images?filters%5Bcontent_type%3Aphoto%5D=1&filters%5Bcontent_type%3Aillustration%5D=0&filters%5Bcontent_type%3Azip_vector%5D=0&filters%5Bcontent_type%3Avideo%5D=0&filters%5Bcontent_type%3Atemplate%5D=0&filters%5Bcontent_type%3A3d%5D=0&filters%5Bcontent_type%3Aaudio%5D=0&filters%5Bcontent_type%3Aimage%5D=1&filters%5Boffensive%3A2%5D=1&filters%5Binclude_stock_enterprise%5D=0&filters%5Bis_editorial%5D=0&k=${formData.query}&order=relevance&safe_search=0&search_type=pagination&limit=100&search_page=${formData.page}&get_facets=0`;
      url = searchUrl;
    }

    try {
      const response = await axios.get(url);
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, "text/html");
      const scriptTag = doc.querySelector("#image-detail-json");
      if (!scriptTag) {
        return toast.error("Images not found this page");
      }
      const data = JSON.parse(scriptTag.textContent);
      const titles = extractTitles(data);
      if (!titles.length) {
        return toast.error("Images not found this page");
      }
      const totalInProgress =
        titles.length * selectedSizes.length * selectedStyles.length;
      setInProgress(totalInProgress);

      const tasks = [];

      for (const title of titles) {
        for (const size of selectedSizes) {
          const layer_size = {
            height: size.height,
            width: size.width,
          };
          for (const style of selectedStyles) {
            tasks.push(async () => {
              // const prompt = await generatePrompt(title + " " + style.label);
              await generate(layer_size, style, title);
              setInProgress((prev) => prev - 1);
            });
          }
        }
      }

      // Run tasks with a concurrency limit of 10
      await runWithConcurrency(2, tasks);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runWithConcurrency = async (limit, tasks) => {
    const results = [];
    const executing = [];

    for (const task of tasks) {
      const p = Promise.resolve().then(() => task());
      results.push(p);

      if (limit <= tasks.length) {
        const e = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);
        if (executing.length >= limit) {
          await Promise.race(executing);
        }
      }
    }

    return Promise.all(results);
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

  const extractTitles = (data) => {
    const titles = [];
    const traverse = (obj) => {
      if (typeof obj === "object") {
        for (const key in obj) {
          if (key === "title" && typeof obj[key] === "string") {
            titles.push(obj[key]);
          }
          traverse(obj[key]);
        }
      }
    };
    traverse(data);
    return titles;
  };

  const handleDownloadAll = async () => {
    // blob={image.url}
    //             fileName={
    //               image.prompt
    //                 .replace(/[^a-zA-Z0-9 ]/g, "")
    //                 .slice(0, formData.filnameLength) || "image"
    //             }
    //             extension={image.bgRemoved ? "png" : formData.extension}
    //             sizeMultiplier={formData.multiplier}
    const sizeMultiplier = formData.multiplier;
    const zip = new JSZip();
    const folder = zip.folder("images");

    const promises = images.map(async (img, index) => {
      const image = await Image.load(img.url);
      const fileName =
        img.prompt
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .slice(0, formData.filnameLength) || "image";
      const extension = img.bgRemoved ? "png" : formData.extension;
      let resizedImage = image;
      if (sizeMultiplier > 1) {
        resizedImage = image.resize({
          width: image.width * sizeMultiplier,
          height: image.height * sizeMultiplier,
        });
      }

      const resizedBlob = await resizedImage.toBlob("image/png");
      const fileNameWithExtension = `${fileName} - ${index + 1}.${extension}`;
      folder.file(fileNameWithExtension, resizedBlob);
    });

    await Promise.all(promises);

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `images.zip`);
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-[600] text-[#414141]  dark:text-white">
        Welcome Mate!
      </h1>
      <h1 className="mt-3 text-3xl text-dark dark:text-white ">
        Generate Some Beautiful Photos Today {inProgress > 0 && inProgress}
      </h1>

      <form action="" onSubmit={handleGenerate}>
        <div className="mt-8  h-[4.5rem] rounded-full border pr-2 dark:border-gray-600 dark:text-white">
          <div className="flex h-full w-full items-center">
            <input
              type="text"
              className="h-full w-full bg-transparent pl-8 outline-none"
              placeholder="Enter a keyword or link"
              value={formData.query}
              onChange={(e) =>
                setFormData((prev) => {
                  return { ...prev, query: e.target.value };
                })
              }
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary h-[80%] bg-primary px-12 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <p>Generate</p>
            </button>
          </div>
        </div>
      </form>
      <div className="relative mt-5 flex-1">
        <input
          type="number"
          className=" peer block w-full rounded-lg border bg-transparent p-4 text-sm text-dark dark:border-gray-600 dark:text-white [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2"
          min={1}
          value={formData.page}
          onChange={(e) => {
            setFormData((prev) => {
              return { ...prev, page: e.target.value };
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
          Page
        </label>
      </div>
      <div className="flex gap-5">
        <div className="flex-1">
          <h1 className="mt-5  text-xl text-dark dark:text-white ">
            Select Preset
          </h1>
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
            Select Image Styles
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
            Select Image Sizes
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
          onClick={() => handleDownloadAll()}
        >
          Download all
        </button>
      </h1>

      <MasonaryLayout>
        {images.map((image, index) => (
          <div>
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800"
            >
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
                src={image.url}
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

export default Auto;
