var Shuffler = function () {
    'use strict';

    var cards = [],
        pastScores = [],
        currentHigh = null,
        currentLow = null,
        num = 0,
        suits = ['hearts'/*, 'clubs',  'diamonds', 'spades'*/],
        numbers = 1,
        score;

    return {
        getCards: function () {
            return cards;
        },

        getCard: function (index) {
            return cards[index];
        },

        getNumCards: function () {
            return cards.length;
        },

        addCard: function (card) {
            cards.push(card);
            return this;
        },

        setCard: function (card, index) {
            cards[index] = card;
            return this;
        },

        setCards: function (newCards) {
            cards = newCards;
            return this;
        },

        getScore: function () {
            return score;
        },

        incrementScore: function (amount) {
            score += amount;
            return this;
        },

        resetScore: function () {
            score = null;
            return this;
        },

        setCurrentHigh: function (score) {
            currentHigh = score;
            return this;
        },

        setCurrentLow: function (score) {
            currentLow = score;
            return this;
        },

        getCurrentHigh: function () {
            return currentHigh;
        },

        getCurrentLow: function () {
            return currentLow;
        },

        resetHighLow: function () {
            currentHigh = null;
            currentLow = null;
            return this;
        },

        getPastScores: function () {
            return pastScores;
        },

        clearPastScores: function () {
            pastScores = [];
            return this;
        },

        addNewPastScore: function (value) {
            pastScores.unshift(value);
            return this;
        },

        removeOldPastScore: function () {
            pastScores.pop();
            return this;
        },

        getNumShuffles: function () {
            return num;
        },

        incrementNumShuffles: function () {
            num += 1;
            return this;
        },

        getSuits: function () {
            return suits;
        },

        getNumNumbers: function () {
            return numbers;
        },

        setNumNumbers: function (num) {
            numbers = num;
            return this;
        },

        populateDeck: function () {
            var c = 0,
                numSuits = this.getSuits().length,
                numNumbers = this.getNumNumbers(),
                s,
                n;

            for (s = 0; s < numSuits; s += 1) {
                for (n = 0; n < numNumbers; n += 1) {
                    this.addCard({
                        index: c,
                        suit: this.getSuits()[s],
                        number: n
                    });

                    c += 1;
                }
            }

            return this;
        },

        // This is the Fisher-Yates Shuffle, which I found here:
        // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        // A purely random shuffle
        shuffle: function (callback) {
            var currentIndex = this.getNumCards(),
                origCards = this.getCards(),
                temporaryValue,
                randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = origCards[currentIndex];

                this.setCard(origCards[randomIndex], currentIndex);
                this.setCard(temporaryValue, randomIndex);
            }

            callback();
        },

        // A 'perfect' physical shuffle ('riffle')
        physicalShuffle: function (callback) {
            var leftHand = this.getCards().slice(0, (this.getNumCards() / 2)),
                rightHand = this.getCards().slice((this.getNumCards() / 2)),
                shuffledDeck = [],
                side = 'left';

            while (leftHand.length > 0 && rightHand.length > 0) {
                if (side === 'left') {
                    shuffledDeck.unshift(leftHand.pop());
                    side = 'right';
                }

                if (side === 'right') {
                    shuffledDeck.unshift(rightHand.pop());
                    side = 'left';
                }
            }

            this.setCards(shuffledDeck);

            callback();
        },

        scoreOrder: function (callback) {
            var numCards = this.getNumCards(),
                offset,
                i;

            this.incrementNumShuffles();
            this.resetScore();

            for (i = 0; i < numCards; i += 1) {
                offset = i - this.getCard(i).index;
                this.incrementScore(Math.abs(offset));
            }

            this.setHighLow();
            this.updatePastScores(this.getScore());

            callback();
        },

        setHighLow: function () {
            var currentScore = this.getScore(),
                currentHigh = this.getCurrentHigh(),
                currentLow = this.getCurrentLow();

            if (currentScore > currentHigh || !currentHigh) {
                console.log('A new high: ' + currentScore);
                this.setCurrentHigh(currentScore);
                this.printCards();
            }

            if (currentScore < currentLow || !currentLow) {
                console.log('A new low: ' + currentScore);
                this.setCurrentLow(currentScore);
                this.flashLights(1);
                this.printCards();
            }

            return this;
        },

        updatePastScores: function (score) {
            this.addNewPastScore(score);

            if (this.getPastScores().length > 100) {
                this.removeOldPastScore();
            }

            return this;
        },

        updateScoreStats: function () {
            var $highest = $('#highest-score'),
                $lowest = $('#lowest-score'),
                $average = $('#average-score'),
                $numShuffles = $('#num-shuffles'),
                $numCards = $('#num-cards'),
                currentScore = this.getScore(),
                currentHigh = this.getCurrentHigh(),
                currentLow = this.getCurrentLow(),
                numCards = this.getNumCards(),
                numShuffles = this.getNumShuffles(),
                avg = this.calculateAverage();

            if (currentHigh || !$highest.html()) {
                $highest.html(currentHigh);
            }

            if (currentLow || !$lowest.html()) {
                $lowest.html(currentLow);
            }

            $numCards.html(numCards);

            $numShuffles.html(numShuffles);

            $average.html(avg);

            return this;
        },

        printCard: function (card) {
            return '<span class="card-num num-' + card.number + '   " style="background-color: rgba(0, 100, ' + Math.floor((255 / this.getNumNumbers()) * card.number) + ', 0.5)">' +
                        card.number +
                    '</span> of ' +
                    '<span class="card-suit ' + card.suit + '">' + card.suit + '</span> ' +
                    '(index ' + card.index + ')';
        },

        printCards: function () {
            var $div = $('#num-cards-' + this.getNumCards() + ' .content'),
                now = new Date(),
                numCards = this.getNumCards(),
                i;

            $div.empty();

            $div.append('<h3>Latest: ' + now.toLocaleString() + '</h3>');
            $div.append('<h4>Shuffle Number ' + this.getNumShuffles() + '</h4>');
            $div.append('<h4>Score ' + this.getScore() + '</h4>');

            for (i = 0; i < numCards; i += 1) {
                $div.append(this.printCard(this.getCard(i)));
                $div.append('<br />');
            }

            return this;
        },

        calculateAverage: function () {
            var total = 0,
                pScores = this.getPastScores(),
                average,
                i;

            for (i = 0; i < pScores.length; i += 1) {
                total += pScores[i];
            }

            average = Math.floor(total / pScores.length);

            return average;
        },

        setupInterval: function () {
            var that = this,
                startTime = new Date(),
                $startTime = $('#start-time'),
                $config = $('#configuration'),
                timer;

            $('.score').empty();
            $('#num-shuffles').empty();


            $startTime.html(startTime.toLocaleString());

            $config.prepend(
                '<div class="result" id="num-cards-' + that.getNumCards() + '">' +
                    '<h2>' + that.getNumCards() + ' Cards</h2>' +
                    '<h3>Start: ' + startTime.toLocaleString() + '</h3>' +
                    '<div class="content"></div>' +
                    '</div>'
            );

            timer = setInterval(function () {
                that.shuffle(function () {
                    that.scoreOrder(function () {
                        that.updateScoreStats();

                        if (that.getScore() === 0) {
                            console.log('Solved deck with ' + that.getNumNumbers() + ' cards. Adding another card!');
                            that.flashLights(3);
                            clearInterval(timer);
                            that.resetScore()
                                .clearPastScores()
                                .setCards([])
                                .setNumNumbers(that.getNumNumbers() + 1)
                                .populateDeck()
                                .setupInterval();
                        }

                    });
                });
            }, 1);

            return this;
        },

        setupHueUser: function () {
            $.ajax({
                type: 'POST',
                url: 'http://192.168.1.167/api',
                data: '{ "devicetype": "shuffler", "username": "zenahirsch" }'
            })
                .done(function (msg) {
                    console.log('set up user');
                });
        },

        flashLights: function (light) {
            $.ajax({
                type: 'PUT',
                url: 'http://192.168.1.167/api/zenahirsch/lights/' + light + '/state',
                data: '{ "on": true, "bri": 0, "alert": "lselect" }'
            })
                .done(function (msg) {
                    console.log('flashed lights');
                });
        }
    };
};