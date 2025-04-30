document.getElementById("fetch-minerals").addEventListener("click", loadMinerals);
document.getElementById("add-mineral-form").addEventListener("submit", addMineral);

async function loadMinerals() {
  try {
    const response = await fetch("/minerals");
    const minerals = await response.json();
    displayMinerals(minerals);
  } catch (error) {
    console.error("Failed to load minerals:", error);
  }
}

function displayMinerals(minerals) {
  const tableBody = document.querySelector("#minerals-table tbody");
  tableBody.innerHTML = "";

  minerals.forEach(mineral => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${mineral.id}</td>
      <td>${mineral.name}</td>
      <td>$${parseFloat(mineral.price).toFixed(2)}</td>
      <td>${mineral.amount}</td>
      <td>${mineral.weight}</td>
      <td><img src="/uploads/${mineral.photo}" alt="${mineral.name}" width="100"></td>
    `;

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('btn', 'btn-sm', 'btn-warning');
    editBtn.onclick = () => handleEdit(mineral);

    const btnCell = document.createElement('td');
    btnCell.appendChild(editBtn);
    row.appendChild(btnCell);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('btn', 'btn-sm', 'btn-danger', 'ms-1');
    deleteBtn.onclick = () => handleDelete(mineral.id);

    btnCell.appendChild(deleteBtn);

    tableBody.appendChild(row);
  });
}

async function addMineral(event) {
  event.preventDefault();

  const form = document.getElementById("add-mineral-form");
  const formData = new FormData(form);

  try {
    const response = await fetch("/minerals", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      alert("Mineral added successfully!");
      form.reset();
      loadMinerals();
    } else {
      alert("Failed to add mineral.");
    }
  } catch (error) {
    console.error("Error adding mineral:", error);
    alert("Failed to add mineral.");
  }
}

function handleEdit(mineral) {
  const newPrice = prompt(`Enter new price for ${mineral.name}:`, mineral.price);
  const newAmount = prompt(`Enter new amount for ${mineral.name}:`, mineral.amount);

  if (newPrice !== null && newAmount !== null) {
    fetch(`/api/minerals/${mineral.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: parseFloat(newPrice), amount: parseInt(newAmount) })
    })
    .then(response => response.json())
    .then(updated => {
      alert(`Updated ${updated.name}`);
      loadMinerals(); // Refresh the table
    })
    .catch(err => {
      console.error('Error updating mineral:', err);
      alert('Update failed');
    });
  }
}

function handleDelete(id) {
  if (confirm('Are you sure you want to delete this mineral?')) {
    fetch(`/api/minerals/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        loadMinerals(); // Refresh table
      } else {
        alert('Delete failed');
      }
    })
    .catch(err => {
      console.error('Error deleting mineral:', err);
      alert('Delete failed');
    });
  }
}