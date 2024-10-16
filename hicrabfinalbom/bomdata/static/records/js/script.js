document.addEventListener('DOMContentLoaded', function () {
    const bomSelect = document.getElementById('bom-select');
    const itemDetailsDiv = document.getElementById('item-details');
    const componentButtonsContainer = document.getElementById('component-buttons-container');
    const displayedComponents = new Set();

    const makeChoices = [
        "------", "Pusher", "Cumi", "Cumi (Premier)", "Dimond", "Fenner", "Emarco", "Nu Tech", "Lovejoy",
        "Audco", "NTN", "Raicer", "Legris", "Delta", "Vanaz", "Avcon", "IEPL", "Champion Coolers",
        "Jhonson", "Auro", "Bharat Bijlee", "Rossi", "SMC", "EP", "HICARB", "NILL", "Indan"
    ];

    bomSelect.addEventListener('change', function () {
        const bomId = this.value;

        if (bomId === "") {
            itemDetailsDiv.innerHTML = "";
            componentButtonsContainer.innerHTML = "";
            displayedComponents.clear();
            return;
        }

        fetch(`/api/get_bom_details/${bomId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (Array.isArray(data.components) && data.components.length > 0) {
                        componentButtonsContainer.innerHTML = '';

                        data.components.forEach(component => {
                            let button = document.createElement('button');
                            button.classList.add('btn', 'btn-primary', 'm-2');
                            button.textContent = component.name;
                            button.addEventListener('click', function () {
                                displayComponentDetails(component);
                            });
                            componentButtonsContainer.appendChild(button);
                        });

                        itemDetailsDiv.innerHTML = `
                            <div class="card bg-secondary text-white mt-4">
                                <div class="card-body">
                                    <h3 class="card-title">BOM: ${data.bom.name}</h3>
                                    <div class="mb-3">
                                        <a href="/edit-bom/${data.bom.id}/" class="btn btn-warning btn-sm">Edit BOM</a>
                                        <a href="/delete-bom/${data.bom.id}/" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure you want to delete this BOM?');">Delete BOM</a>
                                    </div>
                                    <h4 class="mt-3">Components:</h4>
                                    <div id="component-buttons-container"></div>
                                </div>
                            </div>
                        `;
                    } else {
                        itemDetailsDiv.innerHTML = "<div class='alert alert-warning'>No components found for the selected BOM.</div>";
                        componentButtonsContainer.innerHTML = "";
                    }
                } else {
                    itemDetailsDiv.innerHTML = "<div class='alert alert-danger'>No details found for the selected BOM.</div>";
                    componentButtonsContainer.innerHTML = "";
                }
            })
            .catch(error => {
                console.error("Error fetching details:", error);
                itemDetailsDiv.innerHTML = "<div class='alert alert-danger'>Error loading details. Please try again later.</div>";
            });
    });

    function displayComponentDetails(component) {
        if (displayedComponents.has(component.name)) {
            return;
        }

        displayedComponents.add(component.name);

        const detailsHtml = `
            <div class="card bg-secondary text-white mt-4">
                <div class="card-body">
                    <h4 class="card-title">Component: ${component.name}</h4>
                    <div id="purpose-buttons-container"></div>
                    <table class="table table-bordered table-hover table-light mt-3">
                        <thead class="table-dark">
                            <tr>
                                <th>S No</th>
                                <th>Specification</th>
                                <th>Make</th>
                                <th>Purpose</th>
                                <th>Quality</th>
                                <th>Rate</th>
                                <th>Price</th>
                                <th>Total</th>
                                <th class="no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="specification-rows">
                            ${component.specifications.map((spec, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${spec.specification || 'N/A'}</td>
                                <td>${getMakeDropdown(spec.make)}</td>
                                <td>${spec.purpose || 'N/A'}</td>
                                <td>${spec.quality || 'N/A'}</td>
                                <td>${spec.rate || 'N/A'}</td>
                                <td>${spec.price || 'N/A'}</td>
                                <td>${spec.total || 'N/A'}</td>
                                <td class="no-print">
                                    <a href="/edit-specification/${spec.id}/" class="btn btn-warning btn-sm">Edit</a>
                                    <a href="/delete-specification/${spec.id}/" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure you want to delete this specification?');">Delete</a>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        itemDetailsDiv.innerHTML += detailsHtml;

        const purposeContainer = document.getElementById('purpose-buttons-container');
        const uniquePurposes = new Set(component.specifications.map(spec => spec.purpose));

        uniquePurposes.forEach(purpose => {
            let purposeButton = document.createElement('button');
            purposeButton.classList.add('btn', 'btn-info', 'm-2');
            purposeButton.textContent = purpose;
            purposeButton.addEventListener('click', function () {
                displayPurposeData(component, purpose);
            });
            purposeContainer.appendChild(purposeButton);
        });
    }

    function displayPurposeData(component, selectedPurpose) {
        const filteredSpecifications = component.specifications.filter(spec => spec.purpose === selectedPurpose);

        const specificationRows = document.getElementById('specification-rows');
        specificationRows.innerHTML = filteredSpecifications.map((spec, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${spec.specification || 'N/A'}</td>
                <td>${getMakeDropdown(spec.make)}</td>
                <td>${spec.purpose || 'N/A'}</td>
                <td>${spec.quality || 'N/A'}</td>
                <td>${spec.rate || 'N/A'}</td>
                <td>${spec.price || 'N/A'}</td>
                <td>${spec.total || 'N/A'}</td>
                <td class="no-print">
                    <a href="/edit-specification/${spec.id}/" class="btn btn-warning btn-sm">Edit</a>
                    <a href="/delete-specification/${spec.id}/" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure you want to delete this specification?');">Delete</a>
                </td>
            </tr>
        `).join('');
    }

    function getMakeDropdown(selectedMake) {
        return `
            <select class="form-select">
                <option value="">Select Make</option>
                ${makeChoices.map(make => `
                    <option value="${make}" ${make === selectedMake ? 'selected' : ''}>${make}</option>
                `).join('')}
            </select>
        `;
    }

    function printComponent(componentHTML) {
        const printWindow = window.open('', '', 'width=1200,height=1000');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Component</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        table, th, td { border: 1px solid black; padding: 5px; }
                        th { background-color: #f2f2f2; }
                        .no-print { display: none !important; }
                    </style>
                </head>
                <body>
                    ${componentHTML}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = function () {
            printWindow.print();
            setTimeout(function () {
                printWindow.close();
            }, 1000);
        };
    }
});













document.addEventListener('DOMContentLoaded', function () {
    const bomSelect = document.getElementById('bom-select');
    const itemDetailsDiv = document.getElementById('item-details');
    const componentButtonsContainer = document.getElementById('component-buttons-container'); // New container for buttons
    const displayedComponents = new Set(); // To track displayed components

    // List of make choices
    const makeChoices = [
        "------", "Pusher", "Cumi", "Cumi (Premier)", "Dimond", "Fenner", "Emarco", "Nu Tech", "Lovejoy",
        "Audco", "NTN", "Raicer", "Legris", "Delta", "Vanaz", "Avcon", "IEPL", "Champion Coolers",
        "Jhonson", "Auro", "Bharat Bijlee", "Rossi", "SMC", "EP", "HICARB", "NILL", "Indan"
    ];

    bomSelect.addEventListener('change', function () {
        const bomId = this.value;

        if (bomId === "") {
            itemDetailsDiv.innerHTML = "";
            componentButtonsContainer.innerHTML = ""; // Clear buttons if no BOM selected
            displayedComponents.clear(); // Clear displayed components set
            return;
        }

        // Fetch BOM details when a BOM is selected
        fetch(`/api/get_bom_details/${bomId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (Array.isArray(data.components) && data.components.length > 0) {
                        // Clear previous buttons
                        componentButtonsContainer.innerHTML = '';

                        // Create a button for each component
                        data.components.forEach(component => {
                            let button = document.createElement('button');
                            button.classList.add('btn', 'btn-primary', 'm-2');
                            button.textContent = component.name;
                            button.addEventListener('click', function () {
                                displayComponentDetails(component);
                            });
                            componentButtonsContainer.appendChild(button);
                        });

                        // Render the BOM details as a card
                        itemDetailsDiv.innerHTML = `
                            <div class="card bg-secondary text-white mt-4">
                                <div class="card-body">
                                    <h3 class="card-title">BOM: ${data.bom.name}</h3>
                                    <div class="mb-3">
                                        <a href="/edit-bom/${data.bom.id}/" class="btn btn-warning btn-sm">Edit BOM</a>
                                        <a href="/delete-bom/${data.bom.id}/" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure you want to delete this BOM?');">Delete BOM</a>
                                    </div>
                                    <h4 class="mt-3">Components:</h4>
                                    <div id="component-buttons-container"></div> <!-- Container for component buttons -->
                                </div>
                            </div>
                        `;
                    } else {
                        itemDetailsDiv.innerHTML = "<div class='alert alert-warning'>No components found for the selected BOM.</div>";
                        componentButtonsContainer.innerHTML = ""; // Clear buttons if no components
                    }
                } else {
                    itemDetailsDiv.innerHTML = "<div class='alert alert-danger'>No details found for the selected BOM.</div>";
                    componentButtonsContainer.innerHTML = ""; // Clear buttons if error
                }
            })
            .catch(error => {
                console.error("Error fetching details:", error);
                itemDetailsDiv.innerHTML = "<div class='alert alert-danger'>Error loading details. Please try again later.</div>";
            });
    });

    // Function to display component details when button is clicked
    function displayComponentDetails(component) {
        // Check if the component is already displayed
        if (displayedComponents.has(component.name)) {
            return; // Do not display again
        }

        displayedComponents.add(component.name); // Add to the set to track displayed components

        const detailsHtml = `
            <div class="card bg-secondary text-white mt-4">
                <div class="card-body">
                    <h4 class="card-title">Component: ${component.name}</h4>
                    <table class="table table-bordered table-hover table-light mt-3">
                        <thead class="table-dark">
                            <tr>
                                <th>S No</th>
                                <th>Specification</th>
                                <th>Make</th>
                                <th>Purpose</th>
                                <th>Quality</th>
                                <th>Rate</th>
                                <th>Price</th>
                                <th>Total</th>
                                <th class="no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${component.specifications.map((spec, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${spec.specification || 'N/A'}</td>
                                <td>${getMakeDropdown(spec.make)}</td> <!-- Dynamic Make Dropdown -->
                                <td>${spec.purpose || 'N/A'}</td>
                                <td>${spec.quality || 'N/A'}</td>
                                <td>${spec.rate || 'N/A'}</td>
                                <td>${spec.price || 'N/A'}</td>
                                <td>${spec.total || 'N/A'}</td>
                                <td class="no-print">
                                    <a href="/edit-specification/${spec.id}/" class="btn btn-warning btn-sm">Edit</a>
                                    <a href="/delete-specification/${spec.id}/" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure you want to delete this specification?');">Delete</a>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        itemDetailsDiv.innerHTML += detailsHtml; // Append details for each component
    }

    // Function to create dynamic dropdown for 'make'
    function getMakeDropdown(selectedMake) {
        return `
            <select class="form-select">
                <option value="">Select Make</option>
                ${makeChoices.map(make => `
                    <option value="${make}" ${make === selectedMake ? 'selected' : ''}>${make}</option>
                `).join('')}
            </select>
        `;
    }

    // Function to print component details
    function printComponent(componentHTML) {
        const printWindow = window.open('', '', 'width=1200,height=1000');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Component</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        table, th, td { border: 1px solid black; padding: 5px; }
                        th { background-color: #f2f2f2; }
                        .no-print { display: none !important; }
                    </style>
                </head>
                <body>
                    ${componentHTML}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = function () {
            printWindow.print();
            setTimeout(function () {
                printWindow.close();
            }, 1000);
        };
    }
});
