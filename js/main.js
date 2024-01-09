// OPTIONS API

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZTNjNTJkNTBkZTk0Y2Q0YWQ3OWM3MDdhYWZmZjU4YyIsInN1YiI6IjY1OWFiMTAwNGQwZThkMDA5NTQ5NjY4MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.h6Sg-DaVFTQ1dMjSHrVPqkp7LiKA7sHacOqDndP7be0'
    }
};

//
// GET HTML ELEMENTS + CONSTANTS
//

// LOADER

const loader = document.getElementById('loader');

// MENU

const nav_movies = document.getElementById('nav_movies');
const nav_tvshows = document.getElementById('nav_tvshows');
const nav_favorites = document.getElementById('nav_favorites');

// SEARCH BAR

const search_input = document.getElementById('search_input');
const search_btn = document.getElementById('search_btn');

// SECTIONS
const movies_section = document.getElementById('movies_section');
const tvshows_section = document.getElementById('tvshows_section');
const favorites_section = document.getElementById('favorites_section');
const search_section = document.getElementById('search_section');

// DISPLAY

const movies_display = document.getElementById('movies_display');
const tvshows_display = document.getElementById('tvshows_display');
const favorites_display = document.getElementById('favorites_display');
const search_display = document.getElementById('search_display');

// GENRES

const genres_movies = document.getElementById('genres_movies');
const genres_tvshows = document.getElementById('genres_tvshows');

// MODAL

const details_modal = document.getElementById('details_modal');
const modal_content = document.getElementById('modal_content');
const modal_close_btn = document.getElementById('modal_close_btn');

// MISCELLANEOUS

const add_to_favorites = '<i class="ti ti-heart-plus"> </i>Ajouter aux favoris';
const remove_to_favorites = '<i class="ti ti-heart-minus"> </i>Retirer des favoris';

let MoviesTv_params = {
    movies: [{
        page: 1,
        genre: null
    }],
    tvshows: [{
        page: 1,
        genre: null
    }],
};

// 
// LOADER
// 

function showLoader(show) {
    if(show) {
        loader.style.display = 'flex';
    } else {
        loader.style.display = 'none';
    }
}

// 
// MENU
// 

let active_tab = 'movies';
function tabChange(type) {
    active_tab = type;
    const types = ['movies', 'tvshows', 'favorites', 'search'];
    const navs = [nav_movies, nav_tvshows, nav_favorites];
    const sections = [movies_section, tvshows_section, favorites_section, search_section];

    types.forEach((t, index) => {
        if(t === type) {
            navs[index]?.classList.add('active');
            sections[index].classList.remove('hidden');
        } else {
            navs[index]?.classList.remove('active');
            sections[index].classList.add('hidden');
        }
    });
}

nav_movies.addEventListener('click', () => {
    tabChange('movies');
}),

nav_tvshows.addEventListener('click', () => {
    tabChange('tvshows');
}),

nav_favorites.addEventListener('click', () => {
    tabChange('favorites');
    loadFavorites();
})

// SEARCH

let timeout = null;
search_input.addEventListener('keyup', function (e) {

    clearTimeout(timeout);
    timeout = setTimeout(function () {
        showLoader(true);
        tabChange('search');
        var search = search_input.value;
        if(search.length > 0) {
            fetch(`https://api.themoviedb.org/3/search/multi?query=${search}&include_adult=true&language=fr-FR&page=1`, options)
            .then(response => response.json())
            .then(data => {
                const results = data.results;

                const persons = results.filter(result => result.media_type === 'person');
                const movies = results.filter(result => result.media_type === 'movie');
                const tvshows = results.filter(result => result.media_type === 'tv');

                let output = '';
                if(persons.length > 0) {
                    output += `<h2>Personnes</h2>`;
                    for(let person of persons) {
                        if(person.gender === 0) { person.gender = 'N/A'; }else if(person.gender === 1) { person.gender = 'Femme'; } else if(person.gender === 2) { person.gender = 'Homme'; } else if(person.gender === 3) { person.gender = 'Non-binaire'; }
                        let known_for_list = '';
                        for(let known_for of person.known_for) {
                            if(known_for.media_type === 'movie') {
                                known_for_list += `${known_for.title}, `;
                            } else if(known_for.media_type === 'tv') {
                                known_for_list += `${known_for.name}, `;
                            }
                        }
                        known_for_list = known_for_list.substring(0, known_for_list.length - 2);
                        output += `
                        <div class="card">
                            <img src="https://image.tmdb.org/t/p/w500${person.profile_path}" alt="">
                            <div class="card_content">
                                <div class="card_title">
                                    <h3>${person.name}</h3><p>${person.known_for_department} | ${person.gender}</p>
                                </div>
                                <p>Connu pour: ${known_for_list}</p>
                                <span></span>
                            </div>
                        </div>`
                    }
                }
                if(movies.length > 0) {
                    output += `<h2>Films</h2>`;
                    for(let movie of movies) {
                        if (movie.overview.length > 350) {
                            movie.overview = movie.overview.substring(0,350) + "...";
                        }
                        output += `
                        <div class="card" data-id="${movie.id}" data-type="movie">
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="">
                            <div class="card_content">
                                <div class="card_title">
                                    <h3>${movie.title}</h3><p>${movie.vote_average} <i class="ti ti-star"></i> | ${movie.release_date}</p>
                                </div>
                                <p>${movie.overview}</p>
                                <div class="card_actions">
                                    <a class="card_btn" id="see_details"><i class="ti ti-dots-circle-horizontal"> </i>Voir les détails</a>
                                    <a class="card_btn" id="add_favorites"><i class="ti ti-heart-plus"> </i>Ajouter au favoris</a>
                                </div>
                            </div>
                        </div>`
                    }
                }
                if(tvshows.length > 0) {
                    output += `<h2>Séries</h2>`;
                    for(let tvshow of tvshows) {
                        if (tvshow.overview.length > 350) {
                            tvshow.overview = tvshow.overview.substring(0,350) + "...";
                        }
                        output += `
                        <div class="card" data-id="${tvshow.id}" data-type="tvshow">
                            <img src="https://image.tmdb.org/t/p/w500${tvshow.poster_path}" alt="">
                            <div class="card_content">
                                <div class="card_title">
                                    <h3>${tvshow.name}</h3>
                                    <p>${tvshow.vote_average} <i class="ti ti-star"></i> | ${tvshow.first_air_date}</p>
                                </div>
                                <p>${tvshow.overview}</p>
                                <div class="card_actions">
                                    <a class="card_btn" id="see_details"><i class="ti ti-dots-circle-horizontal"> </i>Voir les détails</a>
                                    <a class="card_btn" id="add_favorites"><i class="ti ti-heart-plus"> </i>Ajouter au favoris</a>
                                </div>
                            </div>
                        </div>`
                    }
                }

                search_display.innerHTML = output;
            })
            .catch(err => console.error(err));
        }else{
            tabChange('movies');
            search_display.innerHTML = '';
        }
        showLoader(false);
    }, 1000);
})

// GET FUNCTIONS

function getAllPopular(data) {
    let movies_url = `https://api.themoviedb.org/3/discover/movie?language=fr&page=${data.movies[0].page}`;
    let tvshows_url = `https://api.themoviedb.org/3/discover/tv?language=fr&page=${data.tvshows[0].page}`;
    if(data.movies[0].genre != null) {
        movies_url += `&with_genres=${data.movies[0].genre}`;
    }
    if(data.tvshows[0].genre != null) {
        tvshows_url += `&with_genres=${data.tvshows[0].genre}`;
    }
    fetch(movies_url, options)
    .then(response => response.json())
    .then(data => {
        const movies = data.results;
        let output = '';
        let fav_btn_content = '';
        for(let movie of movies) {
            fav_btn_content = checkFavorite(movie.id, 'movie');
            if (movie.overview.length > 350) {
                movie.overview = movie.overview.substring(0,350) + "...";
            }
            let release_year = new Date(movie.release_date).getFullYear();
            output += `
                <div class="card" data-id="${movie.id}" data-type="movie">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="">
                    <div class="card_content">
                        <div class="card_title">
                            <h3>${movie.title}</h3><p>${movie.vote_average} <i class="ti ti-star"></i> | ${release_year}</p>
                        </div>
                        <p>${movie.overview}</p>
                        <div class="card_actions">
                            <a class="card_btn" id="see_details"><i class="ti ti-dots-circle-horizontal"> </i>Voir les détails</a>
                            <a class="card_btn" id="add_favorites">${fav_btn_content}</a>
                        </div>
                    </div>
                </div>`
            }
            movies_display.innerHTML = output;
        })
        .catch(err => console.error(err));
    
    fetch(tvshows_url, options)
    .then(response => response.json())
    .then(data => {
        const tvshows = data.results;
        let output = '';
        let fav_btn_content = '';
        for(let tvshow of tvshows) {
            fav_btn_content = checkFavorite(tvshow.id, 'tvshow');
            if (tvshow.overview.length > 350) {
                tvshow.overview = tvshow.overview.substring(0,350) + "...";
            }
            let release_year = new Date(tvshow.first_air_date).getFullYear();
            output += `
                <div class="card" data-id="${tvshow.id}" data-type="tvshow">
                    <img src="https://image.tmdb.org/t/p/w500${tvshow.poster_path}" alt="">
                    <div class="card_content">
                        <div class="card_title">
                            <h3>${tvshow.name}</h3>
                            <p>${tvshow.vote_average} <i class="ti ti-star"></i> | ${release_year}</p>
                        </div>
                        <p>${tvshow.overview}</p>
                        <div class="card_actions">
                            <a class="card_btn" id="see_details"><i class="ti ti-dots-circle-horizontal"> </i>Voir les détails</a>
                            <a class="card_btn" id="add_favorites">${fav_btn_content}</a>
                        </div>
                    </div>
                </div>`
            }
            document.getElementById('tvshows_display').innerHTML = output;
        })
        .catch(err => console.error(err));
}

function getGenres() {
    fetch('https://api.themoviedb.org/3/genre/movie/list?language=fr', options)
    .then(response => response.json())
    .then(data => {
        const genres = data.genres;
        let output = '';
        for(let genre of genres) {
            output += `<a data-id="${genre.id}" data-type="movie" id="movie-genre">${genre.name}</a>`;
        }
        genres_movies.innerHTML = output;
    })
    .catch(err => console.error(err));
    
    fetch('https://api.themoviedb.org/3/genre/tv/list?language=fr', options)
    .then(response => response.json())
    .then(data => {
        const genres = data.genres;
        let output = '';
        for(let genre of genres) {
            output += `<a data-id="${genre.id}" data-type="tvshow" id="tv-genre">${genre.name}</a>`;
        }
        genres_tvshows.innerHTML = output;
    })
    .catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", (event) => {
    getGenres();
    getAllPopular(MoviesTv_params);
    showLoader(false);
});

// 
// FAVORITES (LOCALSTORAGE)
// + Details Modal
// 


// Initialization of favorites
if(!localStorage.getItem('favorites')) {
    localStorage.setItem('favorites', JSON.stringify([]));
}

// Reset favorites
function resetFavorites() {
    localStorage.setItem('favorites', JSON.stringify([]));
}

// Check if favorite
// Return button content
function checkFavorite(id, type) {
    let favorites = JSON.parse(localStorage.getItem('favorites'));
    const index = favorites.findIndex(favorite => favorite.id.toString() === id.toString() && favorite.type === type);
    if(index === -1) {
        return add_to_favorites;
    } else {
        return remove_to_favorites;
    }
}

// Ajout ou suppression des favoris
function addOrRemoveFavorite(id, type, button) {
    let favorites = JSON.parse(localStorage.getItem('favorites'));
    const index = favorites.findIndex(favorite => favorite.id === id && favorite.type === type);

    // Add
    if(index === -1) {
        favorites.push({id, type});
        button.innerHTML = '<i class="ti ti-heart-minus"> </i>Retirer des favoris';
    // Remove
    } else {
        favorites.splice(index, 1);
        button.innerHTML = '<i class="ti ti-heart-plus"> </i>Ajouter aux favoris';
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

async function loadFavorites() {
    showLoader(true);
    let favorites = JSON.parse(localStorage.getItem('favorites'));
    let output = '';
    for(let favorite of favorites) {
        if(favorite.type === 'movie') {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${favorite.id}?language=fr`, options)
            const data = await response.json();
            if (data.overview.length > 350) {
                data.overview = data.overview.substring(0,350) + "...";
            }
            let release_year = new Date(data.release_date).getFullYear();
            output += `
            <div class="card" data-id="${data.id}" data-type="movie">
                <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="">
                <div class="card_content">
                    <div class="card_title">
                        <h3>${data.title}</h3><p>${data.vote_average} <i class="ti ti-star"></i> | ${release_year}</p>
                    </div>
                    <p>${data.overview}</p>
                    <div class="card_actions">
                        <a class="card_btn" id="see_details"><i class="ti ti-dots-circle-horizontal"> </i>Voir les détails</a>
                        <a class="card_btn" id="add_favorites">${remove_to_favorites}</a>
                    </div>
                </div>
            </div>`
        } else if(favorite.type === 'tvshow') {
            const response = await fetch(`https://api.themoviedb.org/3/tv/${favorite.id}?language=fr`, options)
            const data = await response.json();
            if (data.overview.length > 350) {
                data.overview = data.overview.substring(0,350) + "...";
            }
            let release_year = new Date(data.first_air_date).getFullYear();
            output += `
            <div class="card" data-id="${data.id}" data-type="tvshow">
                <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="">
                <div class="card_content">
                    <div class="card_title">
                        <h3>${data.name}</h3>
                        <p>${data.vote_average} <i class="ti ti-star"></i> | ${release_year}</p>
                    </div>
                    <p>${data.overview}</p>
                    <div class="card_actions">
                        <a class="card_btn" id="see_details"><i class="ti ti-dots-circle-horizontal"> </i>Voir les détails</a>
                        <a class="card_btn" id="add_favorites">${remove_to_favorites}</a>
                    </div>
                </div>
            </div>`
        }
    }
    favorites_display.innerHTML = output;
    showLoader(false);
}


// Details
function updateModal(data) {
    const year = new Date(data.release_date).getFullYear();
    let duration = '';
    if(data.type === 'movie') {
        duration = (Math.floor(data.duration / 60)) + 'h' + (data.duration % 60);
    } else if(data.type === 'tvshow') {
        duration = data.duration += ' saisons';
    }
    const rating = (data.rating * 10).toFixed(2) + '%';
    let genres = '';
    for(let genre of data.genres) {
        genres += `<span>${genre}</span>`;
    }
    const companies = data.production_companies.join(', ');

    modal_content.innerHTML = `
        <img src="${data.poster}" alt="">
        <i class="close ti ti-x" id="modal_close_btn"></i>
        <div class="modal-body">
            <div class="modal-title">
                <h1>${data.title}</h1>
                <span>${year} - ${duration}</span>
                <div class="pills">
                    <span class="green">Recommandé à ${rating}</span>
                    ${genres}
                </div>
            </div>
            <div class="modal-description">
                <h2>Synopsis</h2>
                <p>${data.synopsis}</p>
            </div>
            <p class="modal-footer">Par ${companies}</p>
        </div>
    `;
    details_modal.style.display = 'block';
}

function getDetails(id, type) {
    if(type === 'movie') {
        fetch(`https://api.themoviedb.org/3/movie/${id}?language=fr`, options)
        .then(response => response.json())
        .then(data => {
            const movie = {
                type: 'movie',
                title: data.title,
                poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
                release_date: data.release_date,
                duration: data.runtime,
                rating: data.vote_average,
                genres: data.genres.map(genre => genre.name),
                synopsis: data.overview,
                production_companies: data.production_companies.map(company => company.name)
            }
            updateModal(movie);
        })
        .catch(err => console.error(err));
    } else if(type === 'tvshow') {
        fetch(`https://api.themoviedb.org/3/tv/${id}?language=fr`, options)
        .then(response => response.json())
        .then(data => {
            const tvshow = {
                type: 'tvshow',
                title: data.name,
                poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
                release_date: data.first_air_date,
                duration: data.number_of_seasons,
                rating: data.vote_average,
                genres: data.genres.map(genre => genre.name),
                synopsis: data.overview,
                production_companies: data.production_companies.map(company => company.name)
            }
            updateModal(tvshow);
        })
        .catch(err => console.error(err));
    }
}

document.addEventListener('click', function(e) {
    if(e.target.id === 'see_details') {
        let details_id = e.target.closest('.card').dataset.id;
        let details_type = e.target.closest('.card').dataset.type;
        getDetails(details_id, details_type);
    } else if(e.target.id === 'add_favorites') {
        let fav_id = e.target.closest('.card').dataset.id;
        let fav_type = e.target.closest('.card').dataset.type;
        addOrRemoveFavorite(fav_id, fav_type, e.target);
        if(active_tab === 'favorites') {
            const cards = favorites_display.querySelectorAll('.card');
            for(let card of cards) {
                if(card.dataset.id === fav_id && card.dataset.type === fav_type) {
                    card.remove();
                }
            }
            getAllPopular();
        }
    } else if(e.target.id === 'movie-genre' || e.target.id === 'tv-genre') {
        if(!e.target.classList.contains('active')) {
            let genre_id = e.target.dataset.id;
            let genre_type = e.target.dataset.type;

            if(genre_type === 'movie') {
                const genres = document.querySelectorAll('#movie-genre');
                for(let genre of genres) {
                    genre.classList.remove('active');
                }
                MoviesTv_params.movies[0].genre = genre_id;
                MoviesTv_params.movies[0].page = 1;

            } else if(genre_type === 'tvshow') {
                const genres = document.querySelectorAll('#tv-genre');
                for(let genre of genres) {
                    genre.classList.remove('active');
                }
                MoviesTv_params.tvshows[0].genre = genre_id;
                MoviesTv_params.tvshows[0].page = 1;
            }
            e.target.classList.add('active');
            getAllPopular(MoviesTv_params);
        }else{
            e.target.classList.remove('active');
            if(e.target.dataset.type === 'movie') {
                MoviesTv_params.movies[0].genre = null;
            } else if(e.target.dataset.type === 'tvshow') {
                MoviesTv_params.tvshows[0].genre = null;
            }
            getAllPopular(MoviesTv_params);
        }    
    } else if(e.target.id === 'modal_close_btn') {
        details_modal.style.display = 'none';
    } else if(e.target.id === 'next_page_movie') {
        MoviesTv_params.movies[0].page++;
        getAllPopular(MoviesTv_params);
    } else if(e.target.id === 'next_page_tvshow') {
        MoviesTv_params.tvshows[0].page++;
        getAllPopular(MoviesTv_params);
    }  
});
