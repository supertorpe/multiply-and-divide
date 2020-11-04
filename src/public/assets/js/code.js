let data;

let total = 0;

const initialize = function () {
    const jsonData = localStorage.getItem("data");
    if (!jsonData) {
        data = [];
        data.push({
            count: 0,
            stack: []
        });
        data.push({
            count: 0,
            stack: []
        });
        const pile = {
            count: 0,
            stack: []
        };
        for (let i = 2; i < 10; i++) {
            for (let j = 2; j < 10; j++) {
                pile.stack.push({ query: `${i} x ${j} = _`, ans: i * j, count: 0 });
                pile.stack.push({ query: `${i} x _ = ${i * j}`, ans: j, count: 0 });
                pile.stack.push({ query: `_ x ${j} = ${i * j}`, ans: i, count: 0 });
                pile.stack.push({ query: `${i * j} / ${i} = _`, ans: j, count: 0 });
                pile.stack.push({ query: `${i * j} / ${j} = _`, ans: i, count: 0 });
                pile.stack.push({ query: `${i * j} / _ = ${i}`, ans: j, count: 0 });
                pile.stack.push({ query: `${i * j} / _ = ${j}`, ans: i, count: 0 });
                pile.stack.push({ query: `_ / ${i} = ${j}`, ans: i * j, count: 0 });
                pile.stack.push({ query: `_ / ${j} = ${i}`, ans: i * j, count: 0 });
            }
        }
        data.push(pile);
        data.push({
            count: 0,
            stack: []
        });
        data.push({
            count: 0,
            stack: []
        });
        localStorage.setItem("data", JSON.stringify(data));
    } else {
        data = JSON.parse(jsonData);
    }
    updateCounters();
    window.onkeydown = function (event) {
        if (isFinite(event.key)) clickDigit(event.key);
    };
    nextChallenge();
};

let updateCounters = function () {
    document.querySelector(".uno").innerHTML = data[0].stack.length;
    document.querySelector(".dos").innerHTML = data[1].stack.length;
    document.querySelector(".tres").innerHTML = data[2].stack.length;
    document.querySelector(".cuatro").innerHTML = data[3].stack.length;
    document.querySelector(".cinco").innerHTML = data[4].stack.length;
};

let currentChallenge = {
    idxBox: -1,
    idxChallenge: -1,
    challenge: null,
    answer: ""
};

const nextChallenge = function () {
    total++;
    document.querySelector('#stop').style.display = 'inline';
    document.querySelector('#start').style.display = 'none';
    document.querySelector(".timer").innerHTML = "";
    document.querySelector(".question").style.textDecoration = "";
    document.querySelector(".question-right").innerHTML = "";
    // buscar la caja
    let candidate = 0;
    // si está en la primera pasada, pillar el candidato de la caja central
    if (isInInitialPhase()) {
        candidate = 2;
    } else {
        // si no, localizar la caja de la que extraer el challenge
        for (let i = 0; i < data.length; i++) {
            if (data[i].stack.length === 0) continue;
            if (data[candidate].stack.length === 0) candidate = i;
            if (candidate === data.length - 1) break;
            if (
                i > candidate &&
                data[candidate].count > data[i].count * 3 * (i - candidate)
            )
                candidate = i;
        }
    }
    // seleccionar uno al azar
    currentChallenge.idxBox = candidate;
    currentChallenge.idxChallenge = Math.floor(
        Math.random() * data[candidate].stack.length
    );
    currentChallenge.challenge =
        data[currentChallenge.idxBox].stack[currentChallenge.idxChallenge];
    document.querySelector(".question").innerHTML =
        currentChallenge.challenge.query;
    currentChallenge.answer = "";
    if (!isInInitialPhase()) data[candidate].count++;
    if (currentChallenge.challenge.count > 0) {
        startTimer(2 + (data.length - candidate) * 3);
    } else {
        startTimer(10);
    }
};

const isInInitialPhase = function () {
    return data[2].stack.length > 0 && data[2].count === 0;
};

let timer;

const clearTimer = function () {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
};

const startTimer = function (time) {
    clearTimer();
    document.querySelector(".timer").innerHTML = time;
    timer = setInterval(function () {
        time--;
        document.querySelector(".timer").innerHTML = time;
        if (time === 0) {
            manageError();
        }
    }, 1000);
};

const manageError = function () {
    clearTimer();
    currentChallenge.challenge.count++;
    if (currentChallenge.idxBox > 0) {
        // moverlo de caja
        data[currentChallenge.idxBox].stack.splice(
            currentChallenge.idxChallenge,
            1
        );
        //data[currentChallenge.idxBox].count--;
        data[currentChallenge.idxBox - 1].stack.push(currentChallenge.challenge);
        //data[currentChallenge.idxBox - 1].count++;
    }
    saveData();

    document.querySelector(
        ".question-right"
    ).innerHTML = currentChallenge.challenge.query.replace(
        "_",
        currentChallenge.challenge.ans
    );
    document.querySelector(".question").style.textDecoration = "line-through";
    const timeout = setTimeout(function () {
        clearTimeout(timeout);
        nextChallenge();
    }, 3000);
};

const manageSuccess = function () {
    clearTimer();
    currentChallenge.challenge.count++;
    if (currentChallenge.idxBox < data.length - 1) {
        // moverlo de caja
        data[currentChallenge.idxBox].stack.splice(
            currentChallenge.idxChallenge,
            1
        );
        //data[currentChallenge.idxBox].count--;
        data[currentChallenge.idxBox + 1].stack.push(currentChallenge.challenge);
        //data[currentChallenge.idxBox + 1].count++;
    }
    saveData();
    const timeout = setTimeout(function () {
        clearTimeout(timeout);
        nextChallenge();
    }, 1000);
};

const saveData = function () {
    localStorage.setItem("data", JSON.stringify(data));
    updateCounters();
};

const clickDigit = function (digit) {
    if (!timer) return false;
    currentChallenge.answer += digit;
    let replacement = digit;
    if (
        currentChallenge.challenge.ans.toString().length >
        currentChallenge.answer.length
    )
        replacement += "_";
    document.querySelector(".question").innerHTML = document
        .querySelector(".question")
        .innerHTML.replace("_", replacement);
    const correctAnswer = currentChallenge.challenge.ans.toString();
    if (correctAnswer == currentChallenge.answer) {
        manageSuccess();
    } else {
        if (
            currentChallenge.answer.length > correctAnswer.length ||
            (correctAnswer.length == currentChallenge.answer.length &&
                correctAnswer != currentChallenge.answer)
        )
            manageError();
    }
};

const reset = function () {
    localStorage.removeItem("data");
    initialize();
};

const stop = function () {
    clearTimer();
    document.querySelector('#stop').style.display = 'none';
    document.querySelector('#start').style.display = 'inline';
};

const start = function () {
    nextChallenge();
    document.querySelector('#stop').style.display = 'inline';
    document.querySelector('#start').style.display = 'none';
};

initialize();

window.onload = () => {
    'use strict';
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/assets/js/sw.js');
    }
}