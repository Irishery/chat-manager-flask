from app import db
from dataclasses import dataclass
from datetime import datetime


@dataclass
class User(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    telegram_id: int = db.Column(db.Integer, unique=True, nullable=False)
    nickname: str = db.Column(db.String(255), nullable=False)
    username: str = db.Column(db.String(255), default='None') 


@dataclass
class MessageGroup(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    group_name: str = db.Column(db.String(255), nullable=False)


@dataclass
class GroupMember(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    user_id: int = db.Column(db.Integer, db.ForeignKey('user.id'),
                                         nullable=False)


@dataclass
class Message(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    from_id: int = db.Column(db.Integer, db.ForeignKey('user.id'),
                                         nullable=False)
    to_id: int = db.Column(db.Integer, db.ForeignKey('user.id'),
                                       nullable=False)
    message_text: str = db.Column(db.String(255), nullable=False)
    sent_datetime: datetime = db.Column(db.DateTime(timezone=True),
                                        nullable=False)
    group_id: int = db.Column(db.Integer, db.ForeignKey('message_group.id'),
                                          nullable=False)
