// OPTIONS API

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZTNjNTJkNTBkZTk0Y2Q0YWQ3OWM3MDdhYWZmZjU4YyIsInN1YiI6IjY1OWFiMTAwNGQwZThkMDA5NTQ5NjY4MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.h6Sg-DaVFTQ1dMjSHrVPqkp7LiKA7sHacOqDndP7be0'
    }
};

//
// GET HTML ELEMENTS
//

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

// ??
const movies = document.getElementById('movies');
const tvshows = document.getElementById('tvshows');
const genres = document.getElementById('genres');

// 
// MENU
// 

function tabChange(type) {
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
})

// SEARCH

let timeout = null;
search_input.addEventListener('keyup', function (e) {

    clearTimeout(timeout);
    timeout = setTimeout(function () {
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
    }, 1000);
})

// GET FUNCTIONS

function getAllPopular(genre = null, type = null) {
    if(genre != null) {
        if(type === 'movies') {
            console.log('genre movies');
        } else if(type === 'tvshows') {
            console.log('genre tvshows');
        }
    }else{
        fetch('https://api.themoviedb.org/3/movie/popular?language=fr', options)
        .then(response => response.json())
        .then(data => {
            const movies = data.results;
            let output = '';
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
            movies_display.innerHTML = output;
        })
        .catch(err => console.error(err));
    
        fetch('https://api.themoviedb.org/3/tv/popular?language=fr', options)
        .then(response => response.json())
        .then(data => {
            const tvshows = data.results;
            console.log(tvshows);
            let output = '';
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
            document.getElementById('tvshows_display').innerHTML = output;
        })
        .catch(err => console.error(err));
    }
}

getAllPopular();

function getGenres(type) {
    if(type === 'movies') {
        fetch('https://api.themoviedb.org/3/genre/movie/list?language=fr', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
    }
}

// 
// FAVORITES (LOCALSTORAGE)
// 

// Initialization of favorites
if(!localStorage.getItem('favorites')) {
    localStorage.setItem('favorites', JSON.stringify([]));
}

// Reset favorites
function resetFavorites() {
    localStorage.setItem('favorites', JSON.stringify([]));
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

document.addEventListener('click', function(e) {
    if(e.target.id === 'see_details') {
        console.log(e.target.closest('.card').dataset.id);
        console.log(e.target.closest('.card').dataset.type);
    } else if(e.target.id === 'add_favorites') {
        let fav_id = e.target.closest('.card').dataset.id;
        let fav_type = e.target.closest('.card').dataset.type;
        addOrRemoveFavorite(fav_id, fav_type, e.target);
    }
});

// localStorage.removeItem('favorites');
