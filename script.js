 const audio = document.getElementById("audio");

const artistList = document.getElementById("artistList");

const artistName = document.getElementById("artistName");

const albumTitle = document.getElementById("albumTitle");

const songCount = document.getElementById("songCount");

const songList = document.getElementById("songList");

const albumCover = document.getElementById("albumCover");

const menuBtn = document.getElementById("menuBtn");

const sidebar = document.getElementById("sidebar");

const progress = document.getElementById("progress");

const prevAlbumBtn = document.getElementById("prevAlbum");

const nextAlbumBtn = document.getElementById("nextAlbum");

const playBtn = document.getElementById("playBtn");

const prevBtn = document.getElementById("prevBtn");

const nextBtn = document.getElementById("nextBtn");

const shuffleBtn = document.getElementById("shuffleBtn");

const repeatBtn = document.getElementById("repeatBtn");



let library;

let currentArtist = "";

let currentAlbum = 0;

let currentSong = 0;

let repeatMode = false;



menuBtn.addEventListener("click", () => {

    sidebar.classList.toggle("open");

});



function selectArtist(name) {
    currentArtist = name;
    currentAlbum = 0;
    localStorage.setItem("artist", name);
    
    // Проверка: есть ли такой артист вообще?
    if (!library.artists[name]) {
        console.error("Артист не найден в библиотеке:", name);
        return;
    }

    document.querySelectorAll(".artist").forEach(el => {
        el.classList.remove("active");
        if (el.textContent === name) {
            el.classList.add("active");
        }
    });
    renderAlbum();
}

function renderAlbum() {
    // Безопасная проверка: существует ли артист и есть ли у него альбомы?
    if (!library.artists[currentArtist] || !library.artists[currentArtist][currentAlbum]) {
        console.warn("Альбом не найден, пропускаем отрисовку");
        return;
    }

    const album = library.artists[currentArtist][currentAlbum];
    artistName.textContent = currentArtist;
    albumTitle.textContent = album.album;
    albumCover.src = album.cover || ""; // если обложки нет, не упадет
    songCount.textContent = (album.songs ? album.songs.length : 0) + " songs";
    renderSongs();
}


function createArtistMenu() {

    artistList.innerHTML = "";

    Object.keys(library.artists).forEach(name => {

        const div = document.createElement("div");

        div.className = "artist";

        div.textContent = name;

        div.onclick = () => selectArtist(name);

        artistList.appendChild(div);

    });

}



async function loadLibrary() {
    try {
        const response = await fetch("library.json");
        const data = await response.json();

        const artists = {};

        data.albums.forEach(album => {
            if (!artists[album.artist]) {
                artists[album.artist] = [];
            }

            artists[album.artist].push(album);
        });

        library = {
            artists: artists
        };

        const artistNames = Object.keys(library.artists);

        createArtistMenu();
        selectArtist(artistNames[0]);

    } catch (error) {
        console.error("Ошибка при загрузке библиотеки:", error);
    }
}


function renderAlbum() {

    const album = library.artists[currentArtist][currentAlbum];

    if (!album) return;

    artistName.textContent = currentArtist;

    albumTitle.textContent = album.album;

    albumCover.src = album.cover;

    songCount.textContent = album.songs.length + " songs";

    renderSongs();

}



function renderSongs() {

    const album = library.artists[currentArtist][currentAlbum];

    songList.innerHTML = "";

    album.songs.forEach((song, index) => {

        const div = document.createElement("div");

        div.className = "song";

        if (index === currentSong) {

            div.classList.add("active");

        }

        div.innerHTML = `

        <span>${song.title}</span>

        <span>♡</span>

        `;

        div.onclick = () => {

            currentSong = index;

            loadSong();

            audio.play();

        };

        songList.appendChild(div);

    });

}



function loadSong() {

    const album = library.artists[currentArtist][currentAlbum];

    audio.src = album.songs[currentSong].file;

    renderSongs();

}



function togglePlay() {

    if (!audio.src) {

        loadSong();

        audio.play();

        return;

    }

    if (audio.paused) {

        audio.play();

        playBtn.textContent = "❚❚";

    } else {

        audio.pause();

        playBtn.textContent = "▶";

    }

}



playBtn.addEventListener("click", togglePlay);



prevBtn.addEventListener("click", () => {

    currentSong--;

    const album = library.artists[currentArtist][currentAlbum];

    if (currentSong < 0) {

        currentSong = album.songs.length - 1;

    }

    loadSong();

    audio.play();

});



nextBtn.addEventListener("click", () => {

    nextSong();

});



function nextSong() {

    const album = library.artists[currentArtist][currentAlbum];

    currentSong++;

    if (currentSong >= album.songs.length) {

        currentSong = 0;

    }

    loadSong();

    audio.play();

}



shuffleBtn.addEventListener("click", () => {

    const album = library.artists[currentArtist][currentAlbum];

    currentSong = Math.floor(Math.random() * album.songs.length);

    loadSong();

    audio.play();

});



repeatBtn.addEventListener("click", () => {

    repeatMode = !repeatMode;

    repeatBtn.style.opacity = repeatMode ? "1" : ".5";

});



audio.addEventListener("ended", () => {

    if (repeatMode) {

        audio.currentTime = 0;

        audio.play();

        return;

    }

    nextSong();

});



audio.addEventListener("timeupdate", () => {

    progress.max = audio.duration || 0;

    progress.value = audio.currentTime;

});



progress.addEventListener("input", () => {

    audio.currentTime = progress.value;

});



prevAlbumBtn.addEventListener("click", () => {

    const albums = library.artists[currentArtist];

    currentAlbum--;

    if (currentAlbum < 0) {

        currentAlbum = albums.length - 1;

    }

    currentSong = 0;

    renderAlbum();

});



nextAlbumBtn.addEventListener("click", () => {

    const albums = library.artists[currentArtist];

    currentAlbum++;

    if (currentAlbum >= albums.length) {

        currentAlbum = 0;

    }

    currentSong = 0;

    renderAlbum();

});



loadLibrary(); 