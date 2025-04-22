import torch
import pickle
import pandas as pd
from PIL import Image
from torchvision import models, transforms
from sklearn.metrics.pairwise import cosine_similarity

# === Step 1: Load the CNN model (MobileNetV2 without classifier) ===
model = models.mobilenet_v2(weights='IMAGENET1K_V1')
model.classifier = torch.nn.Identity()
model.eval()

# === Step 2: Define a preprocessing pipeline ===
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

def extract_features(image_path: str) -> torch.Tensor:
    """Convert image to 1280-dimensional feature vector."""
    image = Image.open(image_path).convert('RGB')
    input_tensor = preprocess(image).unsqueeze(0)
    with torch.no_grad():
        features = model(input_tensor)
    return features.squeeze().numpy()

# === Step 3: Index the database ===
def build_index(csv_path: str, output_index_path: str = "image_index.pkl"):
    df = pd.read_csv(csv_path)  # Must contain: id, name, price, image_path
    index = []
    for _, row in df.iterrows():
        try:
            vec = extract_features(row["image_path"])
            index.append((row["id"], row["name"], row["price"], vec))
        except Exception as e:
            print(f"Error processing {row['image_path']}: {e}")
    with open(output_index_path, "wb") as f:
        pickle.dump(index, f)
    print(f"✅ Indexed {len(index)} images.")

# === Step 4: Query image similarity ===
def find_best_match(query_image: str, index_path: str = "image_index.pkl"):
    with open(index_path, "rb") as f:
        index = pickle.load(f)
    query_vec = extract_features(query_image).reshape(1, -1)

    best_score = -1
    best_item = None

    for item_id, name, price, vec in index:
        score = cosine_similarity(query_vec, vec.reshape(1, -1))[0][0]
        if score > best_score:
            best_score = score
            best_item = (item_id, name, price, score)

    if best_item:
        print(f"🔍 Best Match: ID={best_item[0]}, Name={best_item[1]}, Price=${best_item[2]}")
        print(f"   Cosine Similarity: {best_item[3]:.4f}")
    else:
        print("❌ No match found.")

# === Step 5: Use it ===
if __name__ == "__main__":
    import sys

    # Example usage:
    # python image_matcher.py index database.csv
    # python image_matcher.py query query.jpg

    if len(sys.argv) < 3:
        print("Usage:")
        print("  python image_matcher.py index database.csv")
        print("  python image_matcher.py query query.jpg")
    elif sys.argv[1] == "index":
        build_index(sys.argv[2])
    elif sys.argv[1] == "query":
        find_best_match(sys.argv[2])
