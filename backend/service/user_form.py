from flask_wtf import FlaskForm
from wtforms import StringField, EmailField, PasswordField, SubmitField
from wtforms.validators import DataRequired, EqualTo


class LoginForm(FlaskForm):
    email = EmailField('email', validators=[DataRequired()])
    password = PasswordField('password', validators=[DataRequired()])
    submit = SubmitField('submit')


class PasswordManageForm(LoginForm):
    password = PasswordField('password', validators=[
                             DataRequired(), EqualTo('password2')])
    password2 = PasswordField('password', validators=[DataRequired()])


class RegisterForm(PasswordManageForm):
    nickname = StringField('nickname', validators=[DataRequired()])
