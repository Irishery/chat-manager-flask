from dataclasses import dataclass
from datetime import datetime
from email.policy import default
from xmlrpc.client import Boolean
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from flask_login import LoginManager
from sqlalchemy.dialects.postgresql import ARRAY
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()
login_manager = LoginManager()


@dataclass
class Manager(db.Model, UserMixin):
    id: int = db.Column(db.Integer, primary_key=True)
    name: str = db.Column(db.String(255), nullable=False)   
    login: str = db.Column(db.String(255), nullable=False)
    password_hash: str = db.Column(db.String(255), nullable=False)
    unread_msgs: list = db.Column(ARRAY(db.String(255)), nullable=True)

    def __init__(self, name, login, password,
                 last_enter=datetime.now()):
        self.name = name
        self.login = login
        self.set_password(password)
        self.last_enter = last_enter
    
    def get_id(self):
        return str(self.id)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def add_role(self, role):
        self.roles.append(role)


@dataclass
class User(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    telegram_id: int = db.Column(db.Integer, unique=True, nullable=False)
    nickname: str = db.Column(db.String(255), nullable=False)
    username: str = db.Column(db.String(255), default='None')
    unread_count: int = db.Column(db.Integer, server_default='0')
    avatar_path: str = db.Column(db.String(255), nullable=True, 
                                default='static/images/default_avatar.jpg')
    is_banned: Boolean = db.Column(db.Boolean, default=False)

    def __init__(self, telegram_id, username, nickname, unread_count=None):
        self.telegram_id = telegram_id
        self.nickname = nickname
        if username:
            self.username = username
        if unread_count:
            self.unread_count = unread_count


    def add_user(self):
        db.session.add(self)
        db.session.commit()


@dataclass
class Message(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    telegram_id: int = db.Column(db.Integer, nullable=False)
    message_text: str = db.Column(db.String(255), nullable=False)
    sent_datetime: datetime = db.Column(db.DateTime(timezone=True),
                                        nullable=False)
    nickname: str = db.Column(db.String(255), nullable=False)
    role: str = db.Column(db.String(255), nullable=False)

    def __init__(self, telegram_id, message_text, nickname, role, sent_datetime):
        self.telegram_id = telegram_id
        self.message_text = message_text
        self.nickname = nickname
        self.role = role
        self.sent_datetime = sent_datetime


    def add_message(self):
        db.session.add(self)
        db.session.commit()


@login_manager.user_loader
def load_user(user_id):
    return Manager.query.get(int(user_id))
