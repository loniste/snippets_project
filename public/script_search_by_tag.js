const tagInput = document.getElementById('tagInput');
const search_results = document.getElementById('search-results');
const sidebar = document.getElementById('sidebar');
let timeoutId;


function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


const updateComponentInfo = async (tag) => {
  console.log("called")
  try {
    const response = await fetch(`/?tag=${tag}`, {
      headers: {
        'Content-Type': 'application/json', // Set for JSON response
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newSearch_results = doc.getElementById('search-results');
    if (newSearch_results) {
      search_results.innerHTML = newSearch_results.innerHTML;
    }

    initializeDynamicBehavior()


    replaceLostImages()


  } catch (error) {
    console.error('Fetch error:', error);
    // Optionally, show a user-friendly error message in componentContainer
    componentContainer.innerHTML = `<p>Error fetching data.</p>`;
  }
};


tagInput.addEventListener('input', (e) => {
  const value = e.target.value;

  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    updateComponentInfo(value);
  }, 300);
});


document.addEventListener('DOMContentLoaded', function () {
  initializeDynamicBehavior()

});

function initializeDynamicBehavior() {
    const searchResultsContainer = document.getElementById('search-results');
    searchResultsContainer.addEventListener('click', (event) => {
      const listItem = event.target.closest('.list-group-item'); // Find the closest list item
      if (listItem) {
        const componentId = listItem.dataset.componentId;
        console.log(`Clicked on component with ID: ${componentId}`);
        window.location.href = `/component-details?componentId=${componentId}`;

      }
    });



  replaceLostImages()
  // Store original HTML content



}



function replaceLostImages() {
  const imageList = document.getElementById('imageList');

  if (imageList) {
    const images = imageList.querySelectorAll('img');

    images.forEach(img => {
      img.onerror = function () {
        // Create an error container
        //const errorContainer = document.createElement('div');
        //errorContainer.className = 'image-error';

        // Replace the image with the error container
        this.parentNode.removeChild(this);
      };
    });
  }
}
