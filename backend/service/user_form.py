from flask_wtf import FlaskForm
from wtforms import StringField, EmailField, PasswordField, SubmitField
from wtforms.validators import DataRequired, EqualTo, Regexp


email_regex = '^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$'
email_validator = Regexp(email_regex, message='잘못된 이메일 형식입니다.')

passwd_regex = '^(?=.*[a-zA-Z])((?=.*\d)+(?=.*\W)).{8,15}$'
passwd_validator = Regexp(passwd_regex, message='잘못된 비밀번호 형식입니다.')


class LoginForm(FlaskForm):
    email = EmailField('email', validators=[DataRequired(), email_validator])
    password = PasswordField('password', validators=[
                             DataRequired(), passwd_validator])
    submit = SubmitField('submit')


class PasswordManageForm(LoginForm):
    password = PasswordField('password', validators=[
                             DataRequired(), EqualTo('password2')])
    password2 = PasswordField('password', validators=[DataRequired()])


class RegisterForm(PasswordManageForm):
    nickname = StringField('nickname', validators=[DataRequired()])
