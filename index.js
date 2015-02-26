'use strict';

var reposTable = document.getElementById('repos');

var tbody = document.createElement('tbody');
reposTable.appendChild(tbody);

var tablesort;

var numOrgs = 0;

var searchInput = document.getElementById('search');
var forkCheckbox = document.getElementById('include-forks');

var update = debounce(function (e) {
    var rows = tbody.getElementsByTagName('tr'),
        value = searchInput.value;

    for (var i = 0, len = rows.length; i < len; i++) {
        rows[i].style.display =
            (!rows[i].dataset.fork || forkCheckbox.checked) &&
            (!value || rows[i].textContent.toLowerCase().indexOf(value.toLowerCase())) >= 0 ? 'table-row' : 'none';
    }
}, 150);

searchInput.oninput = update;
forkCheckbox.onclick = update;

var orgInput = document.getElementById('org'),
    orgForm = document.getElementById('org-form');

orgForm.onsubmit = loadFromInput;

function loadFromInput() {
    numOrgs = orgInput.value.split(',').length;
    orgInput.value.split(',').forEach(function(org) {
        loadOrganization(org.trim());
    });
    return false;
}

function loadOrganization(org) {
    tbody.innerHTML = '';
    document.body.className = 'loading';
    getRepos('https://api.github.com/orgs/' + org + '/repos?type=public&per_page=100');
}

function getRepos(url) {
    var xhr = new XMLHttpRequest();
    xhr.onload = onResponse;
    xhr.open('get', url, true);
    xhr.send();
    xhr.responseType = 'json';
}

function onResponse(e) {

    var xhr = e.target;
    if (xhr.response.message === 'Not Found') {
        document.body.className = '';
        return;
    }

    addRepos(xhr.response);

    var links = getLinks(xhr.getResponseHeader('Link'));
    if (links && links.next) getRepos(links.next);

    document.body.className = 'loaded';
}

function getLinks(header) {
    if (!header) return null;

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

    for (var i = 0; i < repos.length; i++) {
        var repo = repos[i];
        var repoName = numOrgs > 1 ? repo.full_name : repo.name
        addRow([
            '<a href="' + repo.html_url + '" target="_blank">' + repoName + '</a>',
            repo.language,
            repo.stargazers_count,
            repo.forks_count,
            repo.open_issues_count,
            formatDate(repo.created_at),
            formatDate(repo.pushed_at),
            repo.description
        ], repo);
    }

    if (!tablesort) tablesort = new Tablesort(reposTable, {descending: true});
    else tablesort.refresh();
}

function formatDate(str) {
    return new Date(str).toDateString().substr(4);
}

function addRow(cells, repo) {
    var tr = document.createElement('tr');
    if (repo.fork) tr.dataset.fork = true;
    for (var i = 0; i < cells.length; i++) {
        var td = document.createElement('td');
        td.innerHTML = cells[i];
        tr.appendChild(td);
    }
    tbody.appendChild(tr);
}

function debounce(fn, wait) {
    var timeout;

    return function() {
        var context = this,
            args = arguments;

        var later = function() {
            timeout = null;
            fn.apply(context, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
