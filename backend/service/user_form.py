from flask_wtf import FlaskForm
from wtforms import StringField, EmailField, PasswordField, SubmitField
from wtforms.validators import DataRequired, EqualTo


class RegisterForm(FlaskForm):
    nickname = StringField('nickname', validators=[DataRequired()])
    email = EmailField('email', validators=[DataRequired()])
    password = PasswordField('password', validators=[
                             DataRequired(), EqualTo('password2')])
    password2 = PasswordField('password', validators=[DataRequired()])
    submit = SubmitField('submit')
