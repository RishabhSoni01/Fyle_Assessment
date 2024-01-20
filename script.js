const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const reposSection = document.getElementById('repos');
const loadMoreButton = document.getElementById('load-more');
const loader = document.createElement('div');
loader.classList.add('loader');

let page = 1;
let username = '';
let repos = [];

const reposPerPage = 10;
let totalPages = Math.ceil(repos.length / reposPerPage);

async function fetchUserInfo(username) {
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();
    return data;
  }
  
  let twitterLink = '';

  async function updateUserInfo(username) {
    const userInfo = await fetchUserInfo(username);
    const profilePhoto = document.getElementById('profile-photo');
    const usernameElement = document.getElementById('username');
    const bioElement = document.getElementById('bio');
    const locationElement = document.getElementById('location');
    const twitterLinkElement = document.getElementById('twitter-link');
    const githubLink = document.getElementById('github-link');
    const githubLink1 = document.getElementById('github-link1');

    profilePhoto.src = userInfo.avatar_url;
    usernameElement.textContent = userInfo.login;
    bioElement.textContent = userInfo.bio || 'No bio available';
    locationElement.textContent = userInfo.location || 'Location not specified';
    twitterLink = userInfo.twitter;
    twitterLinkElement.href = twitterLink || '#';
    githubLink.href = userInfo.html_url;

    // Display the full GitHub link
    githubLink1.href = `https://github.com/${username}`;

    const usernameLinkSpan = document.getElementById('username-link');
    usernameLinkSpan.textContent = username;

    document.getElementById('user-profile').style.display = 'flex';
}

  
loadMoreButton.style.display = 'none'; 

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  page = 1;
  username = searchInput.value;
  repos = [];
  reposSection.innerHTML = '';
  loadMoreButton.style.display = 'block';

  // Hide repos and footer initially
  document.getElementById('repos').style.display = 'none';
  document.querySelector('footer').style.display = 'none';

  // Update user information when searching for a new user
  document.getElementById('user-profile').style.display = 'none';
  await updateUserInfo(username);
  fetchRepos();

  // Show repos and footer after search
  document.getElementById('repos').style.display = 'flex';
  document.querySelector('footer').style.display = 'block';
});

function generatePageLinks(totalPages) {
  const pageList = document.getElementById('page-list');
  pageList.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement('li');
    const pageLink = document.createElement('a');
    pageLink.textContent = i;
    pageLink.href = '#';
    if (i === page) {
      pageLink.classList.add('active');
    }
    pageLink.addEventListener('click', () => handlePageLinkClick(i));
    pageItem.appendChild(pageLink);
    pageList.appendChild(pageItem);
  }
}
  
function handlePageLinkClick(pageNumber) {
  page = pageNumber;
  const start = (page - 1) * reposPerPage;
  const end = Math.min(start + reposPerPage, repos.length);
  displayReposFrom(start, end);
}

async function displayReposFrom(start, end, perPage) {
  reposSection.innerHTML = '';
  for (let i = start; i < end && i < repos.length; i++) {
    const repo = repos[i];
    const repoDiv = document.createElement('div');
    repoDiv.classList.add('repo');
    const languages = await fetchLanguages(repo.languages_url);
    const languagesButtons = languages ? languages.map(lang => `<button class="languages-btn">${lang.trim()}</button>`).slice(0, 4).join('') + (languages.length > 4 ? `<span class="other-languages">+${languages.length - 4}</span>` : '') : '';
    repoDiv.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || ''}</p>
        <div class="languages-buttons">${languagesButtons}</div>
        
    `;
    reposSection.appendChild(repoDiv);
  }
  toggleLoadMoreButton(perPage);
}

  document.getElementById('older-button').addEventListener('click', () => {
    if (page > 1) {
      page--;
      fetchRepos();
    }
  });
  
  document.getElementById('newer-button').addEventListener('click', () => {
    if (page < totalPages) {
      page++;
      fetchRepos();
    }
  });
  
  
    
  let currentReposCount = reposPerPage;
  let perPage = 10;
  async function fetchRepos() {
    loader.style.display = 'block';
    reposSection.appendChild(loader);
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`
    );
    const data = await response.json();
    repos = data;
    loader.style.display = 'none';
    totalPages = Math.ceil(repos.length / reposPerPage);
    generatePageLinks(totalPages);
    displayReposFrom(0, currentReposCount);
  
    // Disable and hide the load more button if the current number of repositories is equal to or greater than the maximum limit
    if (currentReposCount >= perPage) {
      loadMoreButton.style.display = 'none';
    } else {
      loadMoreButton.style.display = 'block';
    }
  }
  
  const perPageSelect = document.getElementById('per-page-select');

  perPageSelect.addEventListener('change', (event) => {
   perPage = event.target.value;
   fetchRepos();
  });

  loadMoreButton.addEventListener('click', () => {
    currentReposCount += perPage; // Increase the number of repositories to load by 15
    if (currentReposCount > 100) {
      currentReposCount = 100; // Limit the number of repositories to 100
    }
    page = 1; // Reset the page number to 1
    fetchRepos();
  });
  

async function fetchLanguages(url) {
    const response = await fetch(url);
    const data = await response.json();
    return Object.keys(data);
}

async function displayReposFrom(start, end, perPage) {
  reposSection.innerHTML = '';
  for (let i = start; i < end && i < repos.length; i++) {
    const repo = repos[i];
    const repoDiv = document.createElement('div');
    repoDiv.classList.add('repo');
    const languages = await fetchLanguages(repo.languages_url);

    let languagesHtml = '';
    if (languages && languages.length > 0) {
      // Display only the first 4 languages for each repository
      const maxLanguages = Math.min(4, languages.length);
      for (let j = 0; j < maxLanguages; j++) {
        languagesHtml += `<button class="languages-btn">${languages[j].trim()}</button>`;
      }

      // If there are more languages, add a label
      if (languages.length > 4) {
        const remainingLanguages = languages.length - 4;
        languagesHtml += `<span>+${remainingLanguages}</span>`;
      }
    }

    repoDiv.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || ''}</p>
        <div class="languages-buttons">${languagesHtml}</div>
    `;
    
    reposSection.appendChild(repoDiv);
  }
  toggleLoadMoreButton(perPage);
}



function toggleLoadMoreButton() {
    const isLastPage = page * reposPerPage >= repos.length;
    loadMoreButton.style.display = isLastPage ? 'none' : 'block';
  }


generatePageLinks(totalPages);