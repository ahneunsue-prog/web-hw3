
/* =========================================
   웹개발기초 실습과제 #3
   살아 움직이는 영화 보드
========================================= */


/* =========================================
   1. 기존 과제 #2 함수 활용
========================================= */

// sortBy : 영화 배열, 기준, 내림차순 여부 ⇒ 정렬된 새 배열
function sortBy(list, key, desc = false) {
  const direction = desc ? -1 : 1;

  return [...list].sort((a, b) => {
    if (
      typeof a[key] === "number" &&
      typeof b[key] === "number"
    ) {
      return (a[key] - b[key]) * direction;
    }

    return String(a[key]).localeCompare(
      String(b[key]),
      "ko"
    ) * direction;
  });
}


// search : 영화 배열, 검색어 ⇒ 검색된 새 배열
function search(list, keyword) {
  const word = String(keyword).trim().toLowerCase();

  return list.filter(movie =>
    movie.title.toLowerCase().includes(word)
  );
}


// formatNumber : 숫자 ⇒ 쉼표가 들어간 문자열
function formatNumber(n) {
  return Number(n).toLocaleString("ko-KR");
}


// posterUrl : 포스터 경로와 크기 ⇒ 이미지 주소
function posterUrl(path, size = "w342") {
  if (!path) {
    return "";
  }

  return "https://image.tmdb.org/t/p/" + size + path;
}


/* =========================================
   2. 화면 요소와 찜 데이터
========================================= */

const board = document.getElementById("board");
const dialog = document.getElementById("detail");

const liked = JSON.parse(
  localStorage.getItem("liked") || "[]"
);


// saveLiked : 찜 배열 ⇒ 브라우저에 저장
function saveLiked() {
  localStorage.setItem("liked", JSON.stringify(liked));
}


/* =========================================
   3. 영화 카드 렌더링
========================================= */

// renderCards : 영화 배열 ⇒ 화면에 영화 카드 생성
function renderCards(list) {
  board.innerHTML = "";

  for (const m of list) {
    const card = document.createElement("article");

    card.className = "card";
    card.setAttribute("data-type", m.type);
    card.setAttribute("data-title", m.title);

    if (!m.poster) {
      card.classList.add("no-poster");
    }

    const poster = m.poster
      ? `<img class="poster"
              src="${posterUrl(m.poster)}"
              alt="${m.title} 포스터">`
      : `<div class="poster-fallback">${m.title[0]}</div>`;

    const rank = m.type === "boxoffice"
      ? `<span class="rank">${m.rank}위</span>`
      : "";

    const hot = m.rating >= 8 ? " hot" : "";

    const isLiked = liked.includes(m.title);

    const likeClass = isLiked
      ? "like liked"
      : "like";

    const likeText = isLiked ? "♥" : "♡";

    const audience = m.type === "boxoffice"
      ? `<p class="audience">
           누적 관객 수: ${formatNumber(m.audience)}명
         </p>`
      : "";

    card.innerHTML = `
      ${poster}
      ${rank}
      <span class="badge${hot}">⭐ ${m.rating}</span>

      <button
        type="button"
        class="${likeClass}"
        aria-label="${m.title} 찜하기"
      >${likeText}</button>

      <div class="info">
        <h3>${m.title}</h3>
        <p class="year">개봉일: ${m.date}</p>
        ${audience}
      </div>
    `;

    board.appendChild(card);
  }

  document.getElementById("count").textContent =
    `영화 ${list.length}편`;

  document.getElementById("likeCount").textContent =
    liked.length;

  if (list.length === 0) {
    board.classList.add("is-empty");
  } else {
    board.classList.remove("is-empty");
  }
}


/* =========================================
   4. 검색, 보기 필터, 정렬
========================================= */

// getView : 현재 검색·필터·정렬 조건 ⇒ 영화 배열
function getView() {
  const keyword = document.getElementById("q").value;

  const sortKey = document.getElementById("sort").value;

  const type = document.querySelector(
    'input[name="type"]:checked'
  ).value;

  // 1. 검색
  let result = search(movies, keyword);

  // 2. 보기 필터
  if (type !== "all") {
    result = result.filter(m => m.type === type);
  }

  // 3. 정렬
  result = sortBy(
    result,
    sortKey,
    sortKey !== "title"
  );

  return result;
}


// refresh : 현재 조건 ⇒ 영화 보드 다시 그리기
function refresh() {
  renderCards(getView());
}


/* =========================================
   5. 영화 상세 정보
========================================= */

// openDetail : 영화 제목 ⇒ 상세 대화상자 열기
function openDetail(title) {
  const m = movies.find(movie => movie.title === title);

  if (!m) {
    return;
  }

  const poster = m.poster
    ? `<img class="poster"
            src="${posterUrl(m.poster, "w500")}"
            alt="${m.title} 포스터">`
    : `<div class="poster-fallback">${m.title[0]}</div>`;

  document.getElementById("detailBody").innerHTML = `
    ${poster}
    <h2>${m.title}</h2>
    <p>개봉일: ${m.date}</p>
    <p>평점: ⭐ ${m.rating}</p>
    <h3>줄거리</h3>
    <p>${m.overview}</p>
  `;

  dialog.showModal();
}


/* =========================================
   6. 이벤트 등록
========================================= */

// 검색창에 글자를 입력하면 다시 그리기
document.getElementById("q").addEventListener(
  "input",
  refresh
);


// 정렬 기준을 바꾸면 다시 그리기
document.getElementById("sort").addEventListener(
  "change",
  refresh
);


// 보기 필터를 바꾸면 다시 그리기
document.getElementById("typeFilter").addEventListener(
  "change",
  refresh
);


// 이벤트 위임 : 카드 클릭과 찜 처리
board.addEventListener("click", function(e) {
  const card = e.target.closest(".card");

  if (!card) {
    return;
  }

  const title = card.getAttribute("data-title");

  // 찜 버튼을 눌렀을 때
  if (e.target.closest(".like")) {
    const i = liked.indexOf(title);

    if (i === -1) {
      liked.push(title);
    } else {
      liked.splice(i, 1);
    }

    saveLiked();
    refresh();
    return;
  }

  // 카드의 다른 부분을 누르면 상세 정보
  openDetail(title);
});


// 상세 창 닫기
document.getElementById("closeDetail").addEventListener(
  "click",
  function() {
    dialog.close();
  }
);


/* =========================================
   7. 첫 화면 출력
========================================= */

refresh();
