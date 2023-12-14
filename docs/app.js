// Initialize an array to store selected app names
const selectedApps = [];
const selectedAppIds = [];

// Initialize a variable to store the selected option
// Array of options
const options = ["Essential", "essential2"];

// Populate the dropdown with options
const dropdown = document.getElementById("categoryDropdown0");
options.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.text = option;
    dropdown.add(optionElement);
});

// Function to update the variable when an option is selected
function changeCategory0() {
    // Get the selected option from the dropdown
    const selectedIdx = dropdown.selectedIndex;
    selectedOption = options[selectedIdx];
    fetchAndPopulateCategories()

    // Log the selected option (you can replace this with your own logic)
    console.log("Selected Option:", selectedOption);
}

changeCategory0()

async function fetchAndPopulateCategories() {
    try {
        const url = `./${selectedOption}/categories.json`;
        const response = await fetch(url);
        const categories = await response.json();
        const categoryDropdown = document.getElementById('categoryDropdown');
        categoryDropdown.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = option.textContent = category;
            categoryDropdown.appendChild(option);
        });
        changeCategory();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Event listener for the search input
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function () {
    changeCategory(); // Trigger category change when the search input changes
});

// Set focus on the search input when the page loads
window.onload = function () {
    searchInput.focus();
};

// Modified changeCategory function with extended search functionality
async function changeCategory() {
    try {
        const categoryDropdown = document.getElementById('categoryDropdown');
        const categoryHeader = document.getElementById('categoryHeader');
        const appList = document.getElementById('appList');

        const selectedCategory = categoryDropdown.value;

        // Check if selectedCategory is defined and has a truthy value
        if (!selectedCategory) {
            console.warn('Selected category is empty.');
            return;
        }

        categoryHeader.innerText = selectedCategory;

        // Clear previous list items
        appList.innerHTML = '';

        // Fetch data from JSON file
        const url = `./${selectedOption}/data.json`;
        const response = await fetch(url);
        const data = await response.json();

        // Get the data for the selected category
        const categoryData = selectedCategory === 'All'
            ? data.flatMap(obj => Object.values(obj)[0])
            : data.find(obj => obj[selectedCategory])[selectedCategory];

        // Get the search term from the input field
        const searchTerm = searchInput.value.toLowerCase();

        // Filter data based on search term
        const filteredData = categoryData.filter(app => {
            // Customize this condition based on your search requirements
            return app.App.toLowerCase().includes(searchTerm) ||
                (app.Detail && app.Detail.toLowerCase().includes(searchTerm)) ||
                (app.ID && app.ID.toLowerCase().includes(searchTerm));
        });

        // Display each filtered app
        filteredData.forEach(app => displayApp(app));

        // Select checkboxes for the apps in the selectedAppIds array
        selectAppsFromList(selectedAppIds);
    } catch (error) {
        console.error('Error handling category change:', error);
    }
}


// Function to display app details
function displayApp(app) {
    const appList = document.getElementById('appList');

    const output = generateAppDetails(app);
    const listItem = document.createElement('li');
    listItem.innerHTML = output;

    appList.appendChild(listItem);
}

// Function to generate app details HTML
function generateAppDetails(app) {
    let output = '';

    if (app.Website) {
        output += `<label for="${app.App}"><a href='${app.Website}' target='_blank'><span class='hyphen'>- </span>${app.App}</a></label>`;
    } else if (app.App) {
        output += `<label for="${app.App}"><span class='hyphen'>- </span>${app.App}: </label>`;
    }

    output += app.ID ? `<a href='${app.ID}' data-app-id='${app.ID}' onclick="performInstallAction(event, '${app.ID}')"> [WINGET]</a>` : '';


    output += app.Download ? `<a href='${app.Download}' target='_blank'> [Download]</a>` : '';

    output += app.Source ? `<a href='${app.Source}' target='_blank'> [SOURCE]</a>` : '';
    output += app.Detail ? `: ${app.Detail}` : '';

    return output;
}

// Function to perform the same action as clicking the [winget] link
function performInstallAction(event, appID) {
    event.preventDefault(); // Prevent the default link behavior

    const installCommand = `winget install --id "${appID}"`;

    // Check if the link is already marked as clicked
    const isClicked = event.target.classList.contains('bold-on-click');

    if (isClicked) {
        // Remove the install command and appID from the arrays
        const installIndex = selectedApps.indexOf(installCommand);
        if (installIndex !== -1) {
            selectedApps.splice(installIndex, 1);
        }

        const appIDIndex = selectedAppIds.indexOf(appID);
        if (appIDIndex !== -1) {
            selectedAppIds.splice(appIDIndex, 1);
        }
    } else {
        // Add the install command and appID to the arrays
        selectedApps.push(installCommand);
        selectedAppIds.push(appID);
    }

    // Call the function to print or process selectedApps
    printSelectedApps();

    // Toggle the bold-on-click class
    event.target.classList.toggle('bold-on-click', !isClicked);
}

// Function to select checkboxes based on the provided list of app names
function selectAppsFromList(appIds) {
    // Ensure appIds is an array
    appIds = Array.isArray(appIds) ? appIds : [];

    const links = document.querySelectorAll('a[data-app-id]');
    links.forEach(link => {
        const appId = link.getAttribute('data-app-id');
        const isBold = appIds.includes(appId);
        link.classList.toggle('bold-on-click', isBold);
    });
}

// Function to print selected apps
function printSelectedApps() {
    // Remove duplicates from selectedApps
    const uniqueSelectedApps = [...new Set(selectedApps)];

    // Get the infoBox element
    const infoBox = document.getElementById('infoBox');

    // Create a list to hold the selected app items
    const selectedAppsList = document.createElement('ul');
    selectedAppsList.style.listStyleType = 'none';
    selectedAppsList.style.padding = '0';

    // Populate the list with selected app items
    uniqueSelectedApps.forEach(selectedApp => {
        const listItem = document.createElement('li');
        listItem.textContent = selectedApp;
        selectedAppsList.appendChild(listItem);
    });

    // Clear previous content and append the list to the infoBox
    infoBox.innerHTML = '';
    infoBox.appendChild(selectedAppsList);

    // Log selected apps to the console
    console.log('Selected Apps:', uniqueSelectedApps);
}

// Function to clear selected apps
function clearSelectedApps() {
    // Clear the selectedApps array
    selectedApps.length = 0;
    selectedAppIds.length = 0;

    // Remove the bold-on-click class from all links with data-app-id attribute
    const links = document.querySelectorAll('a[data-app-id]');
    links.forEach(link => link.classList.remove('bold-on-click'));

    // Refresh the display
    printSelectedApps();
}

// Function to copy selected apps to the clipboard
async function copySelectedApps() {
    const selectedAppsText = selectedApps.join('\n');

    // Create a textarea element
    const textarea = document.createElement('textarea');
    textarea.value = selectedAppsText;
    document.body.appendChild(textarea);

    try {
        // Use the Clipboard API to copy text to the clipboard
        await navigator.clipboard.writeText(selectedAppsText);

        // Remove the temporary textarea
        document.body.removeChild(textarea);

        // Log a message or perform any other action after copying
        console.log('Selected apps copied to clipboard!');
    } catch (err) {
        // Handle any errors that may occur during copying
        console.error('Error copying to clipboard:', err);
    }
}


function addPackagesToConfig(initialJson, packageIdentifiers) {
    // Parse the initial JSON string
    let wingetConfig = JSON.parse(initialJson);

    // Add package identifiers from the array
    packageIdentifiers.forEach(packageIdentifier => {
        let packageObj = {
            "PackageIdentifier": packageIdentifier
        };
        wingetConfig.Sources[0].Packages.push(packageObj);
    });

    // Convert the modified object back to JSON
    let modifiedJson = JSON.stringify(wingetConfig, null, 2); // The third argument is for indentation

    return modifiedJson;
}

async function yourButtonClickFunction() {
    try {
        // Read the initial JSON from schema.json using fetch
        let response = await fetch('schema.json');

        // Check if the fetch was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Extract the JSON content from the response
        let initialJson = await response.json();

        // Assuming selectedAppIds is an array obtained from your UI click event

        // Call the function
        let modifiedJson = addPackagesToConfig(JSON.stringify(initialJson), selectedAppIds);

        // Create a Blob from the modified JSON
        let blob = new Blob([modifiedJson], { type: 'application/json' });

        // Create a download link
        let downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'wingetconfig.json';

        // Append the link to the document
        document.body.appendChild(downloadLink);

        // Trigger a click on the link to start the download
        downloadLink.click();

        // Remove the link from the document
        document.body.removeChild(downloadLink);

        // Perform other actions with the modified JSON, if needed
    } catch (error) {
        console.error('Error:', error);
    }
}

