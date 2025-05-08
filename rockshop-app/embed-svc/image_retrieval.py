import os
import json
import sqlite3
import argparse
from PIL import Image
import torch
from torchvision import models, transforms
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
from tabulate import tabulate

# ── Model & Preprocessing ─────────────────────────────────────────────────────
_model = models.mobilenet_v2(weights="IMAGENET1K_V1")
_model.classifier = torch.nn.Identity()
_model.eval()

_preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

def extract_features(image_path: str) -> list[float]:
    img = Image.open(image_path).convert("RGB")
    tensor = _preprocess(img).unsqueeze(0)
    with torch.no_grad():
        return _model(tensor).squeeze().tolist()

# ── DB Setup ───────────────────────────────────────────────────────────────────
DB_PATH = os.getenv("EMBED_DB", "product_embeddings.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    # enable foreign‐keys for ON DELETE CASCADE to work
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def create_database():
    """Idempotently create products + images tables in SQLite."""
    ddl_products = """
    CREATE TABLE IF NOT EXISTS products (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      name   TEXT    NOT NULL,
      price  REAL    NOT NULL,
      amount INTEGER NOT NULL
    );
    """
    ddl_images = """
    CREATE TABLE IF NOT EXISTS images (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id  INTEGER NOT NULL
        REFERENCES products(id) ON DELETE CASCADE,
      image_path  TEXT    NOT NULL,
      embedding   TEXT    NOT NULL    -- JSON serialized list of floats
    );
    """

    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(ddl_products)
        cur.execute(ddl_images)
        conn.commit()

# ── CRUD Operations ───────────────────────────────────────────────────────────
def insert_product(name: str, price: float, amount: int, image_paths: list[str]):
    """Insert product and its first image embeddings."""
    create_database()  # ensure tables exist
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO products (name,price,amount) VALUES (?,?,?)",
            (name, price, amount)
        )
        pid = cur.lastrowid

        for img in image_paths:
            emb = extract_features(img)
            cur.execute(
                "INSERT INTO images (product_id,image_path,embedding) VALUES (?,?,?)",
                (pid, img, json.dumps(emb))
            )
        conn.commit()

def add_images_to_product(product_id: int, image_paths: list[str]):
    """Attach more embeddings to an existing product."""
    create_database()
    with get_conn() as conn:
        cur = conn.cursor()
        for img in image_paths:
            emb = extract_features(img)
            cur.execute(
                "INSERT INTO images (product_id,image_path,embedding) VALUES (?,?,?)",
                (product_id, img, json.dumps(emb))
            )
        conn.commit()

def find_best_match(query_image: str, top_k: int = 3):
    """Prints the top‐k matches by cosine & Euclid."""
    create_database()
    qemb = extract_features(query_image)
    qvec = [qemb]

    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("""
          SELECT p.id, p.name, p.price, p.amount, i.image_path, i.embedding
          FROM products p
          JOIN images   i ON i.product_id = p.id
        """)
        rows = cur.fetchall()

    cos_scores = []
    euc_scores = []
    for pid, name, price, amount, path, emb_json in rows:
        emb = json.loads(emb_json)
        cos = cosine_similarity([emb], qvec)[0][0]
        euc = euclidean_distances([emb], qvec)[0][0]
        cos_scores.append((pid, name, price, amount, path, cos))
        euc_scores.append((pid, name, price, amount, path, euc))

    cos_scores.sort(key=lambda x: -x[5])
    euc_scores.sort(key=lambda x:  x[5])

    # Display
    best_cos = cos_scores[0]
    best_euc = euc_scores[0]
    print(f"\n🔍 Best Cosine : {best_cos[1]} (Score: {best_cos[5]:.4f})")
    print(f"🔍 Best Euclid : {best_euc[1]} (Dist:  {best_euc[5]:.4f})")

    print("\n📋 Top 3 Cosine:")
    print(tabulate([(x[1], x[5]) for x in cos_scores[:top_k]], headers=["Name","Cosine"]))
    print("\n📋 Top 3 Euclid:")
    print(tabulate([(x[1], x[5]) for x in euc_scores[:top_k]], headers=["Name","Euclid"]))

# ── CLI ────────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser("Image Retrieval (SQLite)")
    parser.add_argument("action", choices=["add","add_images","query"])
    parser.add_argument("--name", help="Product name (for add)")
    parser.add_argument("--price", type=float, help="Price (for add)")
    parser.add_argument("--amount",type=int,   help="Stock (for add)")
    parser.add_argument("--images", nargs="+", help="Image path(s)")
    parser.add_argument("--product_id", type=int, help="Product ID (for add_images)")
    parser.add_argument("--query",      help="Query image path")

    args = parser.parse_args()
    if args.action == "add":
        if not all([args.name, args.price, args.amount, args.images]):
            parser.error("add requires --name, --price, --amount, --images")
        insert_product(args.name, args.price, args.amount, args.images)

    elif args.action == "add_images":
        if not (args.product_id and args.images):
            parser.error("add_images requires --product_id, --images")
        add_images_to_product(args.product_id, args.images)

    else:  # query
        if not args.query:
            parser.error("query requires --query")
        find_best_match(args.query)

if __name__ == "__main__":
    main()
