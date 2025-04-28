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
      <td>
        ${mineral.photo 
          ? `<img src="/uploads/${mineral.photo}" alt="Photo" style="width:50px; height:50px; object-fit:cover;">`
          : "No Image"}
      </td>
    `;

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