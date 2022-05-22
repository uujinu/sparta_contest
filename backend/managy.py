from app import create_app, blueprint

app = create_app()
app.register_blueprint(blueprint, url_prefix='/api')

if __name__ == '__main__':
    app.run(port=5000)
