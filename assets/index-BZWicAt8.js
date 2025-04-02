(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const BASE_URL = "https://api.themoviedb.org/3";
const apiClient = {
  get: (endpoint, headers) => request("GET", endpoint, headers)
};
async function request(method, endpoint, headers) {
  const url = BASE_URL + endpoint;
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNmVlMGRmNTg4MWRkZTBlY2U4MWRjZjBmMzM1ZjBlNCIsIm5iZiI6MTY4MzUyMTgwOC42MzY5OTk4LCJzdWIiOiI2NDU4ODExMDZhYThlMDAxMWNhMGUwYWUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.BE-oX0D433AdaMTVuBT1DJcadG3VUCorfMOeY90gDR4"}`,
      accept: "application/json",
      ...headers
    }
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return { status: "success", data };
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    return { status: "fail", data: [] };
  }
}
const fetchPopularMovieList = async (currentPage) => apiClient.get(
  `/movie/popular?include_adult=false&language=ko-KR&page=${currentPage}`
);
const saveRating = (movieId, score) => {
  const existingData = JSON.parse(localStorage.getItem("ratings") || "[]") || [];
  const updatedData = existingData.filter(
    (item) => item.movieId !== movieId
  );
  updatedData.push({ movieId, score });
  localStorage.setItem("ratings", JSON.stringify(updatedData));
};
const createElement = (htmlTemplate, events) => {
  const $el = document.createElement("div");
  $el.innerHTML = htmlTemplate.trim();
  const firstChild = $el.firstChild;
  if (events) {
    Object.entries(events).forEach(([key, value]) => {
      firstChild == null ? void 0 : firstChild.addEventListener(key, value);
    });
  }
  if (firstChild instanceof Element) {
    return firstChild;
  } else {
    return document.createElement("div");
  }
};
const $ = (selector, parent = document) => parent.querySelector(selector);
const $multiSelect = (selector, parent = document) => selector.split(" ").map((s) => parent.querySelector(s));
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
const Modal = () => {
  const modal = createElement(
    /*html*/
    `
    <div class="modal-background" id="modalBackground" >
      <div class="modal">
        <button class="close-modal" id="closeModal">
          <img src="./images/modal_button_close.png" />
        </button>
      </div>
    </div>  
  `,
    {
      click: closeModal
    }
  );
  document.addEventListener("keydown", (e2) => {
    if (e2.key === "Escape") closeModal();
  });
  $("#closeModal", modal).addEventListener("click", closeModal);
  $(".modal", modal).addEventListener("click", (e2) => e2.stopPropagation());
  return modal;
};
function closeModal() {
  const url = new URL(location.href);
  const movieId = parseInt(url.searchParams.get("movieID") || "0");
  url.search = "";
  window.history.replaceState({}, "", url.toString());
  const modal = $(".modal-container");
  const score = parseInt($(".check-score", modal).innerText);
  saveRating(movieId, score);
  $(".modal-container").remove();
  $("#modalBackground").classList.remove("active");
  $("body").classList.remove("noscroll");
}
const Footer = () => {
  return createElement(
    /*html*/
    `
        <footer class="footer">
        <p>&copy; 우아한테크코스 All Rights Reserved.</p>
        <p><img src="./images/woowacourse_logo.png" width="180" /></p>
      </footer>
    `
  );
};
const e = (n, ...t) => (...r) => {
  const e2 = [...t, ...r];
  return n(...e2);
};
const fetchSearchMovieList = async (search, currentPage) => apiClient.get(
  `/search/movie?query=${search}&include_adult=false&language=ko-KR&page=${currentPage}`
);
const LoadMoreSection = () => {
  return createElement(
    /*html*/
    `
    <div class="load-more"></div>
  `
  );
};
const Rate = ({ rate, className, filled = false }) => {
  return createElement(
    /*html*/
    `
    <p class="rate">
      <img src="./images/star_${filled ? "filled" : "empty"}.png" class="star" />
      <span class=${className == null ? void 0 : className.join(" ")}>${rate.toFixed(1)}</span>
    </p>
    `
  );
};
const fetchDetailMovie = async (id) => apiClient.get(`/movie/${id}?language=ko-KR';`);
const getRatings = (movieId) => {
  var _a;
  const existingData = JSON.parse(localStorage.getItem("ratings") || "[]") || [];
  return ((_a = existingData.find(
    (item) => item.movieId === movieId
  )) == null ? void 0 : _a.score) || 0;
};
const RATE_DESCRIPTION = {
  ZERO: { score: 0, description: "평점을 등록해주세요." },
  WORST: { score: 2, description: "최악이에요" },
  NOTGOOD: { score: 4, description: "별로예요" },
  COMMON: { score: 6, description: "보통이에요" },
  GOOD: { score: 8, description: "재미있어요" },
  BEST: { score: 10, description: "명작이에요" }
};
const StarRating = () => {
  const score = getRatings(
    parseInt(new URL(location.href).searchParams.get("movieID") || "0")
  );
  const startRating = createElement(
    /*html*/
    `
    <div class="star-rating">
      <div class="stars"></div>
      <div class="description-score">
        <p class="description"></p>
        <span>(<span class="check-score">0</span>/10)</span>
      </div>
    </div>  
  `
  );
  Object.entries(RATE_DESCRIPTION).forEach(([, value]) => {
    if (value.score === score) {
      $(".description", startRating).innerText = value.description;
      $(".check-score", startRating).innerText = value.score.toString();
    }
  });
  Array.from({ length: 5 }).forEach((_, index) => {
    const star = document.createElement("img");
    if (score >= (index + 1) * 2) {
      star.setAttribute("src", "./images/star_filled.png");
    } else {
      star.setAttribute("src", "./images/star_empty.png");
    }
    star.classList.add("star");
    star.setAttribute("id", `star_${index + 1}`);
    star.addEventListener("click", () => handleClick(startRating, index));
    $(".stars", startRating).appendChild(star);
  });
  return startRating;
};
function handleClick(startRating, index) {
  const stars = $$(".star-rating .star", startRating);
  const fillStars = stars.filter(
    (star) => parseInt(star.id.split("_")[1]) <= index + 1
  );
  const emptyStars = stars.filter(
    (star) => parseInt(star.id.split("_")[1]) > index + 1
  );
  fillStars.forEach(
    (star) => star.setAttribute("src", "./images/star_filled.png")
  );
  emptyStars.forEach(
    (star) => star.setAttribute("src", "./images/star_empty.png")
  );
  Object.entries(RATE_DESCRIPTION).forEach(([, value]) => {
    if (value.score === (index + 1) * 2) {
      $(".description", startRating).innerText = value.description;
    }
  });
  $(".check-score", startRating).innerText = ((index + 1) * 2).toString();
}
const MovieDetailContent = ({
  title,
  genres,
  vote_average,
  poster_path,
  overview,
  release_date
}) => {
  const posterPath = poster_path ? `https://image.tmdb.org/t/p/w440_and_h660_face${poster_path}` : "./images/default_poster.png";
  const releaseYear = release_date.split("-")[0];
  const genre = genres == null ? void 0 : genres.map((genre2) => genre2.name);
  const content = createElement(
    /*html*/
    `
    <div class="modal-container">
      <div class="modal-image">
        <img
          src=${posterPath}
        />
      </div>
      <div class="modal-description">
        <div class="main-info">
          <h2>${title}</h2>
          <p class="category">
            ${releaseYear} · ${genre.join(", ")}
          </p>
          <div class="average_rate">평균</div>
        </div>
        <hr/>
        
        <div class="my_rate"><div class="intro">내 별점</div></div>
        <hr/> 

        <div class="intro">줄거리</div>
        <p class="detail">
          ${overview}
        </p>
      </div>
    </div>
  `
  );
  $(".average_rate", content).appendChild(
    Rate({ rate: vote_average, filled: true })
  );
  $(".my_rate", content).appendChild(StarRating());
  return content;
};
const loadDetailMovie = async (id) => {
  if ($("#modalBackground").classList.contains("active")) return;
  $("#modalBackground").classList.add("active");
  const movie = await fetchDetailMovie(id);
  const { title, genres, vote_average, poster_path, overview, release_date } = movie.data;
  const url = new URL(location.href);
  url.search = new URLSearchParams(`movieID=${id}`).toString();
  window.history.replaceState({}, "", url.toString());
  $("body").classList.add("noscroll");
  $(".modal").appendChild(
    MovieDetailContent({
      title,
      genres,
      vote_average,
      poster_path,
      overview,
      release_date
    })
  );
};
const MovieItem = ({ id, src, rate, title }) => {
  const movieItem = createElement(
    /*html*/
    `
    <li>
      <div class="item">
        <img
          class="thumbnail"
          src=${src}
          alt=${title}
        />
        <div class="item-desc">
          <strong>${title}</strong>
        </div>
      </div>
    </li>
  `,
    { click: () => loadDetailMovie(id) }
  );
  $(".item-desc", movieItem).prepend(Rate({ rate }));
  return movieItem;
};
const NoSearchResults = (text) => {
  return createElement(
    /*html*/
    `
    <div class="no-result">
      <img src="./images/no_result_logo.png" alt="검색 결과 없음"/>
      <h2>${text}</h2>
    </div>  
  `
  );
};
const MovieList = (movies) => {
  var _a;
  if ((movies == null ? void 0 : movies.results.length) === 0) {
    $(".thumbnail-list").before(NoSearchResults("검색 결과가 없습니다."));
    return;
  }
  const fragment = document.createDocumentFragment();
  movies == null ? void 0 : movies.results.forEach((movie) => {
    const posterPath = movie.poster_path;
    const movieElement = MovieItem({
      id: movie.id,
      src: posterPath ? `https://image.tmdb.org/t/p/w440_and_h660_face/${movie.poster_path}` : "./images/default_poster.png",
      title: movie.title,
      rate: movie.vote_average
    });
    fragment.appendChild(movieElement);
  });
  $(".thumbnail-list").appendChild(fragment);
  if (movies.page === movies.total_pages)
    (_a = $(".load-more")) == null ? void 0 : _a.classList.add("hidden");
  return fragment;
};
const hideSkeleton = () => {
  var _a;
  (_a = $$(".skeleton")) == null ? void 0 : _a.forEach((s) => s.remove());
};
const SkeletonMovieItem = () => {
  return createElement(
    /*html*/
    `
    <li class="skeleton">
      <div class="item">
        <div class="thumbnail skeleton-box"></div> 
        <div class="item-desc skeleton-box">
          <p class="rate">
            <div class="star skeleton-box"></div>
            <span class="skeleton-box rate-placeholder"></span>
          </p>
          <strong class="skeleton-box title-placeholder"></strong>
        </div>
      </div>
    </li>
  `
  );
};
const showSkeleton = (count = 20) => {
  const container = $(".thumbnail-list");
  const fragment = document.createDocumentFragment();
  fragment.append(...Array.from({ length: count }).map(SkeletonMovieItem));
  container.appendChild(fragment);
};
const loadMoreMovies = async ({ loadFn }) => {
  showSkeleton();
  const movies = await loadFn();
  if (movies.status === "fail") {
    $("#wrap").appendChild(NoSearchResults("영화 목록을 가져오지 못했습니다."));
  }
  if (movies.status === "success") {
    MovieList(movies.data);
  }
  hideSkeleton();
};
const observeLoadMore = ({ loadFn }) => {
  let currentPage = 2;
  const listEnd = $(".load-more");
  const option = {
    root: null,
    rootMargin: "0px 0px 0px 0px",
    thredhold: 0
  };
  const onIntersect = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadMoreMovies({ loadFn: () => loadFn(currentPage) });
        currentPage++;
      }
    });
  };
  const observer = new IntersectionObserver(onIntersect, option);
  observer.observe(listEnd);
};
const INITIAL_PAGE$1 = 1;
const searchMovie = async (input) => {
  var _a, _b;
  const thumbnailList = $(".thumbnail-list");
  thumbnailList.replaceChildren();
  (_a = $(".no-result")) == null ? void 0 : _a.remove();
  (_b = $(".load-more")) == null ? void 0 : _b.remove();
  $("#caption").innerText = `"${input}" 검색 결과`;
  showSkeleton();
  const movies = await fetchSearchMovieList(input, INITIAL_PAGE$1);
  if (movies.status === "fail") {
    thumbnailList.before(NoSearchResults("영화 목록을 가져오지 못했습니다."));
  }
  if (movies.status === "success") {
    $(".top-rated-container").classList.add("hidden");
    $(".overlay-img").classList.add("hidden");
    MovieList(movies.data);
    hideSkeleton();
    if (movies.data.page === movies.data.total_pages) return;
    thumbnailList.after(LoadMoreSection());
    const loadFn = e(fetchSearchMovieList, input);
    observeLoadMore({
      loadFn
    });
  }
};
const Button = ({ text, className, onClick }) => {
  const button = createElement(
    /*html*/
    `
    <button class=${className.join(" ")}>${text}</button>
  `,
    { click: onClick }
  );
  return button;
};
const SearchBar = ({ handleSearch }) => {
  const searchBar = document.createElement("div");
  searchBar.classList.add("search-bar");
  const input = document.createElement("input");
  input.setAttribute("placeholder", "검색어를 입력하세요");
  input.type = "text";
  searchBar.appendChild(input);
  const button = document.createElement("button");
  button.innerText = "🔎";
  button.type = "button";
  searchBar.appendChild(button);
  button.addEventListener("click", () => {
    handleSearch(input.value);
  });
  input.addEventListener("keydown", async (e2) => {
    if (e2.key === "Enter") {
      handleSearch(input.value);
    }
  });
  return searchBar;
};
const Header = ({ id, title, imageUrl, voteAverage }) => {
  const header = createElement(
    /*html*/
    `
    <header>
      <div class="background-container">
        <div class="overlay" aria-hidden="true">
        <img src=${imageUrl} class="overlay-img" />
        <div class="backdrop"></div>
      </div>
        
        <div class="logo-search-container">
          <h1 class="logo">
            <img src="./images/logo.png" alt="MovieList" />
          </h1>
        </div>
        
        <div class="top-rated-container">
          <div class="top-rated-movie">
            <div class="title">${title}</div>
        </div>
      </div>
    </header>
  `
  );
  const searchBar = SearchBar({ handleSearch: searchMovie });
  const rate = Rate({ rate: voteAverage, className: ["rate-value"] });
  const button = Button({
    text: "자세히 보기",
    className: ["primary", "detail"],
    onClick: () => loadDetailMovie(id)
  });
  const [logoSearchContainer, topRateMovie, logo] = $multiSelect(
    ".logo-search-container .top-rated-movie .logo",
    header
  );
  logoSearchContainer.appendChild(searchBar);
  topRateMovie.prepend(rate);
  topRateMovie.appendChild(button);
  logo.addEventListener("click", () => location.reload());
  return header;
};
const Caption = ({ title }) => {
  return createElement(
    /*html*/
    `
    <h2 id="caption">${title}</h2>  
  `
  );
};
const INITIAL_PAGE = 1;
addEventListener("load", async () => {
  const app = $("#app");
  if (app) {
    const { header, movieList, footer } = createLayout();
    const wrapper = $("#wrap");
    wrapper.appendChild(header);
    wrapper.appendChild(Caption({ title: "지금 인기 있는 영화" }));
    wrapper.appendChild(movieList);
    processMovies();
    app.appendChild(Modal());
    const url = new URL(location.href);
    const movieId = url.searchParams.get("movieID");
    if (movieId) {
      loadDetailMovie(parseInt(movieId));
    }
    app.appendChild(footer);
  }
});
function createLayout() {
  const header = Header({
    id: 0,
    title: "로딩중 ...",
    imageUrl: "",
    voteAverage: 0
  });
  const movieList = createElement(
    /*html*/
    `<ul class="thumbnail-list"></ul>`
  );
  const footer = Footer();
  return { header, movieList, footer };
}
async function processMovies() {
  const wrapper = $("#wrap");
  showSkeleton();
  const movies = await fetchPopularMovieList(INITIAL_PAGE);
  if (movies.status === "fail") {
    wrapper.appendChild(NoSearchResults("영화 목록을 가져오지 못했습니다."));
    return;
  }
  const topMovie = movies.data.results[0];
  const updatedHeader = Header({
    id: topMovie.id,
    title: topMovie.title,
    imageUrl: `https://image.tmdb.org/t/p/w500${topMovie.poster_path}`,
    voteAverage: topMovie.vote_average
  });
  if (updatedHeader) wrapper.replaceChild(updatedHeader, $("header"));
  MovieList(movies.data);
  wrapper.appendChild(LoadMoreSection());
  hideSkeleton();
  observeLoadMore({ loadFn: fetchPopularMovieList });
}
