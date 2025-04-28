/* ---------- cached DOM refs ---------- */
const galleryModal  = new bootstrap.Modal(document.getElementById('galleryModal'));
const galleryGrid   = document.getElementById('galleryGrid');
const uploadForm    = document.getElementById('imageUploadForm');
const tbody         = document.querySelector('#minerals-table tbody');
const addMineralForm = document.getElementById('add-mineral-form');

let currentMineralId = null;   // remembers which mineral is open

/* ---------- fetch & render mineral list ---------- */
async function loadMinerals() {
  const res  = await fetch('/api/minerals');  // your API should serve minerals
  const list = await res.json();

  tbody.innerHTML = '';
  list.forEach(mineral => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${mineral.id}</td>
      <td>${mineral.name}</td>
      <td>${mineral.price}</td>
      <td>${mineral.amount}</td>
      <td>
        <button class="btn btn-sm btn-secondary btn-gallery"
                data-id="${mineral.id}" data-name="${mineral.name}">
          View
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------- open gallery modal ---------- */
document.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('btn-gallery')) return;

  currentMineralId = e.target.dataset.id;
  document.getElementById('galleryModalLabel').textContent =
        `Images for ${e.target.dataset.name}`;

  await refreshGallery();
  galleryModal.show();
});

/* ---------- upload new photo ---------- */
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentMineralId) return;

  const fd = new FormData(uploadForm);
  const res = await fetch(`/api/minerals/${currentMineralId}/images`, {
    method: 'POST',
    body: fd
  });

  if (!res.ok) {
    alert('Upload failed');
    return;
  }

  uploadForm.reset();
  await refreshGallery();  // show new thumbnail immediately
});

/* ---------- fill the image grid ---------- */
async function refreshGallery() {
  galleryGrid.innerHTML = '';

  const res   = await fetch(`/api/minerals/${currentMineralId}`);
  const mineral = await res.json(); // expects { images: [ {image_path: ...} ] }

  if (!mineral.images?.length) {
    galleryGrid.innerHTML = '<p class="text-muted">No photos yet. Upload one above.</p>';
    return;
  }

  mineral.images.forEach(img => {
    const col = document.createElement('div');
    col.className = 'col-4 col-md-3';
    col.innerHTML = `
      <img src="/${img.image_path}" class="img-fluid rounded shadow-sm"
           style="object-fit:cover;height:120px;width:100%">
    `;
    galleryGrid.appendChild(col);
  });
}

/* ---------- add new mineral ---------- */
addMineralForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('name', document.getElementById('mineralName').value);
  formData.append('price', document.getElementById('mineralPrice').value);
  formData.append('amount', document.getElementById('mineralAmount').value);

  const imageInput = document.getElementById('mineralImage');
  if (imageInput && imageInput.files.length > 0) {
    formData.append('photo', imageInput.files[0]);
  }

  const res = await fetch('/api/minerals', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    alert('Failed to add mineral.');
    return;
  }

  addMineralForm.reset();
  await loadMinerals(); // reload the table after new mineral
});

/* ---------- hook Load Minerals button ---------- */
document.getElementById('fetch-minerals').addEventListener('click', loadMinerals);