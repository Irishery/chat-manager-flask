var socket = io("http://127.0.0.1:5000");
socket.on('connect', function() {
    const id = socket.id
    console.log(id)
    socket.emit('my event', {data: 'I\'m connected!'});
    console.log('connected')
    
    socket.on("disconnection", () => {
        const id = socket.id
        console.log(id)
        console.log(socket.connected);
        socket.emit('disconnect', id)
    });
});


export {socket};