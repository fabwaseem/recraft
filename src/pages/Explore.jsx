import axios from "axios";
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";

const Explore = () => {
  const [keyword, setKeyword] = useState("");
  const [contentType, setContentType] = useState({
    photo: true,
    zip_vector: true,
    illustration: true,
    image: true,
  });
  const [loading, setLoading] = useState(false);
  const [searches, setSearches] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode");
    if (isDarkMode) {
      setDarkMode(true);
    }
  }, [localStorage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword) return;
    setLoading(true);

    const url = `https://stock.adobe.com/search/images?filters%5Bcontent_type%3Aphoto%5D=1&filters%5Bcontent_type%3Aillustration%5D=0&filters%5Bcontent_type%3Azip_vector%5D=0&filters%5Bcontent_type%3Avideo%5D=0&filters%5Bcontent_type%3Atemplate%5D=0&filters%5Bcontent_type%3A3d%5D=0&filters%5Bcontent_type%3Aaudio%5D=0&filters%5Bcontent_type%3Aimage%5D=1&filters%5Boffensive%3A2%5D=1&filters%5Binclude_stock_enterprise%5D=0&filters%5Bis_editorial%5D=0&k=${keyword}&order=relevance&safe_search=0&search_type=pagination&limit=100&search_page=${1}&get_facets=0`;

    const apiUrl = `https://stock.adobe.com/Ajax/Search?filters%5Bcontent_type%3Aphoto%5D=1&filters%5Bcontent_type%3Aillustration%5D=0&filters%5Bcontent_type%3Azip_vector%5D=0&filters%5Bcontent_type%3Avideo%5D=0&filters%5Bcontent_type%3Atemplate%5D=0&filters%5Bcontent_type%3A3d%5D=0&filters%5Bcontent_type%3Aaudio%5D=0&filters%5Bcontent_type%3Aimage%5D=1&filters%5Boffensive%3A2%5D=1&filters%5Binclude_stock_enterprise%5D=0&filters%5Bis_editorial%5D=0&k${keyword}&order=relevance&safe_search=0&limit=100&search_type=filter-select&get_facets=1`;

    try {
      const response = await axios.get(url);
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, "text/html");
      const assetsDetailsScriptTag = doc.querySelector("#image-detail-json");
      const searchDetailsScriptTag = doc.querySelector("#js-page-config");
      let data = {
        keyword,
        assetsDetails: {},
        searchDetails: {},
      };
      if (assetsDetailsScriptTag) {
        const assetsDetails = JSON.parse(assetsDetailsScriptTag.textContent);
        data.assetsDetails = assetsDetails;
      }
      if (searchDetailsScriptTag) {
        const searchDetails = JSON.parse(searchDetailsScriptTag.textContent);
        data.searchDetails = searchDetails;
      }
      console.log(searches);
      setSearches((prev) => [...prev, data]);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
    },
    {
      name: "Keyword",
      selector: (row) => row.keyword,
      sortable: true,
    },
    {
      name: "Total Assets",
      selector: (row) => row.searchDetails.search_pagination.total_results || 0,
      sortable: true,
    },
    {
      name: "Total Pages",
      selector: (row) => row.searchDetails.search_pagination.total_pages || 0,
      sortable: true,
    },
  ];

  const ExpandedComponent = ({ data }) => {
    const dataToDisplay = {};

    dataToDisplay.types = data.searchDetails.facets.asset_type;

    return <pre>{JSON.stringify(dataToDisplay, null, 2)}</pre>;
  };

  const searchTypes = [
    "photo",
    "zip_vector",
    "illustration",
    "3d",
    "image",
  ];

  return (
    <div>
      <form action="" onSubmit={handleSubmit} className="mb-10">
        <div className="flex items-center gap-5">
          <div className="h-[4.5rem] flex-1 rounded-full border pr-2 dark:border-gray-600 dark:text-white">
            <div className="flex h-full w-full items-center">
              <input
                type="text"
                className="h-full w-full bg-transparent pl-8 outline-none"
                placeholder="Enter a keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary h-[80%] whitespace-nowrap bg-primary px-12 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? `Please wait...` : "Search"}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-between">
          {}

          <div className="flex items-center gap-4">
            <label
              htmlFor="images"
              className="text-xl text-dark dark:text-white "
            >
              Images
            </label>
            <label className="inline-flex cursor-pointer items-center">
              <input
                id="images"
                type="checkbox"
                className="peer sr-only"
                checked={searchAssetTypes.image}
                onChange={(e) => {
                  setSearchAssetTypes((prev) => {
                    return { ...prev, image: e.target.checked };
                  });
                }}
              />
              <div className="after:start-[2px] peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {searchAssetTypes.image ? "On" : "Off"}
              </span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <label
              htmlFor="illustration"
              className="text-xl text-dark dark:text-white "
            >
              Illustration
            </label>
            <label className="inline-flex cursor-pointer items-center">
              <input
                id="illustration"
                type="checkbox"
                className="peer sr-only"
                checked={searchAssetTypes.illustration}
                onChange={(e) => {
                  setSearchAssetTypes((prev) => {
                    return { ...prev, illustration: e.target.checked };
                  });
                }}
              />
              <div className="after:start-[2px] peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {searchAssetTypes.illustration ? "On" : "Off"}
              </span>
            </label>
          </div>
        </div>
      </form>

      {/* map all search in a beautiful table with number,keyword,totalAssets,total pages */}
      {/* total assetsa are in searches[0].searchDetails.search_pagination.total_results */}
      {/* total pages are in searches[0].searchDetails.search_pagination.total_pages */}
      <DataTable
        title="Search Details"
        columns={columns}
        data={searches}
        pagination
        responsive
        highlightOnHover
        striped
        dense
        theme={darkMode ? "dark" : "default"}
        expandableRows
        expandableRowsComponent={ExpandedComponent}
      />
    </div>
  );
};

export default Explore;
