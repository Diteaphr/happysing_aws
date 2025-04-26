from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)  # 允許跨域

def fetch_images_from_database():
    """從資料庫抓取所有圖片資料"""
    db = mysql.connector.connect(
        host="database-coolermaster.cluster-cvi6i2agwesi.us-west-2.rds.amazonaws.com",
        user="admin",
        password="happysing",
        port=3306,
        database="s3images"
    )
    cursor = db.cursor()
    cursor.execute("SELECT image_url, description FROM images;")
    rows = cursor.fetchall()
    cursor.close()
    db.close()

    images = [{'url': url, 'description': desc} for url, desc in rows]
    return images

@app.route('/api/images')
def get_images():
    """API：給前端讀取圖片"""
    images = fetch_images_from_database()
    return jsonify(images)

if __name__ == '__main__':
    # 啟動 server 前，列出所有圖片資料
    print("📦 取得資料庫資料中...")
    images = fetch_images_from_database()
    for idx, img in enumerate(images, 1):
        print(f"{idx}. 圖片URL: {img['url']}, 描述: {img['description']}")

    print("✅ 資料庫圖片列印完畢，啟動 Flask 伺服器！")
    app.run(host='127.0.0.1', port=5000)
