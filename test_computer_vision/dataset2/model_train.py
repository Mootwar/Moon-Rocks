"""
Train a MobileNetV2 model for rock image classification using preprocessed JPEG images.
"""

import os
import torch
import torch.nn as nn
from torchvision import datasets, models, transforms
from torchvision.models import MobileNet_V2_Weights
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score
from tqdm import tqdm

# Config
BATCH_SIZE = 32
NUM_EPOCHS = 20
LEARNING_RATE = 1e-3
IMAGE_SIZE = 224  # MobileNetV2 default input size change later to 640
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TRAIN_DIR = "train"
TEST_DIR = "test"

# Transforms
transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

# Datasets
train_dataset = datasets.ImageFolder(TRAIN_DIR, transform=transform)
test_dataset = datasets.ImageFolder(TEST_DIR, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)

# Model setup
model = models.mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)
num_classes = len(train_dataset.classes)
model.classifier[1] = nn.Linear(model.last_channel, num_classes)
model = model.to(DEVICE)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

# Training loop
best_acc = 0.0
for epoch in range(NUM_EPOCHS):
    model.train()
    running_loss = 0.0
    for inputs, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{NUM_EPOCHS}"):
        inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()

    # Evaluation
    model.eval()
    y_true, y_pred = [], []
    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            y_true.extend(labels.cpu().numpy())
            y_pred.extend(preds.cpu().numpy())

    acc = accuracy_score(y_true, y_pred)
    print(f"Epoch {epoch+1}: Loss={running_loss/len(train_loader):.4f} | Test Accuracy={acc:.4f}")

    # Save best model
    if acc > best_acc:
        best_acc = acc
        torch.save(model.state_dict(), "mobilenetv2_rock_classifier.pth")

print(f"Training complete. Best test accuracy: {best_acc:.4f}")
