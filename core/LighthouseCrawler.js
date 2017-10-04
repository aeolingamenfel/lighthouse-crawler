const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const Crawler = require("node-webcrawler");

const SitePage = require("./SitePage.js");

/**
 * Class representing and controlling the site crawl.
 */
class LighthouseCrawler {

    /**
     * 
     * @param {Integer=} crawlLimit the amount of pages on the site to crawl, 
     *  defaults to 10.
     */
    constructor(crawlLimit = 10) {
        this.crawler = null;
        this.linksQueued = false;
        this.crawledPages = {};
        this.crawledCount = 0;
        this.crawlLimit = crawlLimit;
    }

    /**
     * Begins the crawl starting at the URL specified.
     * 
     * @param {String} startUrl A valid URL to start the crawl at.
     */
    crawl(startUrl) {
        this.crawler = new Crawler({
            maxConnections: 2,
            callback: (error, result, $) => {
                this.crawlLoadedPage(error, result, $);
            },
            onDrain: (pool) => {
                this.drainHasBegin(pool);
            }
        });

        this.addCrawledPage(startUrl);

        console.log("Beginning site crawl...");
    }

    /**
     * Called when a particular page is loaded by the crawler.
     * 
     * @param {Boolean} error True if there was an error attempting to crawl 
     *  the page.
     * @param {Object} result The result of the crawl, including the request and 
     *  other information.
     * @param {Object} $ a lightweight, server-side jQuery implementation for 
     *  interfacing with the webpage.
     */
    crawlLoadedPage(error, result, $) {
        this.pageWasFound(result.request);

        const links = $("a");

        this.queueLinks(links);
    }

    /**
     * Called when a page was found, loaded and confirmed.
     * 
     * @param {Request} request The request associated with the page load.
     */
    pageWasFound(request) {
        const url = request.uri.href;
        
        this.registerPage(url);
    }

    /**
     * Takes an array of URLs and will queue them for the crawler, assuming
     * that we haven't reached the limit.
     * 
     * @param {Array<String>} links A list of links to be queued for the 
     *  crawler. 
     */
    queueLinks(links) {
        if(this.crawledCount >= this.crawlLimit) {
            return;
        }

        for(let x = 0; x < links.length; x++) {
            const link = links[x];
            const url = link.attribs.href;

            this.addCrawledPage(url);
        }
    }

    /**
     * Attempts to queue a particular URL to be crawled, assuming it hasn't 
     * already been queued/added.
     * 
     * @param {String} url A page URL to be added.
     */
    addCrawledPage(url) {
        if(this.crawledCount >= this.crawlLimit) {
            return;
        }

        const newPage = this.registerPage(url);

        if(newPage) {
            this.crawler.queue(url);

            this.crawledCount += 1;
        }
    }

    /**
     * Checks if a particular URL has already be crawled.
     * 
     * @param {String} url The URL to check.
     * 
     * @returns {Boolean} true if the URL has already been crawled, or false 
     *  otherwise.
     */
    hasPage(url) {
        const truncatedUrl = this.truncateUrl(url);

        return !!this.crawledPages[truncatedUrl];
    }

    /**
     * Attempts to register a particular page via it's URL.
     * 
     * @param {String} url The URL to register and check.
     * 
     * @returns {Boolean|SitePage} Either false if the page was already 
     *  registered, or the SitePage object that was added otherwise.
     */
    registerPage(url) {
        if(this.hasPage(url)) {
            return false;
        }

        if(this.isBadUrl(url)) {
            return false;
        }

        const truncatedUrl = this.truncateUrl(url);
        const page = new SitePage(truncatedUrl, url);

        this.crawledPages[truncatedUrl] = page;

        return page;
    }

    /**
     * Checks if a URL is bad, which is any URL that can't easily be loaded, 
     * or is just generally not a URL to a page.
     * 
     * @param {String} url The URL to check whether it is bad or not.
     * 
     * @returns {Boolean} True if the URL is bad, or false otherwise.
     */
    isBadUrl(url) {
        return /^(?:(?:(?:mailto)|(?:tel))[:])|(#)/.test(url);
    }

    /**
     * Removes GET variables, anchor links, protocol, and other information 
     * from the base URL, so that it can be easily compared with other URLs.
     * 
     * @param {String} url The raw URL to truncate.
     * 
     * @returns {String} The truncated version of the URL.
     */
    truncateUrl(url) {
        const shortened = url.replace(/^http[s]?\:\/\//i, "")
            .replace(/[\/]?(?:#(?:[a-z]|[A-Z]|[0-9]|[-])*)*(?:\?.*)*$/i, "");

        return shortened;
    }

    /**
     * Called automatically when the crawler doesn't have anything remaining 
     * in its pool of URLs. This is a good place to initiate page tests.
     * 
     * @param {Object} pool 
     */
    drainHasBegin(pool) {
        console.log(`Crawl Complete. ${this.crawledCount} page(s) crawled.`);

        this.testAllPages();
    }

    /**
     * Runs a lighthouse test on all crawled pages.
     */
    async testAllPages() {
        console.log("Preparing to run tests on all crawled pages. Do not close or tamper with the Chrome window that will appear.");

        let testNumber = 1;
        let pageScoreSum = 0;

        for(const index in this.crawledPages) {
            const page = this.crawledPages[index];

            console.log(`Testing page (${testNumber}/${this.crawledCount})`);
            await this.testPage(page);

            pageScoreSum += page.loadScore;
            testNumber += 1;
        }

        const average = pageScoreSum / this.crawledCount;

        console.log(`\nAverage Score: ${average}`);

        // clean up
        fs.unlinkSync("./temp.json");
    }

    /**
     * Runs a Lighthouse test on an individual page.
     * 
     * @param {SitePage} page The page to be tested.
     */
    async testPage(page) {
        const score = await this.scorePage(page);

        page.didRecieveScore(score);

        console.log(`${page.url}: ${page.loadScore}`);
    }

    /**
     * Initiates and gathers the information from a lighthouse test on the 
     * specified page.
     * 
     * @param {SitePage} page
     */
    async scorePage(page) {
        const command = `lighthouse ${page.fullUrl} --output json --output-path ./temp.json`;

        await exec(command);
    
        const fileData = fs.readFileSync("./temp.json").toString();
        const data = JSON.parse(fileData);

        return data;
    }

}

module.exports = LighthouseCrawler;