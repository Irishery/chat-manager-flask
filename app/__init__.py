from flask import Flask
from flask_migrate import Migrate
from app.socket.socket import socketio
from app.models import db, login_manager


migrate = Migrate()


def create_app(config):
    app = Flask(__name__)
    app.config.from_object(config)

    db.init_app(app)
    migrate.init_app(app, db)

    login_manager.login_view = "auth.sign_in"
    login_manager.init_app(app)

    socketio.init_app(app)

    from .routes.main import main_route
    from .routes.auth import auth_route
    app.register_blueprint(main_route)
    app.register_blueprint(auth_route)

    from app.api.user_api import user_api
    app.register_blueprint(user_api)

    return app
