// import $ from 'jquery'
import axios from 'axios'

let urlToTitleTool = `https://script.google.com/macros/s/AKfycbzeWUoUloxfftxbubQPya2mXFPV3aSLJzOAu7vEAOte_XlrWTFaB9TkkR1wH1TLKBBL/exec`

export default {
  isURL: function (str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
  },
  isEmail: function (email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  // https://stackoverflow.com/a/36756650
  getFilenameFromURL (url) {
    return url.split('/').pop().split('#')[0].split('?')[0];
  },
  getParameterID () {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('id')
  },
  getTitle: async function (url = 'https://blog.pulipuli.info/') {
    let originalURL = url
    if (url.indexOf('//') > -1) {
      url = url.slice(url.indexOf('//') + 2)
    }
    url = urlToTitleTool + "?url=" + url
    let result = await axios.get(url)
    if (result.data.output.startsWith('Exception: Request failed for ') || 
    result.data.output.startsWith('Exception: 對 ')) {
      return originalURL
    } 
    else {
      return result.data.output.trim()
    }
      
    // return new Promise(function (resolve, reject) {
    //   $.ajax({
    //     url,
    //     complete: function(data) {
    //       resolve(data.responseText);
    //     }
    //   });
    // })
  },
  getBase64: async function (url = 'https://lh3.googleusercontent.com/-tkBPlsBsFJg/V0M0b-gPKNI/AAAAAAACw9Y/Y-2BGg4z3H4/Image.jpg?imgmax=800', type = 'image/jpeg') {

    if (url.startsWith('https://cache.ptt.cc/c/https/i.imgur.com/')) {
      url = url.slice(url.indexOf('i.imgur.com/'))
    }
    else if (url.indexOf('//') > -1) {
      url = url.slice(url.indexOf('//') + 2)
    }

    url = urlToTitleTool + "?url=" + url + '&type=' + type
    let result = await axios.get(url)
    return result.data.output
    
  }
}