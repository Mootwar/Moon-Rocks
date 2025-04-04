"""
analyze_model.py — Evaluate MobileNetV2 model on test set with confusion matrix and misclassified image visualization.
"""

import os
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.datasets as datasets
import torchvision.models as models
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report
import numpy as np

# === CONFIG ===
MODEL_PATH = 'mobilenetv2_rock_classifier_68_12.pth'
TEST_DIR = 'test/'
IMG_SIZE = 224
BATCH_SIZE = 16
NUM_CLASSES = 9  # change this to your actual number of classes
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# === TRANSFORMS ===
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],  # ImageNet mean
                         [0.229, 0.224, 0.225])  # ImageNet std
])

# === LOAD DATA ===
test_dataset = datasets.ImageFolder(TEST_DIR, transform=transform)
test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)
class_names = test_dataset.classes

# === DEFINE MODEL ===
model = models.mobilenet_v2(pretrained=False)
model.classifier[1] = nn.Linear(model.last_channel, NUM_CLASSES)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

# === PREDICTIONS ===
y_true = []
y_pred = []

with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(DEVICE)
        outputs = model(images)
        _, preds = torch.max(outputs, 1)
        y_true.extend(labels.numpy())
        y_pred.extend(preds.cpu().numpy())

# === CONFUSION MATRIX ===
cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', xticklabels=class_names, yticklabels=class_names, cmap='Blues')
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
plt.show()

# === CLASSIFICATION REPORT ===
print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=class_names))

# === SHOW MISCLASSIFIED IMAGES ===
print("\nMisclassified images:")
misclassified_indices = [i for i, (t, p) in enumerate(zip(y_true, y_pred)) if t != p]

for idx in misclassified_indices[:5]:  # Show first 5 misclassified
    image_path, true_label = test_dataset.samples[idx]
    img = plt.imread(image_path)
    plt.imshow(img)
    plt.title(f"True: {class_names[true_label]} | Predicted: {class_names[y_pred[idx]]}")
    plt.axis('off')
    plt.show()
