from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)  # 允許跨域

DB_CONFIG = {
    "host": "database-coolermaster.cluster-cvi6i2agwesi.us-west-2.rds.amazonaws.com",
    "user": "admin",
    "password": "happysing",
    "port": 3306,
    "database": "s3images"
}

def fetch_images_from_database():
    """從資料庫抓取所有圖片資料"""
    db = mysql.connector.connect(**DB_CONFIG)
    cursor = db.cursor()
    cursor.execute("SELECT image_url, description FROM images;")
    rows = cursor.fetchall()
    cursor.close()
    db.close()

    images = [{'url': url, 'description': desc} for url, desc in rows]
    return images

@app.route('/api/images', methods=['GET'])
def get_images():
    """API：讀取所有圖片"""
    images = fetch_images_from_database()
    return jsonify(images)

# 儲存圖片
@app.route('/api/save_favorite', methods=['POST'])
def save_favorite():
    data = request.get_json()
    image_url = data['image_url']
    description = data.get('description', '')

    db = mysql.connector.connect(**DB_CONFIG)
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO images (image_url, description)
        VALUES (%s, %s)
    """, (image_url, description))
    db.commit()
    cursor.close()
    db.close()

    return jsonify({'message': 'Image saved successfully'})

# 刪除圖片
@app.route('/api/delete_favorite', methods=['POST'])
def delete_favorite():
    data = request.get_json()
    image_url = data['image_url']

    db = mysql.connector.connect(**DB_CONFIG)
    cursor = db.cursor()
    cursor.execute("""
        DELETE FROM images WHERE image_url = %s
    """, (image_url,))
    db.commit()
    cursor.close()
    db.close()

    return jsonify({'message': 'Image deleted successfully'})


if __name__ == '__main__':
    # 啟動 server 前，列出所有圖片資料
    print("📦 正在連接資料庫...")
    images = fetch_images_from_database()
    for idx, img in enumerate(images, 1):
        print(f"{idx}. 圖片URL: {img['url']}, 描述: {img['description']}")

    print("✅ 資料庫圖片列印完畢，啟動 Flask 伺服器！")
    app.run(host='127.0.0.1', port=5000)
