import os
import smtplib
from email.message import EmailMessage


class gmail_sender:
    def __init__(self, sender_email, receiver_email, sender_password, cc_email='', bcc_email=''):
        self.s_email = sender_email
        self.r_email = receiver_email
        self.pw = sender_password
        self.server_name = 'smtp.gmail.com'
        self.server_port = 587

        self.msg = EmailMessage()
        self.msg['From'] = self.s_email
        self.msg['To'] = self.r_email
        if cc_email != '':
            self.cc_email = cc_email
            self.msg['Cc'] = self.cc_email
        if bcc_email != '':
            self.bcc_email = bcc_email
            self.msg['Bcc'] = self.bcc_email
        self.smtp = smtplib.SMTP(self.server_name, self.server_port)

    def msg_set(self, msg_title, msg_body):
        self.msg['Subject'] = msg_title
        self.msg.set_content(msg_body)

    def smtp_connect_send(self):
        self.smtp.ehlo()
        self.smtp.starttls()
        self.smtp.login(self.s_email, self.pw)
        self.smtp.send_message(self.msg)

    def smtp_disconnect(self):
        self.smtp.close()


def send_auth_email(email, new_pw):
    auth_email = gmail_sender(
        os.getenv('GMAIL_SENDER_EMAIL'), email, os.getenv('GMAIL_SENDER_PWD'))

    email_title = '[쩝쩝박사] 비밀번호 초기화 이메일입니다.'
    email_msg = f'\n\n해당 비밀번호로 로그인 후, 새로운 비밀번호로 변경해주시기 바랍니다.\n\n{new_pw}'

    auth_email.msg_set(email_title, email_msg)
    auth_email.smtp_connect_send()
    auth_email.smtp_disconnect()
    return {'message': '비밀번호 초기화 이메일이 전송되었습니다.'}
