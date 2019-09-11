'use strict';

//declare and define variables
const edamamApiKey = 'ec19106e480a369800e071e93c658e54';
const edamamAppId = '549c7004';
const edamamApiUrl = 'https://api.edamam.com/search';
let maxResults = 100;
let i;
let returnedRecipes;
let firstRecipeToDisplay;
let lastRecipeToDisplay;
let totalRecipes;

const youTubeApiKey = 'AIzaSyBZ7XLIPc0oHjQY3J9vd_3ipvRQO6QOZqs';
const youTubeUrl = 'https://www.googleapis.com/youtube/v3/search';
let youTubeClips;
const youTubeClipArray = [];

let waitingMessages = [
    "Whipping up some killer recipes. Sit tight!",
    "Get your apron ready. Delicious recipes are on the way!",
    "Scouring the series of tubes that is the Internet for some tremendous recipes. Standby!",
    "Buckle up for a party in your kitchen. Recipes are on the way!",
    "Please wait while a team of personal chefs prepares your recipes. Just kidding, it's only robots."
];

let chefGifs = [
    "chef0",
    "chef1",
    "chef2",
    "chef3",
    "chef4",
    "chef5",
];

//reset the variables to simulate an initial page load
function resetVariables() {
    lastRecipeToDisplay = 0;
}

//display the recipe ingredients list to a clicked recipe
function logIngredients(recipeLocator, recipeIngredients) {
    $(`#details-recipe${recipeLocator}`).empty().append(recipeIngredients);
}

//create the list of ingredients for a recipe
function getIngredients(recipeId) {
    let recipeLocator = recipeId.slice(6);
    let recipeIngredients = '<h4 class="recipe-detail-header">Ingredient List</h4><ul class="ingredient-list">';
    for (let j = 0; j < returnedRecipes.hits[recipeLocator].recipe.ingredientLines.length; j++) {
        recipeIngredients = recipeIngredients + `<li class="ingredient">${returnedRecipes.hits[recipeLocator].recipe.ingredientLines[j]}</li>`;
    }
    recipeIngredients = recipeIngredients + `</ul><a class="recipe-link" target="_blank" href="${returnedRecipes.hits[recipeLocator].recipe.url}">Link to Full Recipe</a>`;
    logIngredients(recipeLocator, recipeIngredients);
}

//display note in DOM that no youtube results were found
function noYouTubeResults(recipeId) {
    $(`#youtube-clips-${recipeId}`).empty().append('No clips available. This must be an exotic and rare recipe! Do you feel daring?');
}

//make the selected youtube clip big
function watchForYouTubeClick() {
    $('.youtube-clip').off('click');
    $('.youtube-clip').on('click', function() {    
        $('.youtube-clip').removeClass('make-it-big');
        $('iframe.youtube-embed').addClass('hidden');
        $('img.youtube-embed').removeClass('hidden');
        $('img.play-icon').removeClass('hidden');
        $(this).parent().addClass('youtube-clips-flex');
        $(this).addClass('make-it-big');
        $(this).children().children().addClass('hidden');
        $(this).children().children('iframe').removeClass('hidden');
    });
}

//display the youtube clip results
function logYouTubeResults(recipeId) {
    $(`#youtube-clips-${recipeId}`).empty().append(`
        <div class="youtube-clip">
            <div class="aspect-ratio">
                <img class="youtube-embed" src=${youTubeClips.items[0].snippet.thumbnails.default.url} alt="Thumbnail of YouTube clip #1 for ${recipeId}">
                <img class="play-icon" src="images/play-button.jpg" alt="Play button icon">
                <iframe class="youtube-embed hidden" src="https://www.youtube.com/embed/${youTubeClips.items[0].id.videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div class="youtube-embed-caption">${youTubeClips.items[0].snippet.title.slice(0,64)}...</div>
        </div>
        <div class="youtube-clip">
            <div class="aspect-ratio">
                <img class="youtube-embed" src=${youTubeClips.items[1].snippet.thumbnails.default.url} alt="Thumbnail of YouTube clip #2 for ${recipeId}">
                <img class="play-icon" src="images/play-button.jpg" alt="Play button icon">
                <iframe class="youtube-embed hidden" src="https://www.youtube.com/embed/${youTubeClips.items[1].id.videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div class="youtube-embed-caption">${youTubeClips.items[1].snippet.title.slice(0,64)}...</div>
        </div>
        <div class="youtube-clip">
            <div class="aspect-ratio">
                <img class="youtube-embed" src=${youTubeClips.items[2].snippet.thumbnails.default.url} alt="Thumbnail of YouTube clip #3 for ${recipeId}">
                <img class="play-icon" src="images/play-button.jpg" alt="Play button icon">
                <iframe class="youtube-embed hidden" src="https://www.youtube.com/embed/${youTubeClips.items[2].id.videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div class="youtube-embed-caption">${youTubeClips.items[2].snippet.title.slice(0,64)}...</div>
        </div>
        <div class="youtube-clip">
            <div class="aspect-ratio">
                <img class="youtube-embed" src=${youTubeClips.items[3].snippet.thumbnails.default.url} alt="Thumbnail of YouTube clip #4 for ${recipeId}">
                <img class="play-icon" src="images/play-button.jpg" alt="Play button icon">
                <iframe class="youtube-embed hidden" src="https://www.youtube.com/embed/${youTubeClips.items[3].id.videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div class="youtube-embed-caption">${youTubeClips.items[3].snippet.title.slice(0,64)}...</div>
        </div>
    `);
    watchForYouTubeClick();
}

//display a message to the DOM if the youtube API fetch fails
function fetchYouTubeError(error, recipeId) {
    $(`#youtube-clips-${recipeId}`).empty().append(`Something went wrong. Everybody panic!!!<br>Error Message: ${error}`);
}

//if the recipe hasn't been clicked before, get related clips from the youtube API
function getYouTubeClips(recipeTitle, recipeId) {
    if ($.inArray(recipeId, youTubeClipArray) === -1) {
        const params = {
            key: youTubeApiKey,
            q: recipeTitle,
            part: 'snippet',
            type: 'video',
            videoEmbeddable: true
        };
        const queryString = formatQueryString(params);
        const fetchUrl = youTubeUrl + '?' + queryString;
        fetch(fetchUrl)
            .then(fetchResponse => {
                if (fetchResponse.ok) {
                    return fetchResponse.json();
                }
                else {
                    throw new Error(fetchResponse.statusText);
                }
            })
            .then(jsonResponse => {
                youTubeClips = jsonResponse;
                youTubeClipArray.push(recipeId);
                if (youTubeClips.items.length < 4) {
                    noYouTubeResults(recipeId);
                }
                else {
                    logYouTubeResults(recipeId);
                }
            })
            .catch(error => {
                fetchYouTubeError(error.message, recipeId);
            });
    }
}

//watch for the user to click one of the recipes
function watchForRecipeClick() {
    $('.recipe').off('click');
    $('.recipe').on('click', function() {
        $('.youtube-clips').removeClass('youtube-clips-flex');
        $(`.recipe`).removeClass('clicked-recipe');
        $(`#${$(this).attr('id')}`).addClass('clicked-recipe');
        $(`.more-recipe-info`).addClass('hidden');
        $(`#more-recipe-info-${$(this).attr('id')}`).removeClass('hidden');
        const recipeTitle = $(this).children('.recipe-title').text();
        const recipeId = $(this).attr('id');
        getYouTubeClips(recipeTitle, recipeId);
        getIngredients(recipeId);
        window.scrollTo(0, $(this).offset().top - $('.app-title').outerHeight());
    });
}

//display message to DOM if there aren't any more recipes to display
function noResultsToLog() {
    $('.no-more-recipes').removeClass('hidden');
    $('.load-more-recipes').addClass('hidden');
}

//display the first set of recipes
function firstResultsLog() {
    $('.results').empty().removeClass('hidden');
    $('.results').append(`<h2 class="results-title">Recipe Results</h2><h3 class="results-subtitle">${$('#requested-ingredients').val()}</h3>`);
    if (totalRecipes == 0) {
        $('.results').append(`<div class="no-results">
            No recipes were found! You've got such crazy things in your refrigerator that you broke the 
            Internet. Try again with some different ingredients, weirdo!</div>`);
    }
    else {
        for (i = firstRecipeToDisplay; i < lastRecipeToDisplay; i++) {
            $('.results').append(`<div class="big-result">
                                    <div class="recipe" id="recipe${i}">
                                        <img class="recipe-image" src=${returnedRecipes.hits[i].recipe.image} alt="image of ${returnedRecipes.hits[i].recipe.label}">
                                        <h3 class="recipe-title">${returnedRecipes.hits[i].recipe.label}</h3>
                                    </div>
                                    <div class="more-recipe-info hidden" id="more-recipe-info-recipe${i}">
                                        <div class="recipe-details" id="details-recipe${i}"></div>
                                        <div class="youtube" id="youtube-recipe${i}">
                                            <h4 class="youtube-header">Related YouTube Clips</h4>
                                            <div class="youtube-clips" id="youtube-clips-recipe${i}"></div>
                                        </div>
                                    </div>
                                </div>`);
        }
        $('.load-more-recipes').removeClass('hidden');
        watchForRecipeClick();
    }
}

//display subsequent sets of recipes
function additionalResultsLog() {
    for (i = firstRecipeToDisplay; i < lastRecipeToDisplay; i++) {
        $('.results').append(`<div class="big-result">
                                <div class="recipe" id="recipe${i}">
                                    <img class="recipe-image" src=${returnedRecipes.hits[i].recipe.image} alt="image of ${returnedRecipes.hits[i].recipe.label}">
                                    <h3 class="recipe-title">${returnedRecipes.hits[i].recipe.label}</h3>
                                </div>
                                <div class="more-recipe-info hidden" id="more-recipe-info-recipe${i}">
                                    <div class="recipe-details" id="details-recipe${i}"></div>
                                    <div class="youtube" id="youtube-recipe${i}">
                                        <h4 class="youtube-header">Related YouTube Clips</h4>
                                        <div class="youtube-clips" id="youtube-clips-recipe${i}"></div>
                                    </div>
                                </div>
                            </div>`);
    }
    watchForRecipeClick();
}

//display the recipe results
function logResults() {
    firstRecipeToDisplay = lastRecipeToDisplay;
    lastRecipeToDisplay = lastRecipeToDisplay + 10;
    if (totalRecipes < lastRecipeToDisplay) {
        lastRecipeToDisplay = totalRecipes;
    }
    if (maxResults < lastRecipeToDisplay) {
        lastRecipeToDisplay = maxResults;
    }
    if (firstRecipeToDisplay == 0) {
        firstResultsLog();
    }
    else if (firstRecipeToDisplay == lastRecipeToDisplay) {
        noResultsToLog();
    }
    else {
        additionalResultsLog();
    }
}

//display message to DOM if the recipe fetch fails
function fetchRecipeError(error) {
    $('.results').empty().removeClass('hidden').append(`Something went wrong. Everybody panic!!!<br>Error Message: ${error}`);
}

//format the API call parameters
function formatQueryString (params) {
    const queryItems = Object.keys(params).map(queryItem => `${encodeURIComponent(queryItem)}=${encodeURIComponent(params[queryItem])}`);
    return queryItems.join('&');
}

//get recipes from the API
function getRecipes() {
    $('.load-more-recipes').addClass('hidden');
    $('.no-more-recipes').addClass('hidden');
    $('.results').empty().removeClass('hidden').append(`<h3 class="waiting-on-api">${waitingMessages[Math.floor(Math.random() * waitingMessages.length)]}</h3>
        <img class="chef-gif" src="images/${chefGifs[Math.floor(Math.random() * chefGifs.length)]}.gif" alt="Swedish Chef gif">`);
    setTimeout(function(){
        const requestedIngredients = $('#requested-ingredients').val();
        const params = {
            q: requestedIngredients,
            app_id: edamamAppId,
            app_key: edamamApiKey,
            from: 0,
            to: maxResults};
        const queryString = formatQueryString(params);
        const fetchUrl = edamamApiUrl + '?' + queryString;
        fetch(fetchUrl)
            .then(fetchResponse => {
                if (fetchResponse.ok) {
                    return fetchResponse.json();
                }
                else {
                    throw new Error(fetchResponse.statusText);
                }
            })
            .then(jsonResponse => {
                returnedRecipes = jsonResponse;
                totalRecipes = returnedRecipes.hits.length;
                logResults();
            })
            .catch(error => {
                fetchRecipeError(error.message);
            });
    },2000);
}

//watch for user to click the button to load more recipes
function watchForLoadMoreRecipesClick() {
    $('.load-more-recipes').on('click', function() {
        logResults();
    });
}

//adjust the body padding based on the height of the header and footer
function bodyPadding() {
    let headerHeight = $('header').height();
    let footerHeight = $('footer').height();
    $('body').css({"padding-top": headerHeight + 20 + "px","padding-bottom": footerHeight, "min-height": $(window).height()});
}

//check the body padding if the window is resized
function windowResize() {
    window.addEventListener("resize", bodyPadding);
}

//watch for user to click the submit button
function watchForSubmit() {
    $('form').submit(function(event) {
        event.preventDefault();
        resetVariables();
        getRecipes();
    });
    watchForLoadMoreRecipesClick();
    bodyPadding();
    windowResize();
}

//ready
$(watchForSubmit)