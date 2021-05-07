const socket = io();

const dom = {
    nameInput: document.querySelector('.message-input-field'),
    joinButton: document.querySelector('.join'),
    inputAvatar: document.querySelector('.avatar'),
    welcomeMessage: document.querySelector('.join-message'),
    feed: document.querySelector('.feed'),
    feedback: document.querySelector('.feedback'),
    chats: document.querySelector('.chats-feed')
};

const user = {
    name: null,
    avatar: null
};


dom.joinButton.onclick = e => {
    e.preventDefault();

    if (!dom.nameInput.value) {
        dom.nameInput.classList.add('error');
    } else {
        enterChannel();
    }
}

dom.nameInput.onkeyup = e => {

    if (user.name != null) {
        console.log('press');
        socket.emit('user typing');
    
        if (e.target.value === '') {
            socket.emit('user stopped typing');
        }
    }
    
    if (e.keyCode === 13) {

        if (user.name != null) {
            const message = e.target.value;
    
            socket.emit('send message', {
                message,
                user
            });
    
            addEntry({ user, message }, true);
    
            e.target.value = '';
        }

    }
};

const addEntry = ({ user, message }, you) => {
    const entry = document.createElement('li');
    const date = new Date();

    entry.classList = `message-entry${you ? ' message-entry-own' : ''}`
    entry.innerHTML = `
        <span class="avatar" style="background: ${user.avatar}; background-size: contain;"></span>
        <div class="message-body">
            <span class="user-name">${you ? 'You' : user.name}</span>
            <time>@ ${date.getHours()}:${date.getMinutes()}</time>
            <p class="message">${message}</p>
        </div>
    `;

    dom.feed.appendChild(entry);
};


const enterChannel = () => {
    const avatar = getAvatar();
    const name = dom.nameInput.value;

    dom.joinButton.remove();
    dom.welcomeMessage.remove();

    dom.nameInput.value = '';
    dom.nameInput.placeholder = 'Send a message for the channel...';

    dom.inputAvatar.innerText = '';
    dom.inputAvatar.style.backgroundImage = avatar;
    dom.inputAvatar.style.backgroundSize = 'contain';

    user.name = name;
    user.avatar = avatar;

    addWelcomeMessage({ avatar }, true);

    
    socket.emit('user connected', {
        name,
        avatar
    });

};

const getAvatar = () => {
    const size = Math.floor(Math.random() * 100) + 25;

    return `url(https://www.placecage.com/${size}/${size})`;
};

const addNewChat = (user, you) => {

    let newChat = document.createElement('li');
    
    const avatar = you ? '' : `<div class="avatar" style="background: ${user.avatar}; background-size: contain;"></div>`;

    newChat.classList = 'new-chat';
    newChat.innerHTML = `
        <div class="new-chat">
            ${avatar}
            ${user.name}
        </div>
    `;

    // console.log(newChat);
    if (!you) {
        dom.chats.appendChild(newChat);
    }

}

const addWelcomeMessage = (user, you) => {

    addNewChat(user, you)

    const welcomeMessage = document.createElement('li');
    console.log(you);
    const message = you ?
        'You have joined the conversation' :
        `<span class="user-name">${user.name}</span> has joined the conversation`;
    
    const avatar = you ? '' : `<div class="avatar" style="background: ${user.avatar}; background-size: contain;"></div>`;

    welcomeMessage.classList = 'welcome-message';
    welcomeMessage.innerHTML = `
        <hr />
        <div class="welcome-message-text">
            ${avatar}
            ${message}
        </div>
    `;

    dom.feed.appendChild(welcomeMessage);
};

socket.on('user connected', payload => addWelcomeMessage(payload, false));

socket.on('user typing', ({ user, typers }) => {
    dom.feedback.innerHTML = typers > 1 ? 'Several people are typing...' : `<i>${user}</i> is typing...`;
});

socket.on('user stopped typing', typers => {
    if (!typers) {
        dom.feedback.innerHTML = '';
    }
});

socket.on('send message', payload => {
    addEntry(payload);

    if (!payload.typers) {
        dom.feedback.innerHTML = '';
    }
});