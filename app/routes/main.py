from flask import Blueprint, render_template
from app.models import User

main_route = Blueprint("main_route", __name__)

@main_route.route("/")
def base():
    users = User.query.all()
    print(users)
    return render_template('main.html', users=users)
