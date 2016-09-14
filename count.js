#!/usr/bin/env node

'use strict';

var request = require('request');
var vre = /(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)/;

var last_page = 11; // atom
//var last_page = 8; // electron
var page_count = 0;
var url = 'https://api.github.com/repos/atom/atom/releases?page='
var options = {
  url: '',
  headers: {
    'User-Agent': 'request',
    'Authorization': 'token xyz'
  }
}

let total_count = 0;

for (let page = 1; page <= last_page; page++) {
  options.url = url + page;
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let releases = JSON.parse(response.body);
      for (let release of releases) {

        if (release.name.indexOf('beta') < 0) {
          let version = vre.exec(release.tag_name);
          if (version) {
            if (version[1] < 1 || (version[1] == 1 && version[2] <= 8 )) {

              let release_count = 0;
              for (let asset of release.assets) {
                if (
                  (asset.name.startsWith('atom') || asset.name.startsWith('Atom'))
                  && asset.name.indexOf('symbol') < 0
                  && asset.name.indexOf('json') < 0
                  && asset.name.indexOf('delta') < 0
                  && asset.name.indexOf('docs') < 0
                  && asset.name.indexOf('nupkg') < 0
                ) {
                  //console.log(asset.name + ": " + asset.download_count.toLocaleString());
                  release_count += asset.download_count;
                  total_count += asset.download_count;
                }
              //   if ( (asset.name.startsWith('electron-')
              // /* || asset.name.startsWith('atom-shell-') */ )
              //     && asset.name.indexOf('symbol') < 0
              //     && asset.name.indexOf('dsym') < 0 )
              //   {
              //         console.log(asset.name + ": " + asset.download_count.toLocaleString());
              //         release_count += asset.download_count;
              //         total_count += asset.download_count;
              //   }
              }
              console.log(release.name + ': ' + release_count.toLocaleString());
            }
          }
        }

      }
      if (++page_count == last_page)
        console.log('total: ' + total_count.toLocaleString());
    }
    else {
      console.log(response);
    }
  })
}
