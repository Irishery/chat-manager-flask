from flask import Flask
from flask_migrate import Migrate
from app.socket.socket import socketio
from app.models import db


migrate = Migrate()


def create_app(config):
    app = Flask(__name__)
    app.config.from_object(config)

    db.init_app(app)
    migrate.init_app(app, db)

    socketio.init_app(app)

    from .routes.main import main_route
    app.register_blueprint(main_route)

    from app.api.user_api import user_api
    app.register_blueprint(user_api)

    return app
