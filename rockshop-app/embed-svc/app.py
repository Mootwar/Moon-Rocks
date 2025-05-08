from flask import Flask, request, jsonify
import sqlite3, json
from image_retrieval import (
    create_database,
    insert_product,      # renamed from your old insert_product(...)
    find_best_match,
    extract_features
)

DB_PATH = "/usr/src/app/embeddings.db"  # or wherever you mount it

app = Flask(__name__)

@app.route("/init-db", methods=["POST"])
def init_db():
    create_database(DB_PATH)
    return ("OK", 201)

@app.route("/add-product", methods=["POST"])
def add_product():
    payload = request.json
    insert_product(
      name=payload["name"],
      price=payload["price"],
      amount=payload["amount"],
      image_path=payload["image_path"],
      db_path=DB_PATH
    )
    return ("Created", 201)

@app.route("/add-embedding", methods=["POST"])
def add_embedding():
    data = request.get_json()
    product_id = data["product_id"]
    img_path   = data["image_path"]
    # 1) extract vector
    emb = extract_features(img_path)   # from your model in image_retrieval.py
    # 2) insert into embeddings table
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
      "INSERT INTO embeddings(product_id, embedding) VALUES (?, ?)",
      (product_id, json.dumps(emb))
    )
    conn.commit()
    conn.close()
    return ("OK", 201)

@app.route('/query', methods=['POST'])
def query():
    # 1) read file from form
    file = request.files.get('image')
    if not file:
        return "No image uploaded", 400

    # 2) save it temporarily
    tmp_path = f"/tmp/{file.filename}"
    file.save(tmp_path)

    # 3) compute matches
    matches = find_best_match(tmp_path)  
    #    modify find_best_match to return a list of dicts, not print()

    return jsonify(matches)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
