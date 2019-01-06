let hasShortened = false;

function onShortenButtonClick() {
    if (hasShortened) {
        $('#long-link-input').select();
        document.execCommand('copy');
        return;
    }

    let longLink = $('#long-link-input').val();

    if (longLink === '') {
        // If the user submits an empty link, it is likely an error, so don't
        // make a request or show an error message.
        return;
    }

    console.log($('#long-link-input').val());

    $.ajax({
        url: '/api/shorten',
        type: 'POST',
        data: JSON.stringify({
            longLink: $('#long-link-input').val(),
            expiryDate: getExpiryDate(),
            hideStatistics: getHideStatistics(),
            isWords: getIsWords(),
            customShortLinkID: getCustomID(),
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: (response) => {
            updateInput(response.shortLinkID);
            $('#error-message').text('');
        },
        error: (jqXHR) => {
            $('#error-message').text(jqXHR.responseJSON.error);
        }
    });
}

function onLongLinkInputChange() {
    $('#shorten-button').text('Shorten');
    $('#error-message').text('');
    hasShortened = false;
}

function onClickAdvancedOptions() {
    $('.modal').animate({
        top: '5rem',
    }, 500);
}

function onClickModalDone() {
    $('.modal').animate({
        top: '-25rem',
    }, 500);
}

function onChangeLinkType() {
    if ($('#link-type-select').val() === 'custom') {
        $('#custom-shortlink-input-container').show();
    } else {
        $('#custom-shortlink-input-container').hide();
    }
}

let updateInput = function updateInputWithShortID(shortLinkID) {
    $('#long-link-input').val(config.urlPrefix + shortLinkID);
    $('#long-link-input').select();
    $('#shorten-button').text('Copy');
    hasShortened = true;
};

let getExpiryDate = function getExpiryDateFromSelect() {
    let expiryDateString = $('#expiry-date-select').val();

    switch (expiryDateString) {
    case 'week':
        return Date.now() / 1000 + 60 * 60 * 24 * 7;
    case 'month':
        return Date.now() / 1000 + 60 * 60 * 24 * 31;
    case 'year':
        return Date.now() / 1000 + 60 * 60 * 24 * 365;
    default:
        return undefined;
    }
};

let getHideStatistics = function getHideStatisticsFromSelect() {
    let keepStatisticsString = $('#keep-statistics-select').val();

    // Hiding statistics is the opposite of keeping them, so it is true if they
    // said not to keep statistics.
    return keepStatisticsString === 'false';
};

let getIsWords = function getIsWordsDateFromSelect() {
    let linkTypeString = $('#link-type-select').val();

    return linkTypeString === 'words';
};

let getCustomID = function getCustomShortLinkIDFromInput() {
    if ($('#link-type-select').val() !== 'custom') {
        return undefined;
    }

    return $('#custom-shortlink-input').val();
};
