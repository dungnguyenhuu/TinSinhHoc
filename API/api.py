from datetime import date
import calendar
import math
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
from flask_cors import CORS, cross_origin
from vietnamese_text_classifier import predict_category

# Constants
THIS_WEEK = 1
THIS_MONTH = 2
THIS_QUARTER = 3
THIS_YEAR = 4

# Configurations
app = Flask(__name__)
cors = CORS(app)

app.config['SECRET_KEY'] = 'thisissecret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////vtc.db'
app.config['CORS_HEADERS'] = 'Content-Type'

db = SQLAlchemy(app)

# Models


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    full_name = db.Column(db.String(50))
    email = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(80), nullable=False)
    admin = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    api_key = db.relationship(
        "APIKey", backref="parent", passive_deletes=True)
    api_call = db.relationship(
        "APICall", backref="parent", passive_deletes=True)


class APIKey(db.Model):
    __tablename__ = 'api_key'
    id = db.Column(db.Integer, primary_key=True)
    generated_key = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    remaining_calls = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id', ondelete='cascade'))


class APICall(db.Model):
    __tablename__ = 'api_call'
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False)
    document = db.Column(db.Text(), nullable=False)
    result = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id', ondelete='cascade'))


db.create_all()


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({
                'status': 'ERROR',
                'message': 'Token không hợp lệ!'
            })

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = User.query.filter_by(
                public_id=data['public_id']).first()
        except:
            return jsonify({
                'status': 'ERROR',
                'message': 'Token không hợp lệ!'
            })

        return f(current_user, *args, **kwargs)

    return decorated

# Tokens


@app.route('/api/tokens/validate', methods=['POST'])
def validate_token():
    data = request.get_json()
    requested_data = jwt.decode(data['token'], app.config['SECRET_KEY'])
    user = User.query.filter_by(
        public_id=requested_data['public_id']).first()

    if not user:
        return jsonify({
            'status': 'ERROR',
            'message': 'Token không hợp lệ!'
        })
    else:
        return jsonify({
            'status': 'SUCCESS',
            'message': 'Token hợp lệ!'
        })

# Routes
# Users


@app.route('/api/users/all', methods=['GET'])
@token_required
def get_all_users(current_user):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    users = User.query.order_by(User.full_name.desc())
    output = []

    for user in users:
        user_data = {}
        user_data['id'] = user.id
        user_data['public_id'] = user.public_id
        user_data['username'] = user.name
        user_data['full_name'] = user.full_name
        user_data['email'] = user.email
        user_data['password'] = user.password
        user_data['admin'] = user.admin
        user_data['created_at'] = user.created_at
        user_data['updated_at'] = user.updated_at

        output.append(user_data)

    data = {}
    data['users'] = output

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy danh sách tất cả các người dùng thành công!',
        'data': data
    })


@app.route('/api/users', methods=['GET'])
@token_required
def get_all_users_with_pagination(current_user):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    args = request.args
    keyword = None
    page = 1

    if "keyword" in args:
        keyword = args['keyword']

    if "page" in args:
        page = int(args['page'])

    users = User.query.order_by(User.created_at.desc())
    users_on_page = users.limit(10).offset((page - 1) * 10)
    total_pages = math.ceil(users.count() / 10)
    output = []

    for user in users_on_page:
        if (keyword != None):
            if (keyword in user.name) or (keyword in user.full_name) or (keyword in user.email):
                user_data = {}
                user_data['id'] = user.id
                user_data['public_id'] = user.public_id
                user_data['username'] = user.name
                user_data['full_name'] = user.full_name
                user_data['email'] = user.email
                user_data['password'] = user.password
                user_data['admin'] = user.admin
                user_data['created_at'] = user.created_at
                user_data['updated_at'] = user.updated_at

                output.append(user_data)
        else:
            user_data = {}
            user_data['id'] = user.id
            user_data['public_id'] = user.public_id
            user_data['username'] = user.name
            user_data['full_name'] = user.full_name
            user_data['email'] = user.email
            user_data['password'] = user.password
            user_data['admin'] = user.admin
            user_data['created_at'] = user.created_at
            user_data['updated_at'] = user.updated_at

            output.append(user_data)

    data = {}
    data['users'] = output
    data['current_page'] = page
    data['total_pages'] = total_pages

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy danh sách tất cả các người dùng thành công!',
        'data': data
    })


@app.route('/api/users/<public_id>', methods=['GET'])
@token_required
def get_one_user(current_user, public_id):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    user = User.query.filter_by(public_id=public_id).first()

    if not user:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không tìm thấy người dùng trong hệ thống!'
        })

    user_data = {}
    user_data['id'] = user.id
    user_data['public_id'] = user.public_id
    user_data['username'] = user.name
    user_data['full_name'] = user.full_name
    user_data['email'] = user.email
    user_data['password'] = user.password
    user_data['admin'] = user.admin
    user_data['created_at'] = user.created_at
    user_data['updated_at'] = user.updated_at

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy thông tin của người dùng thành công!',
        'data': user_data
    })


@app.route('/api/users/register', methods=['POST'])
def create_user():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'], method='sha256')
    public_id = str(uuid.uuid4())
    new_user = User(public_id=public_id, name=data['username'], full_name=data['full_name'], email=data['email'], password=hashed_password,
                    admin=data['admin'], created_at=datetime.datetime.now(), updated_at=datetime.datetime.now())
    errors = {}

    user = User.query.filter_by(name=data['username']).first()
    email = User.query.filter_by(email=data['email']).first()

    if (user or email):
        if user:
            errors['username'] = {}
            errors['username']['name'] = 'Tên đăng nhập'
            errors['username']['errors'] = ['Tên đăng nhập đã được sử dụng']

        if email:
            errors['email'] = {}
            errors['email']['name'] = 'Địa chỉ email'
            errors['email']['errors'] = ['Địa chỉ email đã được sử dụng']

        return jsonify({
            'status': 'ERROR',
            'message': 'Tài khoản này đã tồn tại trong hệ thống!',
            'errors': errors
        })

    db.session.add(new_user)
    db.session.commit()

    token = jwt.encode({
        'public_id': new_user.public_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=604800)
    }, app.config['SECRET_KEY'])

    user_data = {}
    user_data['username'] = data['username']
    user_data['full_name'] = data['full_name']
    user_data['admin'] = data['admin'],
    user_data['id'] = new_user.public_id,
    user_data['token'] = token.decode('UTF-8')

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Đăng ký tài khoản mới thành công!',
        'data': user_data
    })


@app.route('/api/users/<public_id>', methods=['PUT'])
@token_required
def update_user(current_user, public_id):
    user = User.query.filter_by(public_id=public_id).first()
    data = request.get_json()
    is_updated = False
    errors = {}

    if not user:
        return jsonify({
            'message': 'Tài khoản không tồn tại trong hệ thống!'
        })

    if data['full_name'] != '' and data['full_name'] != user.full_name:
        is_updated = True
        user.full_name = data['full_name']

    if data['email'] != '' and data['email'] != user.email:
        existed_email = User.query.filter_by(email=data['email']).first()

        if (not existed_email) or (existed_email and existed_email.public_id == public_id):
            is_updated = True
            user.email = data['email']
        else:
            errors['email'] = {}
            errors['email']['name'] = 'Địa chỉ email'
            errors['email']['errors'] = ['Địa chỉ email đã được sử dụng']

    if data['admin'] != user.admin:
        is_updated = True
        user.admin = data['admin']

    if is_updated == True:
        user.updated_at = datetime.datetime.now()

    db.session.commit()

    if (len(errors) > 0):
        return jsonify({
            'status': 'ERROR',
            'message': 'Cập nhật thông tin tài khoản thất bại!',
            'errors': errors
        })
    else:
        return jsonify({
            'status': 'SUCCESS',
            'message': 'Cập nhật thông tin tài khoản thành công!'
        })


@app.route('/api/users/change-password/<public_id>', methods=['PUT'])
@token_required
def change_password(current_user, public_id):
    user = User.query.filter_by(public_id=public_id).first()
    data = request.get_json()
    errors = {}

    if not user:
        return jsonify({
            'status': 'ERROR',
            'message': 'Tài khoản không tồn tại trong hệ thống!'
        })

    if check_password_hash(user.password, data['old_password']):
        if data['old_password'] != '' and data['new_password'] != '' and data['old_password'] == data['new_password']:
            hashed_password = generate_password_hash(
                data['new_password'], method='sha256')
            user.password = hashed_password

        db.session.commit()
    else:
        errors['old_password'] = {}
        errors['old_password']['name'] = 'Mật khẩu cũ'
        errors['old_password']['errors'] = ['Mật khẩu cũ không đúng!']

    if (len(errors) > 0):
        return jsonify({
            'status': 'ERROR',
            'message': 'Thay đổi mật khẩu của tài khoản thất bại!',
            'errors': errors
        })
    else:
        return jsonify({
            'status': 'SUCCESS',
            'message': 'Thay đổi mật khẩu của tài khoản thành công!'
        })


@app.route('/api/users/<public_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, public_id):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    user = User.query.filter_by(public_id=public_id).first()

    if not user:
        return jsonify({
            'status': 'ERROR',
            'message': 'Tài khoản không tồn tại trong hệ thống!'
        })

    db.session.delete(user)
    db.session.commit()

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Xóa người dùng khỏi hệ thống thành công!'
    })


@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(name=data['username']).first()

    if not user:
        return jsonify({
            'status': 'ERROR',
            'message': 'Tài khoản không tồn tại trong hệ thống!'
        })

    if check_password_hash(user.password, data['password']):
        token = jwt.encode({
            'public_id': user.public_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        }, app.config['SECRET_KEY'])

        user_data = {}
        user_data['username'] = user.name
        user_data['full_name'] = user.full_name
        user_data['admin'] = user.admin
        user_data['id'] = user.public_id
        user_data['token'] = token.decode('UTF-8')

        return jsonify({
            'status': 'SUCCESS',
            'message': 'Đăng nhập tài khoản thành công!',
            'data': user_data
        })

    return jsonify({
        'status': 'ERROR',
        'message': 'Đăng nhập tài khoản thất bại!'
    })

# API Keys


@app.route('/api/api-keys', methods=['GET'])
@token_required
def get_all_api_keys(current_user):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    args = request.args
    keyword = None
    page = 1

    if "keyword" in args:
        keyword = args['keyword']

    if "page" in args:
        page = int(args['page'])

    api_keys = APIKey.query.order_by(APIKey.created_at.desc())
    api_keys_on_page = api_keys.limit(10).offset((page - 1) * 10)
    total_pages = math.ceil(api_keys.count() / 10)
    output = []

    for api_key in api_keys_on_page:
        user = User.query.filter_by(id=api_key.user_id).first()

        if keyword != None:
            if (keyword in user.name) or (keyword in user.full_name) or (keyword in api_key.generated_key):
                api_key_data = {}
                api_key_data['id'] = api_key.id
                api_key_data['generated_key'] = api_key.generated_key
                api_key_data['created_at'] = api_key.created_at
                api_key_data['remaining_calls'] = api_key.remaining_calls
                api_key_data['user'] = {}
                api_key_data['user']['id'] = user.public_id
                api_key_data['user']['username'] = user.name
                api_key_data['user']['full_name'] = user.full_name

                output.append(api_key_data)
        else:
            api_key_data = {}
            api_key_data['id'] = api_key.id
            api_key_data['generated_key'] = api_key.generated_key
            api_key_data['created_at'] = api_key.created_at
            api_key_data['remaining_calls'] = api_key.remaining_calls
            api_key_data['user'] = {}
            api_key_data['user']['id'] = user.public_id
            api_key_data['user']['username'] = user.name
            api_key_data['user']['full_name'] = user.full_name

            output.append(api_key_data)

    data = {}
    data['api_keys'] = output
    data['total_pages'] = total_pages

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy danh sách tất cả các API key thành công!',
        'data': data
    })


@app.route('/api/api-keys/users', methods=['GET'])
@token_required
def get_api_key_of_user(current_user):
    api_key = APIKey.query.filter_by(user_id=current_user.id).first()

    if not api_key:
        return jsonify({
            'status': 'ERROR',
            'message': 'API key không tồn tại trong hệ thống!'
        })

    api_key_data = {}
    api_key_data['id'] = api_key.id
    api_key_data['generated_key'] = api_key.generated_key
    api_key_data['created_at'] = api_key.created_at
    api_key_data['remaining_calls'] = api_key.remaining_calls
    api_key_data['user'] = {}
    api_key_data['user']['id'] = current_user.public_id
    api_key_data['user']['username'] = current_user.name
    api_key_data['user']['full_name'] = current_user.full_name

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy thông tin của API key thành công!',
        'data': api_key_data
    })


@app.route('/api/api-keys/<api_key_id>', methods=['GET'])
@token_required
def get_one_api_key(current_user, api_key_id):
    api_key = APIKey.query.filter_by(id=api_key_id).first()

    if not api_key:
        return jsonify({
            'status': 'ERROR',
            'message': 'API key không tồn tại trong hệ thống!'
        })

    user = User.query.filter_by(id=api_key.user_id).first()

    api_key_data = {}
    api_key_data['id'] = api_key.id
    api_key_data['generated_key'] = api_key.generated_key
    api_key_data['created_at'] = api_key.created_at
    api_key_data['remaining_calls'] = api_key.remaining_calls
    api_key_data['user'] = {}
    api_key_data['user']['id'] = user.public_id
    api_key_data['user']['username'] = user.name
    api_key_data['user']['full_name'] = user.full_name

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy thông tin của API key thành công!',
        'data': api_key_data
    })


@app.route('/api/api-keys', methods=['POST'])
@token_required
def create_api_key(current_user):
    api_key = APIKey.query.filter_by(user_id=current_user.id).first()

    if api_key:
        return jsonify({
            'status': 'ERROR',
            'message': 'API key cho tài khoản này đã được tạo ra trước đó!'
        })

    generated_key = str(uuid.uuid4())
    new_api_key = APIKey(generated_key=generated_key, created_at=datetime.datetime.now(
    ), updated_at=datetime.datetime.now(), remaining_calls=100, user_id=current_user.id)

    db.session.add(new_api_key)
    db.session.commit()

    data = {}
    data['api_key'] = generated_key

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Tạo API key mới thành công!',
        'data': data
    })


@app.route('/api/api-keys/create', methods=['POST'])
@token_required
def create_api_key_for_user(current_user):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    data = request.get_json()
    api_key = APIKey.query.filter_by(user_id=data['user_id']).first()

    if api_key:
        return jsonify({
            'status': 'ERROR',
            'message': 'API key cho tài khoản này đã được tạo ra trước đó!'
        })

    generated_key = str(uuid.uuid4())
    new_api_key = APIKey(generated_key=generated_key, created_at=datetime.datetime.now(
    ), updated_at=datetime.datetime.now(), remaining_calls=data['remaining_calls'], user_id=data['user_id'])

    db.session.add(new_api_key)
    db.session.commit()

    data = {}
    data['api_key'] = generated_key

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Tạo API key mới thành công!',
        'data': data
    })


@app.route('/api/api-keys/<api_key_id>', methods=['PUT'])
@token_required
def renew_api_key(current_user, api_key_id):
    api_key = APIKey.query.filter_by(id=api_key_id).first()
    data = request.get_json()

    if not api_key:
        return jsonify({
            'status': 'ERROR',
            'message': 'API key không hợp lệ!'
        })

    api_key.remaining_calls = int(data['remaining_calls'])
    api_key.updated_at = datetime.datetime.now()

    db.session.commit()

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Cập nhật thông tin của API key thành công!'
    })


@app.route('/api/api-keys/<api_key_id>', methods=['DELETE'])
@token_required
def delete_api_key(current_user, api_key_id):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    api_key = APIKey.query.filter_by(id=api_key_id).first()

    if not api_key:
        return jsonify({
            'status': 'ERROR',
            'message': 'API key không hợp lệ!'
        })

    db.session.delete(api_key)
    db.session.commit()

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Xóa API key thành công!'
    })

# API Calls


@app.route('/api/api-calls', methods=['GET'])
@token_required
def get_all_api_calls(current_user):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    args = request.args
    keyword = None
    page = 1

    if "keyword" in args:
        keyword = args['keyword']

    if "page" in args:
        page = int(args['page'])

    api_calls = APICall.query.order_by(APICall.created_at.desc())
    api_calls_on_page = api_calls.limit(10).offset((page - 1) * 10)
    total_pages = math.ceil(api_calls.count() / 10)
    output = []

    for api_call in api_calls_on_page:
        user = User.query.filter_by(id=api_call.user_id).first()
        api_key = APIKey.query.filter_by(user_id=user.id).first()

        if keyword != None:
            if (keyword in user.name) or (keyword in user.full_name) or (keyword in api_call.document) or (keyword in api_call.result):
                api_call_data = {}
                api_call_data['id'] = api_call.id
                api_call_data['document'] = api_call.document
                api_call_data['created_at'] = api_call.created_at
                api_call_data['result'] = api_call.result
                api_call_data['api_key'] = api_key.generated_key
                api_call_data['user'] = {}
                api_call_data['user']['id'] = user.public_id
                api_call_data['user']['username'] = user.name
                api_call_data['user']['full_name'] = user.full_name

                output.append(api_call_data)
        else:
            api_call_data = {}
            api_call_data['id'] = api_call.id
            api_call_data['document'] = api_call.document
            api_call_data['created_at'] = api_call.created_at
            api_call_data['result'] = api_call.result
            api_call_data['api_key'] = api_key.generated_key
            api_call_data['user'] = {}
            api_call_data['user']['id'] = user.public_id
            api_call_data['user']['username'] = user.name
            api_call_data['user']['full_name'] = user.full_name

            output.append(api_call_data)

    data = {}
    data['api_calls'] = output
    data['total_pages'] = total_pages

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy danh sách tất cả request thành công!',
        'data': data
    })


@app.route('/api/api-calls/users', methods=['GET'])
@token_required
def get_all_user_api_calls(current_user):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    args = request.args
    keyword = None
    page = 1

    if "keyword" in args:
        keyword = args['keyword']

    if "page" in args:
        page = int(args['page'])

    api_calls = APICall.query.order_by(
        APICall.created_at.desc()).filter_by(user_id=current_user.id)
    api_calls_on_page = api_calls.limit(10).offset((page - 1) * 10)
    total_pages = math.ceil(api_calls.count() / 10)
    output = []

    for api_call in api_calls_on_page:
        if keyword != None:
            if (keyword in api_call.document) or (keyword in api_call.result):
                api_call_data = {}
                api_call_data['id'] = api_call.id
                api_call_data['document'] = api_call.document
                api_call_data['created_at'] = api_call.created_at
                api_call_data['result'] = api_call.result

                output.append(api_call_data)
        else:
            api_call_data = {}
            api_call_data['id'] = api_call.id
            api_call_data['document'] = api_call.document
            api_call_data['created_at'] = api_call.created_at
            api_call_data['result'] = api_call.result

            output.append(api_call_data)

    data = {}
    data['api_calls'] = output
    data['total_pages'] = total_pages

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy danh sách tất cả request thành công!',
        'data': data
    })


@app.route('/api/api-calls/<api_call_id>', methods=['GET'])
@token_required
def get_one_api_call(current_user, api_call_id):
    api_call = APICall.query.filter_by(id=api_call_id).first()
    user = User.query.filter_by(id=api_call.user_id).first()
    api_key = APIKey.query.filter_by(user_id=user.id).first()

    if not api_call:
        return jsonify({
            'status': 'ERROR',
            'message': 'Request không tồn tại trong hệ thống!'
        })

    api_call_data = {}
    api_call_data['id'] = api_call.id
    api_call_data['document'] = api_call.document
    api_call_data['created_at'] = api_call.created_at
    api_call_data['result'] = api_call.result
    api_call_data['api_key'] = api_key.generated_key
    api_call_data['user'] = {}
    api_call_data['user']['id'] = user.public_id
    api_call_data['user']['username'] = user.name
    api_call_data['user']['full_name'] = user.full_name

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy thông tin về request thành công!',
        'data': api_call_data
    })


@app.route('/api/demonstrate', methods=['POST'])
def demonstrate():
    data = request.get_json()
    document = data['document']
    predicting_category = predict_category(document)

    data = {}
    data['predicting_category'] = predicting_category

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Dự đoán chủ đề của văn bản thành công!',
        'data': data
    })


@app.route('/api/predict', methods=['POST'])
def create_api_call():
    data = request.get_json()
    user_api_key = data['api_key']
    api_key = APIKey.query.filter_by(generated_key=user_api_key).first()

    if not api_key:
        return jsonify({
            'status': 'ERROR',
            'message': 'API key không hợp lệ!'
        })
    else:
        if api_key.remaining_calls == 0:
            return jsonify({
                'status': 'ERROR',
                'message': 'API key đã hết hạn!'
            })
        else:
            api_key.remaining_calls = api_key.remaining_calls - 1
            document = data['document']

            if len(document.strip()) > 0:
                predicting_category = predict_category(document)

                new_api_call = APICall(document=document, created_at=datetime.datetime.now(
                ), result=predicting_category, user_id=api_key.user_id)

                db.session.add(new_api_call)
                db.session.commit()

                data = {}
                data['predicting_category'] = predicting_category

                return jsonify({
                    'status': 'SUCCESS',
                    'message': 'Dự đoán chủ đề của văn bản thành công!',
                    'data': data
                })
            else:
                errors = {}
                errors['document'] = {}
                errors['document']['name'] = 'Văn bản cần phân loại'
                errors['document']['errors'] = [
                    'Văn bản cần phân loại không được bỏ trống']

                return jsonify({
                    'status': 'ERROR',
                    'message': 'Dự đoán chủ đề của văn bản thất bại!',
                    'errors': errors
                })

# Statistics


@app.route('/api/statistics', methods=['GET'])
@token_required
def get_overview_stats(current_user):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    data = {}
    data['total_users'] = len(User.query.all())
    data['total_api_keys'] = len(APIKey.query.all())
    data['total_api_calls'] = len(APICall.query.all())

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy số liệu thống kê tổng quan thành công!',
        'data': data
    })


@app.route('/api/statistics/users', methods=['GET'])
@token_required
def get_user_statistics(current_user):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    args = request.args
    duration = THIS_WEEK

    if "duration" in args:
        duration = int(args["duration"])

    today = start = end = datetime.date.today()
    difference = 0

    if duration == THIS_WEEK:
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
        difference = 7

    elif duration == THIS_MONTH:
        start = today.replace(day=1)
        end = today.replace(day=calendar.monthrange(
            today.year, today.month)[1])

        difference = (end - start).days + 1

    elif duration == THIS_QUARTER:
        quarter = int((today.month - 1) / 3) + 1
        start = datetime.date(today.year, 3 * quarter - 2, 1)

        month = 3 * quarter
        remaining = int(month / 12)
        end = datetime.date(today.year + remaining, month %
                            12 + 1, 1) + datetime.timedelta(days=-1)

        difference = (end - start).days + 1

    elif duration == THIS_YEAR:
        start = today.replace(month=1, day=1)
        end = today.replace(month=12, day=31)

        difference = (end - start).days + 1

    else:
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)

        difference = 7

    users = User.query.all()
    output = {}

    dates = [start + datetime.timedelta(days=d) for d in range(difference)]
    dates = [str(d) for d in dates]

    for output_date in dates:
        output_date = '/'.join(reversed(output_date.split('-')[1:3]))
        output[output_date] = 0

    for user in users:
        if (user.created_at.date() >= start and user.created_at.date() <= end):
            date_string = user.created_at.strftime("%d/%m")

            if date_string in output:
                output[date_string] += 1
            else:
                output[date_string] = 1

    data = {}
    data['duration'] = {
        'starting_date': '-'.join(reversed(str(start).split('-'))),
        'ending_date': '-'.join(reversed(str(end).split('-'))),
    }
    data['statistics'] = output

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy số liệu thống kê về người dùng thành công!',
        'data': data
    })


@app.route('/api/statistics/api-keys', methods=['GET'])
@token_required
def get_api_keys_statistics(current_user):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    args = request.args
    duration = THIS_WEEK

    if "duration" in args:
        duration = int(args["duration"])

    today = start = end = datetime.date.today()
    difference = 0

    if duration == THIS_WEEK:
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
        difference = 7

    elif duration == THIS_MONTH:
        start = today.replace(day=1)
        end = today.replace(day=calendar.monthrange(
            today.year, today.month)[1])

        difference = (end - start).days + 1

    elif duration == THIS_QUARTER:
        quarter = int((today.month - 1) / 3) + 1
        start = datetime.date(today.year, 3 * quarter - 2, 1)

        month = 3 * quarter
        remaining = int(month / 12)
        end = datetime.date(today.year + remaining, month %
                            12 + 1, 1) + datetime.timedelta(days=-1)

        difference = (end - start).days + 1

    elif duration == THIS_YEAR:
        start = today.replace(month=1, day=1)
        end = today.replace(month=12, day=31)

        difference = (end - start).days + 1

    else:
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)

        difference = 7

    api_keys = APIKey.query.all()
    output = {}

    dates = [start + datetime.timedelta(days=d) for d in range(difference)]
    dates = [str(d) for d in dates]

    for output_date in dates:
        output_date = '/'.join(reversed(output_date.split('-')[1:3]))
        output[output_date] = 0

    for api_key in api_keys:
        if (api_key.created_at.date() >= start and api_key.created_at.date() <= end):
            date_string = api_key.created_at.strftime("%d/%m")

            if date_string in output:
                output[date_string] += 1
            else:
                output[date_string] = 1

    data = {}
    data['duration'] = {
        'starting_date': '-'.join(reversed(str(start).split('-'))),
        'ending_date': '-'.join(reversed(str(end).split('-'))),
    }
    data['statistics'] = output

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy số liệu thống kê về API key thành công!',
        'data': data
    })


@app.route('/api/statistics/api-calls', methods=['GET'])
@token_required
def get_api_calls_statistics(current_user):
    if int(current_user.admin) == 0:
        return jsonify({
            'status': 'ERROR',
            'message': 'Không có quyền truy cập!'
        })

    args = request.args
    duration = THIS_WEEK

    if "duration" in args:
        duration = int(args["duration"])

    today = start = end = datetime.date.today()
    difference = 0

    if duration == THIS_WEEK:
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
        difference = 7

    elif duration == THIS_MONTH:
        start = today.replace(day=1)
        end = today.replace(day=calendar.monthrange(
            today.year, today.month)[1])

        difference = (end - start).days + 1

    elif duration == THIS_QUARTER:
        quarter = int((today.month - 1) / 3) + 1
        start = datetime.date(today.year, 3 * quarter - 2, 1)

        month = 3 * quarter
        remaining = int(month / 12)
        end = datetime.date(today.year + remaining, month %
                            12 + 1, 1) + datetime.timedelta(days=-1)

        difference = (end - start).days + 1

    elif duration == THIS_YEAR:
        start = today.replace(month=1, day=1)
        end = today.replace(month=12, day=31)

        difference = (end - start).days + 1

    else:
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)

        difference = 7

    api_calls = APICall.query.all()
    output = {}

    dates = [start + datetime.timedelta(days=d) for d in range(difference)]
    dates = [str(d) for d in dates]

    for output_date in dates:
        output_date = '/'.join(reversed(output_date.split('-')[1:3]))
        output[output_date] = 0

    for api_call in api_calls:
        if (api_call.created_at.date() >= start and api_call.created_at.date() <= end):
            date_string = api_call.created_at.strftime("%d/%m")

            if date_string in output:
                output[date_string] += 1
            else:
                output[date_string] = 1

    data = {}
    data['duration'] = {
        'starting_date': '-'.join(reversed(str(start).split('-'))),
        'ending_date': '-'.join(reversed(str(end).split('-'))),
    }
    data['statistics'] = output

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy số liệu thống kê về request thành công!',
        'data': data
    })


@app.route('/api/statistics/api-calls/users', methods=['GET'])
@token_required
def get_user_api_calls_statistics(current_user):
    args = request.args
    duration = THIS_WEEK

    if "duration" in args:
        duration = int(args["duration"])

    today = start = end = datetime.date.today()
    difference = 0

    if duration == THIS_WEEK:
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
        difference = 7

    elif duration == THIS_MONTH:
        start = today.replace(day=1)
        end = today.replace(day=calendar.monthrange(
            today.year, today.month)[1])

        difference = (end - start).days + 1

    elif duration == THIS_QUARTER:
        quarter = int((today.month - 1) / 3) + 1
        start = datetime.date(today.year, 3 * quarter - 2, 1)

        month = 3 * quarter
        remaining = int(month / 12)
        end = datetime.date(today.year + remaining, month %
                            12 + 1, 1) + datetime.timedelta(days=-1)

        difference = (end - start).days + 1

    elif duration == THIS_YEAR:
        start = today.replace(month=1, day=1)
        end = today.replace(month=12, day=31)

        difference = (end - start).days + 1

    else:
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)

        difference = 7

    api_calls = APICall.query.filter_by(user_id=current_user.id)
    output = {}

    dates = [start + datetime.timedelta(days=d) for d in range(difference)]
    dates = [str(d) for d in dates]

    for output_date in dates:
        output_date = '/'.join(reversed(output_date.split('-')[1:3]))
        output[output_date] = 0

    for api_call in api_calls:
        if (api_call.created_at.date() >= start and api_call.created_at.date() <= end):
            date_string = api_call.created_at.strftime("%d/%m")

            if date_string in output:
                output[date_string] += 1
            else:
                output[date_string] = 1

    data = {}
    data['duration'] = {
        'starting_date': '-'.join(reversed(str(start).split('-'))),
        'ending_date': '-'.join(reversed(str(end).split('-'))),
    }
    data['statistics'] = output

    return jsonify({
        'status': 'SUCCESS',
        'message': 'Lấy số liệu thống kê về request thành công!',
        'data': data
    })


if __name__ == '__main__':
    app.run(debug=True)
