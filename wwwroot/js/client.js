'use strict';

console.log("hello!")

const request = {
    get: (url) => fetch(url, {
        headers: {
            "Keep-Alive": "timeout=5"
        }
    }),

    patch: (url, payload) => fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Keep-Alive": "timeout=5"
        },
        body: JSON.stringify(payload)
    }),

    put: (url, payload) => fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Keep-Alive": "timeout=5"
        },
        body: JSON.stringify(payload)
    }),

    post: (url, payload) => fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Keep-Alive": "timeout=5"
        },
        body: JSON.stringify(payload)
    }),

    delete: (url) => fetch(url, {
        method: "DELETE"
    })
};

const myName = prompt("What's your name?", "Harry Potter");

let mySession = -1
let myId = -1
request
    .post("/usr", { "name": myName })
    .then(data => data.json())
    .then(data => {
        mySession = data.session;
        myId = data.id;
        console.log(`session: ${mySession}, id: ${myId}`)
    });


let usrsDOM = document.getElementById('usr-list');
let gameDOM = document.getElementById('game-box');
let inputDOM = document.getElementById('in-box');
let submitDOM = document.getElementById('in-submit');

let lastUpdated = 0;

async function UpdateUserList() {
    await request
        .get("/usr")
        .then(res => res.json())
        .then(res => {
            usrsDOM.replaceChildren();
            for (const data of res.datas) {
                let li = document.createElement("li");
                if (myId == data.id) {
                    let b = document.createElement("b");
                    b.textContent = data.name;
                    li.appendChild(b);
                }
                else {
                    li.textContent = data.name;
                }
                usrsDOM.appendChild(li);
            }
        })
        .catch(_ => {
            let b = document.createElement("b")
            b.textContent = "couldn't fetch users";
            usrsDOM.replaceChildren();
            usrsDOM.appendChild(b);
        });

    await request.put(`/usr/${mySession}`);
}

async function UpdateGame() {
    await request
        .get(`/game/${lastUpdated}`)
        .then(res => res.json())
        .then(res => {
            // TODO: update game
        })
}

// TODO: input word

const loopID = setInterval(UpdateUserList, 500);
