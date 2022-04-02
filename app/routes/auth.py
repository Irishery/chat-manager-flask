from flask import Blueprint, render_template, request, flash, redirect, url_for
from ..forms.authorization import SignUp, SignIn
from flask_login import login_required, login_user, logout_user
from ..models import Manager
from app import db
from werkzeug.security import check_password_hash

auth_route = Blueprint('auth', __name__)


@auth_route.route('/sign_up', methods=['GET', 'POST'])
def sign_up():
    form = SignUp()
    if request.method == "POST":
        if form.validate_on_submit():
            check_login = Manager.query.filter_by(login=form.login.data).first()
            
            if not (form.name.data and form.login.data and form.password.data):
                flash('Все поля должны быть заполнены')
                return redirect(url_for('auth.sign_up'))
            
            if check_login:
                flash('Такой логин уже существует')
                return redirect(url_for('auth.sign_up'))
            
            if len(form.password.data) < 3:
                flash('Пароль слишком короткий')
                return redirect(url_for('auth.sign_up'))

                
            user = Manager(name=form.name.data, login=form.login.data,
                        password=form.password.data)
            db.session.add(user)
            db.session.commit()

            login_user(user)

            return redirect(url_for("main_route.base"))
    return render_template("authorization.html", title="authorization",
                                                 form=form, action="sign_up")

@auth_route.route('/sign_in', methods=['GET', 'POST'])
def sign_in():
    form = SignIn()
    if request.method == "POST":
        if form.validate_on_submit():
            user = Manager.query.filter_by(login=form.login.data).first()
            if not user or not check_password_hash(user.password_hash,
                                                         form.password.data):
                flash("Login or password is incorrect")
                return redirect(url_for('auth.sign_in'))
            
            login_user(user, remember=form.remember.data)
            return redirect(url_for("main_route.base"))
    return render_template("authorization.html", title="authorization",
                                                 form=form, action="sign_in")


@auth_route.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("auth.sign_in"))