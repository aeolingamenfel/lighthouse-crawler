class SitePage {

    constructor(url, fullUrl) {
        this.url = url;
        this.fullUrl = fullUrl;
        this.completed = false;
        this.score = null;
        this.loadScore = -1;
    }

    didRecieveScore(score) {
        this.completed = true;
        this.score = score;

        this.generateLoadScore();
    }

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