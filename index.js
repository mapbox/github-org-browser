'use strict';

var reposTable = document.getElementById('repos');

var tbody = document.createElement('tbody');
reposTable.appendChild(tbody);

var tablesort;

getRepos('https://api.github.com/orgs/Mapbox/repos?type=public&per_page=100');

function getRepos(url) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onload = onResponse;
    xhr.open('get', url, true);
    xhr.send();
}

function onResponse(e) {
    var xhr = e.target;

    addRepos(xhr.response);

    var links = getLinks(xhr.getResponseHeader('Link'));
    if (links.next) getRepos(links.next);

    document.body.className = 'loaded';
}

function getLinks(header) {
    var parts = header.split(','),
        links = {};

    for (var i = 0; i < parts.length; i++) {
        var section = parts[i].split(';'),
            url = section[0].match(/<(.*)>/)[1],
            name = section[1].match(/rel="(.*)"/)[1];
        links[name] = url;
    }
    return links;
}

function addRepos(repos) {

    repos = repos.filter(notFork);

    for (var i = 0; i < repos.length; i++) {
        var repo = repos[i];
        addRow([
            '<a href="' + repo.html_url + '" target="_blank">' + repo.name + '</a>',
            repo.language,
            repo.stargazers_count,
            repo.forks_count,
            repo.open_issues_count,
            formatDate(repo.created_at),
            formatDate(repo.pushed_at),
            repo.description
        ]);
    }

    if (!tablesort) tablesort = new Tablesort(reposTable, {descending: true});
    else tablesort.refresh();
}

function formatDate(str) {
    return new Date(str).toDateString().substr(4);
}

function addRow(cells) {
    var tr = document.createElement('tr');
    for (var i = 0; i < cells.length; i++) {
        var td = document.createElement('td');
        td.innerHTML = cells[i];
        tr.appendChild(td);
    }
    tbody.appendChild(tr);
}

function notFork(repo) {
    return !repo.fork;
}
