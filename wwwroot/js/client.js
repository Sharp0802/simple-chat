'use strict';

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

let mySession = -1
let myId = -1

const UsersDOM = document.getElementById('usr-list');
const ChatDOM = document.getElementById('chat-box');

const InputDOM = document.getElementById('in-value');
const SubmitDOM = document.getElementById('in-submit');

let lastUpdated = 0;

SubmitDOM.addEventListener("click", () => {
    request.post("/chat", {
        "session": mySession,
        "user": myId,
        "msg": InputDOM.value
    }).then(() => {
        InputDOM.value = "";
    });
});

const Updator = {
    Self: async () => {
        await request.put(`/usr/${mySession}`);
    },
    UserList: async () => {
        await request
            .get("/usr")
            .then(res => res.json())
            .then(res => {
                UsersDOM.replaceChildren();
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
                    UsersDOM.appendChild(li);
                }
            })
            .catch(_ => {
                let b = document.createElement("b");
                b.textContent = "couldn't fetch users";
                UsersDOM.replaceChildren();
                UsersDOM.appendChild(b);
            });
    },
    Chat: async () => {
        await request
            .get(`/chat/${lastUpdated}`)
            .then(res => res.json())
            .then(res => {
                const logs = res.logs;
                for (const log of logs) {
                    if (log.user == -1) {
                        let li = document.createElement("li");
                        let b = document.createElement("b");
                        b.textContent = "server: ";
                        li.appendChild(b);
                        li.append(log.msg);
                        ChatDOM.appendChild(li);
                        continue;
                    }

                    request.get(`/usr/${log.user}`)
                        .then(r => r.json())
                        .then(r => {
                            let li = document.createElement("li");
                            let b = document.createElement("b");
                            b.textContent = `${r.name}: `;
                            li.appendChild(b);
                            li.append(log.msg);
                            ChatDOM.appendChild(li);
                        });
                }
                lastUpdated += logs.length;
            })
            .catch(_ => {
                let li = document.createElement("li");
                let b = document.createElement("b");
                b.textContent = "couldn't fetch chats";
                li.appendChild(b);
                ChatDOM.replaceChildren();
                ChatDOM.appendChild(li)
            });
    },
    All: async () => {
        await Updator.Self();
        await Updator.UserList();
        await Updator.Chat();
    }
};

(async function () {
    const myName = prompt("What's your name?", "Harry Potter");
    await request
        .post("/usr", { "name": myName })
        .then(data => data.json())
        .then(data => {
            mySession = data.session;
            myId = data.id;
            console.log(`session: ${mySession}, id: ${myId}`)
        });
})().then(_ => {
    setInterval(Updator.All, 500);
});
