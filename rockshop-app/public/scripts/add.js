// add.js — handles form submission for adding a new mineral

// public/scripts/add.js
document
  .getElementById("add-mineral-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;                     // the <form> element
    const data = new FormData(form);           // auto-collects all inputs + file

    const res = await fetch("/minerals", {
      method: "POST",
      body: data,                              // multipart/form-data
    });

    if (res.ok) {
      alert("Mineral added!");
      form.reset();
    } else {
      const text = await res.text();
      alert("Error adding mineral: " + text);
    }
  });
