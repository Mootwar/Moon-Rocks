from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
from io import BytesIO
import torch
from torchvision import models, transforms

app = FastAPI(title="Embedding-Service")

# MobileNet-V2 backbone
model = models.mobilenet_v2(weights='IMAGENET1K_V1')
model.classifier = torch.nn.Identity()
model.eval()

pre = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

@torch.no_grad()
def get_vec(img_bytes: bytes):
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    tensor = pre(img).unsqueeze(0)
    vec = model(tensor).squeeze().tolist()
    return vec             # 1280 floats

@app.post("/embed")
async def embed(file: UploadFile = File(...)):
    vec = get_vec(await file.read())
    return JSONResponse({"embedding": vec})