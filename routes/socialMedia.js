var express = require('express'),
    db      = require('../db');
var app = module.exports = express.Router();
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const cheerio = require('cheerio');
const request = require('request-promise');

const stringSimilarity = require('string-similarity');

const PromiseWrapper = promise => {
    return promise
        .then(data => ({data, error: null}))
        .catch((error = new Error())=> ({error: error, data: null}));
};

app.get( '/api/getSocialMedia/:domain' , async function(req, res) {
var domain = "https://" +  req.params.domain;

const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });

    const page = await browser.newPage();
    await page.setViewport({width: 1900, height: 1080});
    await page.goto(domain);
    const body = await page.evaluate(() => document.documentElement.outerHTML);

    const socialLinks = getSocialLinks(body);
    const result = {
        facebook: null,
        facebookLink: null,
        twitter: null,
        twitterLink: null,
        instagram: null,
        instagramLink: null
    };
     // retVal.facebook = facebookFollowers; 
     //    retVal.fbLink = socialLinks.facebook[0]; 
    if(socialLinks.twitter) {
        const link = getBestMatched(socialLinks.twitter, domain);
        result.twitter = await fetchTwitterFollowers(link);
        result.twitterLink = link;
    }

    if(socialLinks.instagram) {
        const link = getBestMatched(socialLinks.instagram, domain);
        result.instagram = await fetchInstagramFollowers(link);
        result.instagramLink = link;
    }

    if(socialLinks.facebook) {
        const link = getBestMatched(socialLinks.facebook, domain);
        result.facebook = await fetchFacebookFollowers(link);
        result.facebookLink = link;
    }

   
      res.json(result);
    });  


function getSocialLinks(content) {
    return {
        twitter: getTwitterLinks(content),
        facebook: getFacebookLinks(content),
        instagram: getInstagramLinks(content)
    }
}

function getTwitterLinks(content) {
    const twitterLinks = content.match(/https?:\/\/(www\.)?twitter\.com\/[A-Za-z0-9_]+/g);

    if(twitterLinks === null) {
        return null;
    }
    return twitterLinks
        .filter(link => {
            return !link.endsWith('/share');
        })
        .map(link => {
            return link.replace('www.', '');
        })
        .filter(uniqueFilter);
}

function getInstagramLinks(content) {
    const instagramLinks = content.match(/https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_]+/g);

    if(instagramLinks === null) {
        return null;
    }
    return instagramLinks
        .filter(link => {
            return !link.endsWith('/p');
        })
        .map(link => {
            return link.replace('www.', '');
        })
        .filter(uniqueFilter);
}

function getFacebookLinks(content) {
    const facebookLinks = content.match(/https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_]+/g);

    if(facebookLinks === null) {
        return null;
    }
    return facebookLinks
        .filter(link => {
            return !link.endsWith('/translations');
        })
        .map(link => {
            return link.replace('www.', '');
        })
        .filter(uniqueFilter);
}

async function fetchTwitterFollowers(profile) {
    const {data: twitterBody, error: twitterError} = await PromiseWrapper(request(profile));
    if(twitterError !== null) {
        return console.log(twitterError);
    }
    if(!twitterBody) {
        throw new Error(`Twitter account ${profile} returns an empty page`);
    }
    const $ = cheerio.load(twitterBody);

    return +$('a[data-nav="followers"] .ProfileNav-value').attr('data-count');
}

async function fetchInstagramFollowers(profile) {
    const {data: instagramBody, error: instagramError} = await PromiseWrapper(request(profile));
    if(instagramError !== null) {
        return console.log(instagramError);
    }
    if(!instagramBody) {
        throw new Error(`Instagram account ${profile} returns an empty page`);
    }
    const sharedData = JSON.parse(instagramBody.split(`<script type="text/javascript">window._sharedData = `)[1].split(`;</script>`)[0]);

    return sharedData.entry_data.ProfilePage[0].graphql.user.edge_followed_by.count;
}

async function fetchFacebookFollowers(profile) {
    const {data: facebookBody, error: facebookError} = await PromiseWrapper(request({
        url: profile,
        headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Accept-Language': 'en-US',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
        }
    }));
    if(facebookError !== null) {
        return console.log(facebookError);
    }
    if(!facebookBody) {
        throw new Error(`Facebook account ${profile} returns an empty page`);
    }
    const matchResults = facebookBody.match(/<div>[0-9,]+\speople\slike\sthis/);
    if(matchResults === null) {
        return 'Facebook page should be in english. Please concat to developer in such case:)';
    }
    return +matchResults[0].replace(/\D/g, '');
}

function uniqueFilter(value, index, self) {
    return self.indexOf(value) === index;
}

function getBestMatched(arrayToCompare, wordToCompare) {
    let bestValue = -Infinity,
        bestResult = null;

    arrayToCompare.forEach(function (word) {
        const score = stringSimilarity.compareTwoStrings(word, wordToCompare);
        if(score > bestValue) {
            bestValue = score;
            bestResult = word;
        }
    });

    return bestResult;
}


/*
app.get( '/api/getSocialMedia/:domain' , async function(req, res) {

  var domain = "https://" +  req.params.domain; 
  console.log(domain); 
   const jar = request.jar();
    const _request = request.defaults({jar});
    // first request to fetch cookies (needed for some stupid web-sites)
    await _request(domain);
    const {data: body, error} = await PromiseWrapper(_request(domain));
    var retVal = {} ; 
    if (error !== null) {
        return console.log(error);
    }

    if (!body) {
        return console.log(`${domain} request returns an empty page`);
    }

    const socialLinks = getSocialLinks(body);

    if (!socialLinks.twitter) {
        console.log('No twitter');
    } else if (socialLinks.twitter.length > 1) {
        console.log('There more than one twitter account: ', socialLinks.twitter);
    } else {
        const twitterFollowers = await fetchTwitterFollowers(socialLinks.twitter[0]);
        console.log('Twitter: ', twitterFollowers);
        retVal.twitter = twitterFollowers; 
        retVal.twitLink = socialLinks.twitter[0];
    }

    if (!socialLinks.instagram) {
        console.log('No instagram');
    } else if (socialLinks.instagram.length > 1) {
        console.log('There more than one instagram account: ', socialLinks.instagram);
    } else {
        const instagramFollowers = await fetchInstagramFollowers(socialLinks.instagram[0]);
        console.log('Instagram: ', instagramFollowers);
        retVal.instagram = instagramFollowers; 
        retVal.instLink = socialLinks.instagram[0];
    }

    if (!socialLinks.facebook) {
        console.log('No facebook');
    } else if (socialLinks.facebook.length > 1) {
        console.log('There more than one facebook account: ', socialLinks.facebook);
    } else {
        const facebookFollowers = await fetchFacebookFollowers(socialLinks.facebook[0]);
        console.log('Facebook: ', facebookFollowers);
        retVal.facebook = facebookFollowers; 
        retVal.fbLink = socialLinks.facebook[0]; 
    }

  res.json(retVal);


	
});




function getSocialLinks(content) {
    return {
        twitter: getTwitterLinks(content),
        facebook: getFacebookLinks(content),
        instagram: getInstagramLinks(content)
    }
}

function getTwitterLinks(content) {
    const twitterLinks = content.match(/https?:\/\/(www\.)?twitter\.com\/[A-Za-z0-9_]+/g);
    
    if (twitterLinks === null) {
        return null;
    }
    return twitterLinks
        .filter(link => {
            return !link.endsWith('/share');
        })
        .map(link => {
            return link.replace('www.', '').replace('https', 'http').toLowerCase();
        })
        .filter(uniqueFilter);
}

function getInstagramLinks(content) {
    const instagramLinks = content.match(/https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_]+/g);

    if (instagramLinks === null) {
        return null;
    }
    return instagramLinks
        .filter(link => {
            return !link.endsWith('/p');
        })
        .map(link => {
            return link.replace('www.', '').replace('https', 'http').toLowerCase();
        })
        .filter(uniqueFilter);
}

function getFacebookLinks(content) {
    const facebookLinks = content.match(/https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_]+/g);

    if (facebookLinks === null) {
        return null;
    }
    return facebookLinks
        .filter(link => {
            return !link.endsWith('/translations')
                && !link.endsWith('/tr')
                && !link.endsWith('/sharer');
        })
        .map(link => {
            return link.replace('www.', '').replace('https', 'http').toLowerCase();
        })
        .filter(uniqueFilter);
}

async function fetchTwitterFollowers(profile) {
    const {data: twitterBody, error: twitterError} = await PromiseWrapper(request(profile));
    if (twitterError !== null) {
        return console.log(twitterError);
    }
    if (!twitterBody) {
        throw new Error(`Twitter account ${profile} returns an empty page`);
    }
    const $ = cheerio.load(twitterBody);

    return $('a[data-nav="followers"] .ProfileNav-value').attr('data-count');
}

async function fetchInstagramFollowers(profile) {
    const {data: instagramBody, error: instagramError} = await PromiseWrapper(request(profile));
    if (instagramError !== null) {
        return console.log(instagramError);
    }
    if (!instagramBody) {
        throw new Error(`Instagram account ${profile} returns an empty page`);
    }
    const sharedData = JSON.parse(instagramBody.split(`<script type="text/javascript">window._sharedData = `)[1].split(`;</script>`)[0]);

    return sharedData.entry_data.ProfilePage[0].graphql.user.edge_followed_by.count;
}

async function fetchFacebookFollowers(profile) {
    const {data: facebookBody, error: facebookError} = await PromiseWrapper(request({
        url: profile,
        headers: {
            'accept-language': 'en-US;q=0.8,en;q=0.7',
            'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36'
        }
    }));
    if (facebookError !== null) {
        return console.log(facebookError);
    }
    if (!facebookBody) {
        throw new Error(`Facebook account ${profile} returns an empty page`);
    }
   // console.log(facebookBody); 
    const matchResults = facebookBody.match(/<div>[0-9,]+\speople\sfollow\sthis/);
    if (matchResults === null) {
        return 'Facebook page should be in english. Please concat to developer in such case:)';
    }
    return matchResults[0].replace('<div>', '').replace(' people follow this', '').replace(/,/g, '');
}

function uniqueFilter(value, index, self) {
    return self.indexOf(value) === index;
}

*/