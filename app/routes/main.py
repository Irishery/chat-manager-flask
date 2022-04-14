from flask import Blueprint, render_template, request
from flask_login import login_required, current_user
from app.models import User

main_route = Blueprint("main_route", __name__)

@main_route.route("/", methods=["GET"])
@login_required
def base():
    user_id = request.args.get('user_id')
    users = User.query.all()
    return render_template('main.html', users=users, current_user=current_user,
                                        user_id=user_id)


@main_route.route("/table")
def table():
    users = User.query.all()
    return render_template('users_table.html', users=users)
