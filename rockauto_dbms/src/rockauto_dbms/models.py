from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


make_years = db.Table('make_years',
    db.Column('make_id', db.Integer, db.ForeignKey('make.id')),
    db.Column('year_id', db.Integer, db.ForeignKey('year.id')))

year_models = db.Table('year_models',
    db.Column('year_id', db.Integer, db.ForeignKey('year.id')),
    db.Column('model_id', db.Integer, db.ForeignKey('model.id')))

car_categories = db.Table('car_categories',
    db.Column('car_id', db.Integer, db.ForeignKey('car.id')),
    db.Column('category_id', db.Integer, db.ForeignKey('category.id')))

category_part_types = db.Table('category_part_types',
    db.Column('category_id', db.Integer, db.ForeignKey('category.id')),
    db.Column('part_type_id', db.Integer, db.ForeignKey('part_type.id')))

part_type_parts = db.Table('part_type_parts',
    db.Column('part_type_id', db.Integer, db.ForeignKey('part_type.id')),
    db.Column('part_id', db.Integer, db.ForeignKey('part.id')))

class Versions(db.Model):
    __tablename__ = 'version'
    id = db.Column(db.Integer, primary_key=True)
    nbr = db.Column(db.Float)

class Make(db.Model):
    __tablename__ = 'make'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), index=True, unique=True)
    version_id = db.Column(db.Integer, db.ForeignKey('version.id'))
    link = db.Column(db.String(500))
    payload = db.Column(db.String(5000))
    models = db.relationship('model', backref='make', lazy=True)

class Year(db.Model):
    __tablename__ = 'year'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), index=True, unique=True)
    version_id = db.Column(db.Integer, db.ForeignKey('version.id'))
    link = db.Column(db.String(500))
    payload = db.Column(db.String(5000))
    makes = db.relationship('make', secondary=make_years, backref='years')

class Model(db.Model):
    __tablename__ = 'model'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), index=True, unique=True)
    make_id = db.Column(db.Integer, db.ForeignKey('make.id'))
    version_id = db.Column(db.Integer, db.ForeignKey('version.id'))
    link = db.Column(db.String(500))
    payload = db.Column(db.String(5000))
    years = db.relationship('year', secondary=year_models, backref='models')

class Car(db.Model):
    __tablename__ = 'car'
    id = db.Column(db.Integer, primary_key=True)
    engine_id = db.Column(db.Integer, db.ForeignKey('engine.id'))
    year_id = db.Column(db.Integer, db.ForeignKey('year.id'))
    version_id = db.Column(db.Integer, db.ForeignKey('version.id'))
    model_id = db.Column(db.Integer, db.ForeignKey('model.id'))
    categories = db.relationship('category', secondary=car_categories)

class Engine(db.Model):
    __tablename__ = 'engine'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), index=True, unique=True)
    version_id = db.Column(db.Integer, db.ForeignKey('version.id'))
    link = db.Column(db.String(500))
    payload = db.Column(db.String(5000))

class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), index=True, unique=True)
    version_id = db.Column(db.Integer, db.ForeignKey('version.id'))
    link = db.Column(db.String(500))
    payload = db.Column(db.String(5000))
    part_types = db.relationship('part_type', backref='category', lazy=True)

class PartType(db.Model):
    __tablename__ = 'part_type'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), index=True, unique=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    version_id = db.Column(db.Integer, db.ForeignKey('version.id'))
    link = db.Column(db.String(500))
    payload = db.Column(db.String(5000))
    parts = db.relationship('part', backref='part_type', lazy=True)

class Part(db.Model):
    __tablename__ = 'part'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), index=True, unique=True)
    part_type_id = db.Column(db.Integer, db.ForeignKey('part_type.id'))
    manufacturer_id = db.Column(db.Integer, db.ForeignKey('manufacturer.id'))
    part_number = db.Column(db.String(500))
    tags = db.Column(db.String(500))
    alt_text = db.Column(db.String(5000))
    price = db.Column(db.String(50))
    version_id = db.Column(db.Integer, db.ForeignKey('version.id'))
    link = db.Column(db.String(500))
    payload = db.Column(db.String(5000))

class Manufacturer(db.Model):
    __tablename__ = 'manufacturer'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), index=True, unique=True)
    parts = db.relationship('part', backref='manufacturer', lazy=True)
    version_id = db.Column(db.Integer, db.ForeignKey('version.id'))
