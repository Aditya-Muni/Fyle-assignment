const APIURL = "https://api.github.com/users/";
let username = "johnpapa";
// const profile = document.querySelector("#user-profile");
//or
const profile = document.getElementById("user-profile");
const getUser = async (username) => {
  const response = await fetch(APIURL + username);
  const data = await response.json();
  const card = `
    <div class="profile-container">
      <div class="user-info">
        <img class="user-img" src="${data.avatar_url}" />
        <div>
            <div>${data.name || "No Name available"}</div>
            <div>
            ${data.bio || "No bio available"}
            </div>
            <div>${"📍 " + data.location || "No location available"}</div>
            <a href="${
              "https://twitter.com/" + data.twitter_username
            }" class="link">
            🔗Twitter
            <a/><br>
            <a href="${data.html_url}" class="link">
            🔗Github
            </a>
        </div>
      <div>
    </div>`;

  profile.innerHTML = card;
};

getUser(username);

const formSubmit = () => {
  const searchbox = document.querySelector("#searching");
  if (searchbox.value != "") {
    getUser(searchbox.value);
    username = searchbox.value;
    getTotalRepositories().then(() => {
      loadPage(currentPage);
      updatePaginationButtons();
    });
  }
  return false;
};

const perPage = 10;
let currentPage = 1;
let totalRepositories = 0;

async function fetchRepositories(page) {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`
  );
  const repositoriesData = await response.json();
  const newRepositoriesData = repositoriesData.slice(1);
  if (currentPage === 1) {
    return newRepositoriesData;
  } else {
    return repositoriesData;
  }
}

async function getTotalRepositories() {
  const response = await fetch(APIURL + username);
  const user = await response.json();
  totalRepositories = user.public_repos;
}

const loader = document.getElementById("loader");

function displayRepositories(repositories) {
  const container = document.getElementById("repositories-container");
  loader.style.display = "none";
  container.innerHTML = "";

  repositories.forEach((repo) => {
    const repoCard = document.createElement("a");
    repoCard.classList.add("repo-card");
    repoCard.href = repo.html_url;
    repoCard.target = "_blank";
    repoCard.innerHTML = `
                <h3 class="title">${repo.name}</h3>
                <p class="card-text repo-description">
                ${
                  truncateDescription(repo.description, repoCard) ||
                  "No description available."
                }
                </p>
                <div class="language-container"
                id="repo-languages-${repo.name}"></div>
    `;

    container.appendChild(repoCard);
    getRepoLanguages(repo.name);
  });
}

function truncateDescription(description, repoCard) {
  const maxCharacters = 70;
  if (description && description.length > maxCharacters) {
    const truncatedDesc = `${description.substring(0, maxCharacters)}...`;
    return `${truncatedDesc} <span class="read-more"  onclick="expandDescription('${repoCard}', '${description}')">Read More</span>`;
  }
  return description;
}

async function getRepoLanguages(repoName) {
  const response = await fetch(
    `https://api.github.com/repos/${username}/${repoName}/languages`
  );
  const languagesData = await response.json();

  const repoLanguagesElement = document.getElementById(
    `repo-languages-${repoName}`
  );
  const NewLanguageTiles = [];
  const languageTiles = [];
  for (const key in languagesData) {
    const languageTile = document.createElement("div");
    languageTile.classList.add("language-tile");
    languageTile.innerHTML = `
          <div>${key}</div>
      `;
    languageTiles.push(languageTile);
  }
  if (languageTiles.length > 4) {
    const readMoreLanguages = document.createElement("span");
    readMoreLanguages.classList.add("read-more");
    readMoreLanguages.innerText = "Read More";
    readMoreLanguages.addEventListener("click", () =>
      expandLanguages(languageTiles, repoLanguagesElement, readMoreLanguages)
    );
    for (var i = 0; i <= 3; i++) {
      NewLanguageTiles.push(languageTiles[i]);
    }
    repoLanguagesElement.append(...NewLanguageTiles);
    repoLanguagesElement.append(readMoreLanguages);
  } else {
    repoLanguagesElement.append(...languageTiles);
  }
}

function expandLanguages(
  languageTiles,
  repoLanguagesElement,
  readMoreLanguages
) {
  repoLanguagesElement.removeChild(readMoreLanguages);
  for (var i = 4; i < languageTiles.length; i++) {
    repoLanguagesElement.append(languageTiles[i]);
  }
}

async function loadPage(page) {
  const repositories = await fetchRepositories(page);
  displayRepositories(repositories);
}

function next() {
  currentPage++;
  loadPage(currentPage);
  updatePaginationButtons();
}

function prev() {
  if (currentPage > 1) {
    currentPage--;
    loadPage(currentPage);
    updatePaginationButtons();
  }
}

function goToPage(page) {
  currentPage = page;
  loadPage(currentPage);
  updatePaginationButtons();
}

function updatePaginationButtons() {
  const paginationElement = document.getElementById("pagination");
  paginationElement.innerHTML = "";

  const totalPages = Math.ceil(totalRepositories / perPage);

  const prevButton = document.createElement("button");
  prevButton.innerText = "<- Prev";
  prevButton.addEventListener("click", prev);
  paginationElement.appendChild(prevButton);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.classList.add("page-button");
    pageButton.innerText = i;
    pageButton.addEventListener("click", () => goToPage(i));
    paginationElement.appendChild(pageButton);
  }

  const nextButton = document.createElement("button");

  nextButton.innerText = "Next ->";
  nextButton.addEventListener("click", next);
  paginationElement.appendChild(nextButton);
}

// Initial load
getTotalRepositories().then(() => {
  loadPage(currentPage);
  updatePaginationButtons();
});
