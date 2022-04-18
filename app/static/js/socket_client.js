var socket = io("http://157.230.103.205:5000");
socket.on('connect', function() {
    socket.emit('my event', {data: 'I\'m connected!'});
    
    socket.on("disconnection", () => {
        const id = socket.id
        socket.emit('disconnect', id)
    });
});


export {socket};
