(function () {
    'use strict';

    const gameContainer = document.querySelector('.sb-content-box');
    const resultContainer = gameContainer.querySelector('.sb-wordlist-items');
    const statListings = {};
    let foundTerms = [];
    let foundPangrams = [];
    let remainders = [];
    let allPoints = 0;
    let observer;
    let styles;

    /**
     * Create elements conveniently
     * @param tagName
     * @param text
     * @param classNames
     * @param attributes
     * @returns {*}
     */
    const createElement = (tagName, {
        text = '',
        classNames = [],
        attributes = {}
    } = {}) => {
        const element = document.createElement(tagName);
        if (classNames.length) {
            element.classList.add(...classNames);
        }
        if (text !== '') {
            element.textContent = text;
        }
        for (const [key, value] of Object.entries(attributes)) {
            if (value) {
                element.setAttribute(key, value);
            }
        }
        return element;
    }

    /**
     * Add stylesheet
     */
    const appendStyles = () => {
        styles = createElement('style', {
            // This will be replaced by the actual CSS
            text: `.sb-content-box{position:relative}.sb-wordlist-items .sb-pangram{border-bottom:2px #f8cd05 solid}.sb-wordlist-items .sb-anagram a{color:#888}.sba{position:absolute;width:200px;right:-210px;top:16px;background:#fff;z-index:3;border:1px solid #dcdcdc;border-radius:6px;padding:0 10px 5px}.sba *{box-sizing:border-box}.sba *:focus{outline-color:transparent}.sba .dragger{font-weight:bold;cursor:move;line-height:32px}.sba.dragging{opacity:.5;border-style:dashed}.sba .closer{font-size:20px;font-weight:bold;position:absolute;top:0;right:0;line-height:32px;padding:0 10px;cursor:pointer}.sba details{font-size:90%;margin-bottom:5px}.sba details[open] summary:before{content:"－"}.sba summary{line-height:32px;padding:0 15px 0 25px;background:#f8cd05;cursor:pointer;list-style:none;position:relative}.sba summary::-webkit-details-marker{display:none}.sba summary:before{content:"＋";position:absolute;left:8px}.sba button{margin:10px auto;width:80%;display:block}.sba table{border:1px solid #dcdcdc;border-top:none;border-collapse:collapse;width:100%;font-size:85%}.sba th,.sba td{border:1px solid #dcdcdc;padding:3px}.sba thead th{text-align:center}.sba tbody th{text-align:right}.sba tbody td{text-align:center}.sba .link{color:currentColor;opacity:.6;font-size:10px;text-align:right;display:block;padding-top:3px}.sba .link:hover{opacity:.8;text-decoration:underline}`
        });
        document.querySelector('head').append(styles);
    }

    /**
     * Count how many words exist for each length
     *
     * @returns {{}}
     */
    const countLetters = () => {
        const letterCount = {};
        gameData.today.answers.forEach(term => {
            letterCount[term.length] = letterCount[term.length] || {
                found: 0,
                missing: 0,
                total: 0
            };
            if (foundTerms.includes(term)) {
                letterCount[term.length].found++;
            }
            else {
                letterCount[term.length].missing++;
            }
            letterCount[term.length].total++;
        });
        return letterCount;
    };

    /**
     * Count the points from an array of words
     * 
     * @param data
     * @returns {number}
     */
    const countPoints = data => {
        let points = 0;
        data.forEach(term => {
            if (gameData.today.pangrams.includes(term)) {
                points += term.length + 7;
            }
            else if (term.length > 4) {
                points += term.length;
            }
            else {
                points += 1;
            }
        });
        return points;
    }

    allPoints = countPoints(gameData.today.answers);    

    /**
     * Calculates points at launch and after adding a new word
     *
     * @returns {{Stats: [[string, number, number, *], [string, number, number, number]], Spoilers: (string|number|*)[][]}}
     */
    const calculateUpdates = () => {
        const letterCount = countLetters();
        const letterKeys = Object.keys(letterCount);
        letterKeys.sort((a, b) => a - b);
        const updates = {
            Stats: [
                [
                    'Words',
                    foundTerms.length,
                    remainders.length,
                    gameData.today.answers.length
                ],
                [
                    'Points',
                    countPoints(foundTerms),
                    countPoints(remainders),
                    allPoints
                ]
            ],
            Spoilers: [
                [
                    'Pangrams',
                    foundPangrams.length,
                    gameData.today.pangrams.length - foundPangrams.length,
                    gameData.today.pangrams.length
                ]
            ]
        }
        letterKeys.forEach(count => {
            updates.Spoilers.push([
                count + ' ' + (count > 1 ? 'letters' : 'letter'),
                letterCount[count].found,
                letterCount[count].missing,
                letterCount[count].total
            ]);
        });
        return updates;
    }
    
    /**
     * Update and populate statistic panels
     */
    const updateStats = () => {
        foundTerms = [];
        foundPangrams = [];

        resultContainer.querySelectorAll('li').forEach(node => {
            const term = node.textContent;
            foundTerms.push(term);
            if (gameData.today.pangrams.includes(term)) {
                foundPangrams.push(term);
                node.classList.add('sb-pangram');
            }
        });
        remainders = gameData.today.answers.filter(term => !foundTerms.includes(term));

        const updates = calculateUpdates();

        for (const [key, statListing] of Object.entries(statListings)) {
            if (updates[key].length) {
                statListing.innerHTML = '';
                updates[key].forEach(entry => {
                    statListing.append(buildTableRow('td', entry));
                })
            }
        }
    };

    /**
     * Build a single entry for the term list
     *
     * @param term
     * @returns {*}
     */
    const buildWordListItem = term => {
        const entry = createElement('li', {
            classNames: gameData.today.pangrams.includes(term) ?
                ['sb-anagram', 'sb-pangram'] :
                ['sb-anagram']
        });
        entry.append(createElement('a', {
            text: term,
            attributes: {
                href: `https://www.google.com/search?q=${term}`,
                target: '_blank'
            }
        }));
        return entry;
    };

    /**
     * Display the solution after confirmation
     */
    const resolveGame = () => {
        if (confirm('Are you sure you want to display all answers?')) {
            observer.disconnect();
            remainders.forEach(term => {
                resultContainer.append(buildWordListItem(term));
            });
        }
    };

    /**
     * Create a single table row with an update record
     *
     * @param type
     * @param data
     * @returns {*}
     */
    const buildTableRow = (type, data) => {
        const row = createElement('tr');
        data.forEach((entry, i) => {
            row.append(createElement(i === 0 ? 'th' : type, {
                text: entry
            }));
        });
        return row;
    }

    /**
     * Build app closer (the little x in the top right corner)
     *
     * @returns {*}
     */
    const buildCloser = () => {
        const closer = createElement('span', {
            classNames: ['closer'],
            text: '×',
            attributes: {
                title: 'Close assistant'
            }
        });
        closer.addEventListener('click', function () {
            window.gameData.assistant = false;
            styles.remove();
            observer.disconnect();
            this.parentNode.remove();
        });
        return closer;
    }

    /**
     * Implement drag/drop
     * @param container
     * @returns {*}
     */
    const buildDragMechanism = (container) => {

        gameContainer.addEventListener('dragstart', function (event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move"
        });

        gameContainer.addEventListener('dragover', function (event) {
            event.preventDefault();
        });

        container.draggable = true;
        const dragger = createElement('div', {
            classNames: ['dragger'],
            text: 'Assistant',
            attributes: {
                title: 'Hold the mouse down to drag assistant'
            }
        });

        container.addEventListener('dragstart', function (event) {
            event.stopPropagation();
            const style = getComputedStyle(this);
            container.classList.add('dragging');
            this.dataset.right = style.getPropertyValue('right');
            this.dataset.top = style.getPropertyValue('top');
            this.dataset.mouseX = event.clientX;
            this.dataset.mouseY = event.clientY;
        }, false);

        container.addEventListener('dragend', function (event) {
            event.stopPropagation();
            const mouseDiffX = event.clientX - this.dataset.mouseX;
            const mouseDiffY = event.clientY - this.dataset.mouseY;
            this.style.right = parseInt(this.dataset.right) - mouseDiffX + 'px';
            this.style.top = parseInt(this.dataset.top) + mouseDiffY + 'px';
            container.classList.remove('dragging');
        }, false);

        return dragger;
    }

    /**
     * Build panels
     */
    const buildPanels = () => {
        const types = ['Stats', 'Spoilers', 'Solution'];
        const container = createElement('div', {
            classNames: ['sba']
        });

        container.append(buildDragMechanism(container));
        container.append(buildCloser());

        types.forEach(type => {
            const panel = createElement('details', {
                attributes: {
                    open: type === 'Stats' ? 'open' : false
                }
            });

            const summary = createElement('summary', {
                text: type
            });

            let content;

            if (type === 'Solution') {
                content = createElement('div');
                const button = createElement('button', {
                    classNames: ['pz-modal__button', 'white'],
                    text: 'Display answers',
                    attributes: {
                        type: 'button'
                    }
                });
                button.addEventListener('pointerup', () => {
                    resolveGame();
                });
                content.append(button);
            }
            else {
                content = createElement('table');
                const thead = createElement('thead');
                thead.append(buildTableRow('th', ['', 'Found', 'Missing', 'Total']));
                statListings[type] = createElement('tbody');
                content.append(thead);
                content.append(statListings[type]);
                updateStats();
            }

            panel.append(summary);
            panel.append(content);


            container.append(panel);
        });
        const siteLinkBox = createElement('div', {
            classNames: ['link']

        })
        const siteLink = createElement('a', {
            text: 'Spelling Bee Assistant 1.3.0',
            attributes: {
                href: 'https://draber.github.io',
                target: '_blank'
            }
        });
        siteLinkBox.append(siteLink);
        container.append(siteLinkBox);
        gameContainer.append(container);
    };

    /**
     * Listen to the result container and update the panels when adding a new term
     *
     * @type {MutationObserver}
     */
    observer = new MutationObserver((mutationsList) => {
        // we're only interested in the very last mutation
        const mutation = mutationsList.pop();
        const node = mutation.addedNodes[0];
        if (gameData.today.pangrams.includes(node.textContent)) {
            node.classList.add('sb-pangram');
        }
        updateStats();
    });
    observer.observe(resultContainer, {
        childList: true
    });

    /**
     * Initialize app
     *
     * @returns {boolean}
     */
    const init = () => {
        if (window.location.pathname !== '/puzzles/spelling-bee') {
            return false;
        }
        if (window.gameData.assistant) {
            return false;
        }
        appendStyles();
        buildPanels();
        updateStats();
        window.gameData.assistant = true;
        return true;
    }
    init();
}());