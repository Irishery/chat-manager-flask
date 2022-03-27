from flask import Blueprint, render_template

main_route = Blueprint("main_route", __name__)

@main_route.route("/")
def base():
    return 'Hello)'
