// inventory.js — handles fetching and filtering minerals

document.addEventListener("DOMContentLoaded", () => {
    const fetchBtn = document.getElementById("fetch-minerals");
    const nameInput = document.getElementById("search-name");
    const weightInput = document.getElementById("search-weight");
    const tableBody = document.querySelector("#minerals-table tbody");
  
    async function loadMinerals() {
      try {
        const res = await fetch("/minerals");
        const minerals = await res.json();
        renderTable(minerals);
      } catch (err) {
        console.error("Error loading minerals:", err);
      }
    }
  
    function renderTable(minerals) {
      tableBody.innerHTML = "";
      const filteredMinerals = minerals.filter(mineral => {
        const nameMatch = mineral.name.toLowerCase().includes(nameInput.value.toLowerCase());
        const weightMatch = !weightInput.value || parseFloat(mineral.weight) === parseFloat(weightInput.value);
        return nameMatch && weightMatch;
      });
  
      filteredMinerals.forEach(mineral => {
        const row = `<tr>
          <td>${mineral.id}</td>
          <td>${mineral.name}</td>
          <td>$${!isNaN(parseFloat(mineral.price)) ? parseFloat(mineral.price).toFixed(2) : "N/A"}</td>
          <td>${mineral.amount}</td>
          <td>${mineral.weight ? parseFloat(mineral.weight).toFixed(2) : "-"}</td>
          <td>${mineral.photo ? `<img src="${mineral.photo}" width="50">` : "N/A"}</td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteMineral(${mineral.id})">Delete</button></td>
        </tr>`;
        tableBody.insertAdjacentHTML("beforeend", row);
      });
    }
  
    window.deleteMineral = async (id) => {
      try {
        await fetch(`/minerals/${id}`, { method: "DELETE" });
        loadMinerals();
      } catch (err) {
        console.error("Error deleting mineral:", err);
      }
    }
  
    fetchBtn.addEventListener("click", loadMinerals);
    nameInput.addEventListener("input", loadMinerals);
    weightInput.addEventListener("input", loadMinerals);

    loadMinerals(); // Auto-load minerals when the page opens
  });

  