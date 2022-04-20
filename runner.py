import os
from app import db, create_app, socketio
from dotenv import load_dotenv

load_dotenv()

app = create_app(os.getenv('FLASK_ENV') or 'config.DevelopementConfig')


if __name__ == '__main__':
    # with app.app_context():
        # db.create_all()
        # db.drop_all()
    host = os.getenv('HOST')
    port = os.getenv('PORT')
    socketio.run(app, host=host, port=port)
