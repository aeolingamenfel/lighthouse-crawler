/**
 * Wrapper class representing a page to be tested.
 */
class SitePage {

    /**
     * 
     * @param {String} url The truncated URL representing this page. 
     * @param {String} fullUrl The raw, un-truncated URL representing this page.
     */
    constructor(url, fullUrl) {
        this.url = url;
        this.fullUrl = fullUrl;
        this.completed = false;
        this.score = null;
        this.loadScore = -1;
    }

    /**
     * Called by the overlying LighthouseCrawler when it finishes the test on 
     * this page, with the score information data.
     * 
     * @param {Object} score
     */
    didRecieveScore(score) {
        this.completed = true;
        this.score = score;

        this.generateLoadScore();
    }

    /**
     * Finds and stores the relevant score for this page from the raw score data
     * from Lighthouse.
     */
    generateLoadScore() {
        for(let x = 0; x < this.score.reportCategories.length; x++) {
            const category = this.score.reportCategories[x];

            switch(category.id) {
                case SitePage.LOAD_SCORE_CATEGORY_NAME:
                    this.loadScore = category.score;
                    break;
                default:
                    // do nothing...for now?
                    break;
            }
        }
    }

    static get LOAD_SCORE_CATEGORY_NAME() {
        return "performance";
    }

}

module.exports = SitePage;