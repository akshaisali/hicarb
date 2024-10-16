document.addEventListener('DOMContentLoaded', function () {
    const bomSelect = document.getElementById('bom-select');
    const itemDetailsDiv = document.getElementById('item-details');
    const purposeButtonsContainer = document.getElementById('purpose-buttons-container');
    const printBomButton = document.getElementById('print-bom-button');

    const makeChoices = [
        "------", "Pusher", "Cumi", "Cumi (Premier)", "Dimond", "Fenner", "Emarco", "Nu Tech", "Lovejoy",
        "Audco", "NTN", "Raicer", "Legris", "Delta", "Vanaz", "Avcon", "IEPL", "Champion Coolers",
        "Jhonson", "Auro", "Bharat Bijlee", "Rossi", "SMC", "EP", "HICARB", "NILL", "Indian", "JAISAON", "PMA"
    ];

    let selectedPurposes = new Set();

    bomSelect.addEventListener('change', function () {
        const bomId = this.value;

        if (bomId === "") {
            itemDetailsDiv.innerHTML = "";
            purposeButtonsContainer.innerHTML = "";
            selectedPurposes.clear();
            return;
        }

        // Fetch BOM details via the API
        fetch(`/api/get_bom_details/${bomId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    selectedPurposes.clear(); // Clear previous selections
                    const bomName = data.bom.name;
                    const workOrderNumber = data.bom.work_order_number || "N/A"; 
                    console.log("Fetched components:", data.components);  // Log fetched components for debugging

                    populatePurposeButtons(data.components);
                    itemDetailsDiv.innerHTML = ''; // Clear previous item details
                    displayBOMHeader(bomName, workOrderNumber);
                } else {
                    console.error("Failed to fetch BOM details:", data.message);
                }
            })
            .catch(error => {
                console.error("Error fetching details:", error);
                itemDetailsDiv.innerHTML = "<div class='alert alert-danger'>Error loading details. Please try again later.</div>";
            });
    });

    function populatePurposeButtons(components) {
        purposeButtonsContainer.innerHTML = '';  // Clear previous purposes
        const checkboxGridContainer = document.createElement('div');
        checkboxGridContainer.classList.add('checkbox-grid-container');

        const uniquePurposes = new Set();
        components.forEach(component => {
            component.specifications.forEach(spec => {
                if (spec.purpose) {
                    uniquePurposes.add(spec.purpose);
                }
            });
        });

        uniquePurposes.forEach(purpose => {
            const checkboxWrapper = document.createElement('div');
            const purposeCheckbox = document.createElement('input');
            purposeCheckbox.type = 'checkbox';
            purposeCheckbox.classList.add('form-check-input');
            purposeCheckbox.id = purpose;
            purposeCheckbox.value = purpose;

            const label = document.createElement('label');
            label.htmlFor = purpose;
            label.classList.add('checkbox-label');
            label.textContent = purpose;

            checkboxWrapper.appendChild(purposeCheckbox);
            checkboxWrapper.appendChild(label);

            purposeCheckbox.addEventListener('change', function () {
                if (this.checked) {
                    selectedPurposes.add(purpose);
                } else {
                    selectedPurposes.delete(purpose);
                }
                console.log("Selected purposes:", [...selectedPurposes]);  // Log selected purposes for debugging
                displayPurposeData(components);
            });

            checkboxGridContainer.appendChild(checkboxWrapper);
        });

        purposeButtonsContainer.appendChild(checkboxGridContainer);
    }

    function displayPurposeData(components) {
        let filteredSpecifications = [];
        let grandTotal = 0;

        selectedPurposes.forEach(selectedPurpose => {
            components.forEach(component => {
                component.specifications.forEach(spec => {
                    if (spec.purpose === selectedPurpose) {
                        console.log("Processing specification:", spec);  // Log each specification for debugging
                        filteredSpecifications.push({
                            ...spec,
                            componentName: component.name,
                            objective: spec.objective || 'N/A'
                        });

                        grandTotal += parseFloat(spec.total) || 0;
                    }
                });
            });
        });

        if (filteredSpecifications.length === 0) {
            itemDetailsDiv.innerHTML = "<div class='alert alert-warning'>No data found for the selected purposes.</div>";
            return;
        }

        const specificationRows = filteredSpecifications.map((spec, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${spec.componentName}</td>
                <td>${spec.specification || 'N/A'}</td>
                <td>${getMakeDropdown(spec.make)}</td>
                <td>${spec.purpose || 'N/A'}</td>
                <td>${spec.objective || 'N/A'}</td>
                <td>${spec.quality || 'N/A'}</td>
                <td>${spec.rate || 'N/A'}</td>
                <td>${spec.price || 'N/A'}</td>
                <td>${spec.total || 'N/A'}</td>
                <td class="no-print">
                    <a href="/edit-specification/${spec.id}/" class="btn btn-warning btn-sm">To Edit</a>
                    <a href="/delete-specification/${spec.id}/" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure you want to delete this specification?');">Delete</a>
                </td>
            </tr>
        `).join('');

        const bomHTML = `
        <div class="card bg-secondary text-white mt-4">
            <div class="card-body">
                <h4 class="card-title">Purposes: ${[...selectedPurposes].join(', ')}</h4>
                <table class="table table-bordered table-hover table-light mt-3">
                    <thead class="table-dark">
                        <tr>
                            <th>S No</th>
                            <th>Component</th>
                            <th>Specification</th>
                            <th>Make</th>
                            <th>Purpose</th>
                            <th>Objective</th>
                            <th>Quality</th>
                            <th>Rate</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th class="no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${specificationRows}
                    </tbody>
                </table>

                <div class="mt-3">
                    <h5>Grand Total: ₹${grandTotal.toFixed(2)}</h5>
                </div>
            </div>
        </div>
        `;

        itemDetailsDiv.innerHTML = bomHTML;
    }

    function displayBOMHeader(bomName, workOrderNumber) {
        itemDetailsDiv.innerHTML = `
            <h4 class="card-title">BOM: ${bomName} (Work Order: ${workOrderNumber})</h4>
        `;
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
                    <title>Print BOM</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        table, th, td { border: 1px solid black; padding: 5px; }
                        th { background-color: #f2f2f2; }
                        .no-print { display: none !important; }

                        /* Hide the "Objective" column when printing */
                        @media print {
                            td:nth-child(6), th:nth-child(6) {
                                display: none;
                            }
                        }
                        @media print {
                            td:nth-child(4), th:nth-child(4) {
                                display: none;
                            }
                        }
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

    if (printBomButton) {
        printBomButton.addEventListener('click', function () {
            const componentHTML = itemDetailsDiv.innerHTML; // Get the content inside itemDetailsDiv
            printComponent(componentHTML); // Pass the HTML content to the printComponent function
        });
    }
});
