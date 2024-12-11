// Define the copyToClipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert('Copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy text:', err);
            alert('Failed to copy text. Please try again.');
        });
}

// Load content dynamically for the details panel
fetch('details-panel-content.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const imageList = document.getElementById('imageList');
        const tabs = document.getElementById('tabs');
        const tabContentContainer = document.getElementById('tabContentContainer');

        // Populate image list
        if (data.images && Array.isArray(data.images)) {
            data.images.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = 'Dynamic Image';
                img.classList.add('dynamic-image');
                imageList.appendChild(img);
            });
        } else {
            console.warn('No images found in JSON.');
        }

        // Populate tabs
        if (data.tabs && Array.isArray(data.tabs)) {
            data.tabs.forEach((tab, index) => {
                const tabElement = document.createElement('li');
                tabElement.classList.add('nav-item');
                tabElement.innerHTML = ` 
                    <a class="nav-link ${index === 0 ? 'active' : ''}" id="tab-${index}" data-bs-toggle="pill" href="#content-${index}">
                        ${tab.title}
                    </a>
                `;
                tabs.appendChild(tabElement);

                const tabContent = document.createElement('div');
                tabContent.classList.add('tab-content');
                tabContent.id = `content-${index}`;
                tabContent.innerHTML = `
                <p>${tab.content}</p>
                <button class="copy-button" onclick="copyToClipboard('${tab.content.replace(/'/g, "\\'")}')">Copy to Clipboard</button>
                `;
                tabContentContainer.appendChild(tabContent);
            });
        } else {
            console.warn('No tabs found in JSON.');
        }
    })
    .catch(error => {
        console.error('Error fetching JSON:', error.message);
    });