
var repos = [];

function getRepos(url) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onload = onResponse;
    xhr.open('get', url, true);
    xhr.send();
}

function onResponse(e) {
    var xhr = e.target;
    repos = repos.concat(xhr.response);

    var links = getLinks(xhr.getResponseHeader('Link'));

    if (links.next) getRepos(links.next);
    else done();
}

function getLinks(header) {
    var parts = header.split(','),
        links = {};

    for (var i = 0; i < parts.length; i++) {
        var section = parts[i].split(';'),
            url = section[0].match(/<(.*)>/)[1];
            name = section[1].match(/rel="(.*)"/)[1];
        links[name] = url;
    }
    return links;
}

getRepos('https://api.github.com/orgs/Mapbox/repos?type=public&per_page=100');

function done() {
    document.body.className = 'loaded';

    var reposTable = document.getElementById('repos');

    repos = repos.filter(notFork);

    var tbody = document.createElement('tbody');

    for (var i = 0; i < repos.length; i++) {
        var tr = document.createElement('tr');
        addCell(tr, repos[i].name);
        addCell(tr, repos[i].language);
        addCell(tr, repos[i].stargazers_count);
        addCell(tr, repos[i].forks_count);
        addCell(tr, repos[i].open_issues_count);
        addCell(tr, formatDate(repos[i].created_at));
        addCell(tr, formatDate(repos[i].pushed_at));
        addCell(tr, repos[i].description);
        tbody.appendChild(tr);
    }
    reposTable.appendChild(tbody);

    var tablesort = new Tablesort(reposTable, {descending: true});
}

function formatDate(str) {
    return new Date(str).toDateString().substr(4);
}

function addCell(tr, html) {
    var td = document.createElement('td');
    td.innerHTML = html;
    tr.appendChild(td);
}

function notFork(repo) {
    return !repo.fork;
}
