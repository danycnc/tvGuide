const listDiv = document.getElementById("list");
const downloadButton = document.getElementById("downloadBtn");
const languageSelector = document.getElementById("langSelector");
const genreSelector = document.getElementById("genreSelector");
const summaryEl = document.getElementById("summary");

let fetchedData;
let allTitles;

window.onload = async () => {
  await getData();
  printList(fetchedData);
  getAllLanguages(fetchedData);
  getAllGenres(fetchedData);
};

const getData = async () => {
  listDiv.innerText = "Retrieving data...";
  const request = await fetch("https://api.tvmaze.com/schedule/full");
  const data = await request.json();
  fetchedData = data;
  listDiv.innerText = "";

  console.log(fetchedData);
};

const getAllLanguages = (data, langArray = []) => {
  data
    .map((item) => item._embedded?.show?.language)
    .forEach((lang) => {
      if (!langArray.includes(lang) && lang !== null) {
        langArray.push(lang);
      }
    });

  populateSelector(langArray, languageSelector);
};

const getAllGenres = (data, genresArray = []) => {
  data
    .map((item) => item._embedded?.show?.genres)
    .forEach((genre) => {
      for (item of genre) {
        if (!genresArray.includes(item) && item !== null) {
          genresArray.push(item);
        }
      }
    });

  populateSelector(genresArray, genreSelector);
};

function populateSelector(list, selectorEl) {
  if (selectorEl.length > 1) resetSelector(selectorEl);

  list.sort().forEach((item) => {
    let optionEl = document.createElement("option");
    optionEl.value = optionEl.innerText = item;
    selectorEl.appendChild(optionEl);
  });
}

function resetSelector(selector) {
  while (selector.length > 1) {
    selector[1].parentNode.removeChild(selector[1]);
  }
}

const getAllTitles = (list) => {
  let titlesList = list.map((title) => title._embedded?.show?.name);
  return titlesList;
};

function resetViewport() {
  listDiv.innerHTML = "";
  summaryEl.innerHTML = "";
}

function countElement(list) {
  const counter = document.getElementById("counter");
  counter.innerHTML = "<i>Found " + list.length + " elements</i>";
}

const printList = (list) => {
  resetViewport();
  countElement(list);

  const table = document.createElement("table");
  const tableHeader = [
    "Title",
    "Episode",
    "Season",
    "Airdate",
    "AirTime",
    "Genre",
    "Language",
  ];
  let trEl = document.createElement("tr");

  tableHeader.forEach((header) => {
    let thEl = document.createElement("th");
    thEl.innerText = header;
    trEl.appendChild(thEl);
  });

  table.appendChild(trEl);
  listDiv.appendChild(table);

  list.forEach((title) => {
    let {
      _embedded: {
        show: { name },
      },
      _embedded: {
        show: { language },
      },
      _embedded: {
        show: { genres },
      },
      airdate: airDate,
      airtime: airTime,
      name: episode,
      season,
    } = title;

    let dataFields = [
      name,
      episode,
      season,
      airDate,
      airTime,
      genres,
      language,
    ];

    let trEl = document.createElement("tr");

    dataFields.forEach((value) => {
      let tdEl = document.createElement("td");
      tdEl.innerText = value;
      trEl.appendChild(tdEl);
    });

    table.appendChild(trEl);
  });
  addSummaryOnClick();
};

function addSummaryOnClick() {
  allTitles = document.querySelectorAll("tr");
  allTitles.forEach((title, index) => {
    //skip first node to exclude table headers
    if (index != 0) title.addEventListener("click", (ev) => showSummary(ev));
  });
}

const filterByLanguage = () => {
  let langList = fetchedData.filter(
    (title) => title._embedded?.show?.language == languageSelector.value
  );

  if (languageSelector.value == "none") printList(fetchedData);
  else printList(langList);
};

const filterByGenre = () => {
  let genreList = fetchedData.filter((title) =>
    title._embedded?.show?.genres.some((genre) => genre == genreSelector.value)
  );

  if (genreSelector.value == "none") printList(fetchedData);
  else printList(genreList);
};

function showSummary(event) {
  summaryEl.innerHTML = "";

  let currentTitle = event.currentTarget.childNodes[0].innerText;
  let currentEpisode = event.currentTarget.childNodes[1].innerText;

  let searchedElement = fetchedData
    .filter((title) => title._embedded?.show?.name === currentTitle)
    .find((title) => title.name == currentEpisode);

  let summaryContent = searchedElement._embedded?.show?.summary;
  getImage(searchedElement);

  if (summaryContent)
    summaryEl.innerHTML += "<h3>Summary:</h3>" + summaryContent;
  else summaryEl.innerHTML += "<h3>No description for this title</h3>";
}

function getImage(title) {
  let image = title._embedded?.show?.image?.medium;
  let imgEl = document.createElement("img");
  imgEl.src = image;
  summaryEl.appendChild(imgEl);
}

downloadButton.addEventListener("click", window.onload);
languageSelector.addEventListener("change", filterByLanguage);
genreSelector.addEventListener("change", filterByGenre);
