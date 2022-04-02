from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, BooleanField

class SignUp(FlaskForm):
    name = StringField("Name", id="name")
    login = StringField("Login", id="login")
    password = StringField("Password", id='password')
    registrer = SubmitField("Sign Up", id="form_button")


class SignIn(FlaskForm):
    login = StringField("Login", id="login")
    password = StringField("Password", id='password')
    enter = SubmitField("Sign In",  id="form_button")
    remember = BooleanField("Remember")
