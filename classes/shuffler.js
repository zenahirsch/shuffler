var Shuffler = function () {
    'use strict';

    var cards = [],
        pastScores = [],
        num = 0,
        suits = ['hearts', 'clubs', 'diamonds', 'spades'],
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
                s,
                n;

            for (s = 0; s < this.getSuits().length; s += 1) {
                for (n = 0; n < this.getNumNumbers(); n += 1) {
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
            var offset,
                i;

            this.incrementNumShuffles();
            this.resetScore();

            for (i = 0; i < this.getNumCards(); i += 1) {
                offset = i - this.getCard(i).index;
                this.incrementScore(Math.abs(offset));
            }

            this.addNewPastScore(this.getScore());

            if (this.getPastScores().length > 100) {
                this.removeOldPastScore();
            }

            callback();
        },

        updateScoreStats: function () {
            var $highest = $('#highest-score'),
                $lowest = $('#lowest-score'),
                $average = $('#average-score'),
                $numShuffles = $('#num-shuffles'),
                $numCards = $('#num-cards'),
                currentScore = this.getScore();

            if (!$highest.html()) {
                $highest.html(currentScore);
                this.printCards();
            }

            if (!$lowest.html()) {
                $lowest.html(currentScore);
                this.printCards();
            }

            // don't depend on the dom - will fix
            if (currentScore > $highest.html()) {
                $highest.html(currentScore);
            }
            // don't depend on the dom - will fix
            if (currentScore < $lowest.html()) {
                $lowest.html(currentScore);
                this.printCards();
            }

            $numCards.html(this.getNumCards());

            $numShuffles.html(this.getNumShuffles());

            if (this.getNumShuffles() % 10 === 0) {
                $average.html(this.calculateAverage());
            }

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
                i;

            $div.empty();

            $div.append('<h3>Latest: ' + now.toLocaleString() + '</h3>');
            $div.append('<h4>Shuffle Number ' + this.getNumShuffles() + '</h4>');
            $div.append('<h4>Score ' + this.getScore() + '</h4>');

            for (i = 0; i < this.getNumCards(); i += 1) {
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
        }
    };
};