# from app import db
from dataclasses import dataclass
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

@dataclass
class User(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    telegram_id: int = db.Column(db.Integer, unique=True, nullable=False)
    nickname: str = db.Column(db.String(255), nullable=False)
    username: str = db.Column(db.String(255), default='None')

    def __init__(self, telegram_id, username, nickname):
        self.telegram_id = telegram_id
        self.nickname = nickname
        self.username = username
    
    def add_user(self):
        group = MessageGroup(self.nickname, self.telegram_id)
        db.session.add(group)
        db.session.add(self)

        id = self.query.order_by(-User.id).first().id
        last_group = MessageGroup.query.order_by(-MessageGroup.id).first()
        
        if last_group:
            group_member = GroupMember(user_id=id, group_id=last_group.id)
        else:
            group_member = GroupMember(1)

        db.session.add(group_member)
        db.session.commit()


@dataclass
class MessageGroup(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    telegram_id: int = db.Column(db.Integer, nullable=False, unique=True)
    group_name: str = db.Column(db.String(255), nullable=False)

    def __init__(self, group_name, telegram_id):
        self.group_name = group_name
        self.telegram_id = telegram_id


@dataclass
class GroupMember(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    user_id: int = db.Column(db.Integer, db.ForeignKey('user.id'),
                                         nullable=False)
    group_id: int = db.Column(db.Integer, db.ForeignKey('message_group.id'), 
                                          nullable=False)

    def __init__(self, user_id, group_id):
        self.user_id = user_id
        self.group_id = group_id


@dataclass
class Message(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    telegram_id: int = db.Column(db.Integer, nullable=False)
    message_text: str = db.Column(db.String(255), nullable=False)
    sent_datetime: datetime = db.Column(db.DateTime(timezone=True),
                                        nullable=False)
    nickname: str = db.Column(db.String(255), nullable=False)
    group_id: int = db.Column(db.Integer, db.ForeignKey('message_group.id'),
                                          nullable=False)
    role: str = db.Column(db.String(255), nullable=False)

    def __init__(self, telegram_id, message_text, nickname, role, sent_datetime):
        self.telegram_id = telegram_id
        self.message_text = message_text
        self.nickname = nickname
        self.role = role
        self.sent_datetime = sent_datetime


    def add_message(self):
        group = MessageGroup.query.filter_by(telegram_id=self.telegram_id).first()
        self.group_id = group.id
        db.session.add(self)
        db.session.commit()
