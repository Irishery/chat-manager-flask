from flask import Blueprint, render_template
from flask_login import login_required
from app.models import User

main_route = Blueprint("main_route", __name__)

@main_route.route("/")
@login_required
def base():
    users = User.query.all()
    return render_template('main.html', users=users)
