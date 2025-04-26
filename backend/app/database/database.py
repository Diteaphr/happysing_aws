import mysql.connector
import boto3

# ===== 連接 S3 設定 =====
bucket_name = 'pccasepins'  # S3的bucket名字
s3_folder = 'coolermaster_images/'    # 例如 'coolermaster_images/'，最後一定要有/

# S3用預設的 AWS權限認證
s3 = boto3.client('s3')

# ===== 連接 Aurora 資料庫設定 =====
db = mysql.connector.connect(
    host="database-coolermaster.cluster-cvi6i2agwesi.us-west-2.rds.amazonaws.com",   # 你的 cluster endpoint
    user="admin",                  # 你的 master username
    password="happysing",            # 你的密碼
    port=3306
)

print("✅ 成功連線到 Aurora 資料庫！")

cursor = db.cursor()

# 1. 確認使用正確的 database
cursor.execute("CREATE DATABASE IF NOT EXISTS s3images;")
cursor.execute("USE s3images;")

# 2. 建立 images 表格（如果不存在）
cursor.execute("""
CREATE TABLE IF NOT EXISTS images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(512) NOT NULL,
    description TEXT
);
""")
print("✅ 資料表 'images' 已經建立。")

# 3. 從 S3 抓取所有圖片
response = s3.list_objects_v2(Bucket=bucket_name, Prefix=s3_folder)

if 'Contents' not in response:
    print("⚠️ 找不到任何檔案，請確認 S3 資料夾路徑正確！")
else:
    print(f"✅ 找到 {len(response['Contents'])} 個檔案，開始同步...")

    for obj in response['Contents']:
        key = obj['Key']
        if key.endswith('/'):
            continue  # 忽略資料夾本身

        # 組成公開圖片網址
        image_url = f"https://{bucket_name}.s3.amazonaws.com/{key}"

        # 敘述可以用檔名自動產生（你也可以之後讀metadata或其他json）
        description = key.split('/')[-1].split('.')[0]  # 用檔名（去掉副檔名）

        # 寫進資料庫
        cursor.execute(
            "INSERT INTO images (image_url, description) VALUES (%s, %s)",
            (image_url, description)
        )

    db.commit()
    print(f"✅ 成功同步 {len(response['Contents'])} 張圖片到資料庫！")

# 4. 關閉連線
cursor.close()
db.close()
print("✅ 關閉連線，全部完成！")
