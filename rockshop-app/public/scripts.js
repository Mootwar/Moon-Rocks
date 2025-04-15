// Basic front-end code to fetch minerals, display them, and add new ones
document.addEventListener('DOMContentLoaded', () => {
    const fetchButton = document.getElementById('fetch-minerals');
    const tableBody = document.querySelector('#minerals-table tbody');
    const addForm = document.getElementById('add-mineral-form');
  
    // Fetch minerals and display in table
    fetchButton.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/minerals');
        const minerals = await response.json();
  
        // Clear existing rows
        tableBody.innerHTML = '';
  
        // Populate table
        minerals.forEach(min => {
          const row = document.createElement('tr');
  
          row.innerHTML = `
            <td>${min.id}</td>
            <td>${min.name}</td>
            <td>${min.mineral_type || ''}</td>
            <td>${min.cost}</td>
            <td>${min.weight}</td>
            <td>${min.location || ''}</td>
            <td>${min.description || ''}</td>
            <td>${min.quantity_in_stock}</td>
          `;
          tableBody.appendChild(row);
        });
  
      } catch (err) {
        console.error('Error fetching minerals:', err);
      }
    });
  
    // Handle add mineral form
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
    
      const newMineral = {
        name: document.getElementById('mineralName').value,
        mineral_type: document.getElementById('mineralType').value,
        cost: parseFloat(document.getElementById('mineralCost').value || 0),
        weight: parseFloat(document.getElementById('mineralWeight').value || 0),
        location: document.getElementById('mineralLocation').value,
        description: document.getElementById('mineralDesc').value,
        quantity_in_stock: parseInt(document.getElementById('mineralQty').value, 10) || 0
      };
    
      try {
        const response = await fetch('/api/minerals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMineral),
        });
    
        if (!response.ok) throw new Error('Failed to add mineral');
    
        const createdMineral = await response.json();
        console.log('Mineral added:', createdMineral);
    
        // (Optional) Reload the table
        document.getElementById('fetch-minerals').click();
        addForm.reset();
      } catch (err) {
        console.error('Error adding mineral:', err);
      }
    });    
  });
  