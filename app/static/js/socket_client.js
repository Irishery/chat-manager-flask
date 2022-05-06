var socket = io("http://178.62.217.248:80");
socket.on('connect', function() {
    socket.emit('my event', {data: 'I\'m connected!'});
    
    socket.on("disconnection", () => {
        const id = socket.id
        socket.emit('disconnect', id)
    });
});


export {socket};
