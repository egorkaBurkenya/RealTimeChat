const app = require('express')();
const io = require('socket.io')(app.listen(5056));

app.get('/', (req, res) => res.sendFile(__dirname.replace('server', 'client') + '/index.html'));

app.get('/styles.css', (req, res) => res.sendFile(__dirname.replace('server', 'client') + '/styles.css'));
app.get('/app.js', (req, res) => res.sendFile(__dirname.replace('server', 'client') + '/app.js'));

const users = {}
const typers = {}

io.sockets.on('connection', socket => {
    console.log('Connected ✅')

    socket.broadcast.emit('welcome', 'new user')
    console.log(socket.id);

    socket.on('user connected', payload => {
        users[socket.id] = {
            id: socket.id,
            name: payload.name,
            avatar: payload.avatar
        };

        socket.broadcast.emit('user connected', users[socket.id]);
    });

    socket.on('user typing', () => {

        console.log(typers);
        
        if (users[socket.id] != undefined) {
                typers[socket.id] = 1;
                socket.broadcast.emit('user typing', {
                    user: users[socket.id].name,
                    typers: Object.keys(typers).length
                });      
        } 
    });

    socket.on('send message', payload => {
        delete typers[socket.id];
        
        if (users[socket.id] != undefined) {
        socket.broadcast.emit('send message', {
            user: payload.user,
            message: payload.message,
            typers: Object.keys(typers).length
        });
    }
    });
    
    socket.on('user stopped typing', () => {
        delete typers[socket.id];
        socket.broadcast.emit('user stopped typing', Object.keys(typers).length);
    });
})