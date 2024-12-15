const tagInput = document.getElementById('tagInput');
const componentContainer = document.getElementById('component-container');
const sidebar = document.getElementById('sidebar');
let timeoutId;
let originalTabContents = new Map();
let originalSnippetContents = new Map();

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


const updateComponentInfo = async (tag) => {
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
    const newComponentContainer = doc.getElementById('component-container');
    if (newComponentContainer) {
      componentContainer.innerHTML = newComponentContainer.innerHTML;
    }

    const newSidebar = doc.getElementById('sidebar');
    if (newSidebar) {
      sidebar.innerHTML = newSidebar.innerHTML;
    }

    document.querySelectorAll('.tabs .nav-link').forEach(tabButton => {
      originalTabContents.set(tabButton, tabButton.innerHTML);
    });
    document.querySelectorAll('.tab-content pre code').forEach(snippetElement => {
      originalSnippetContents.set(snippetElement, snippetElement.innerHTML);
    });



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
  initializeDynamicBehavior();


});

function initializeDynamicBehavior() {
  const imageList = document.getElementById('imageList');
  const tabContentContainer = document.getElementById('tabContentContainer');
  const componentContainer = document.getElementById('component-container');
  // Delegate the 'click' event for .copy-button to the componentContainer
  if (componentContainer) {
    componentContainer.addEventListener('click', function (event) {
      if (event.target.classList.contains('copy-button')) {
        // Locate the <code> element
            const codeElement = event.target.nextElementSibling.querySelector('code');
            if (codeElement) {
                const snippet = codeElement.textContent;
                navigator.clipboard.writeText(snippet).then(() => {
                        //console.log(snippet);
                        alert('Snippet copied to clipboard!');
                     })
                 .catch(err => {
                    console.error('Failed to copy snippet: ', err);
                    alert("Failed to copy snippet");
                });
             }
       }
    });
  }

  if (imageList) {
    imageList.addEventListener('click', function (event) {
      if (event.target.tagName === 'IMG') {
        const targetTabId = event.target.getAttribute('data-tab');
        if (targetTabId) {
          const tabContentElement = document.getElementById(targetTabId);
          if (tabContentElement) {
            // hide all image tabs first
            const allImageTabs = tabContentContainer.querySelectorAll('.tab-content[id^="image-"]');
            allImageTabs.forEach(tab => tab.classList.remove('active'));

            tabContentElement.classList.add('active');

          }

        }
      }
    })
  }
  // Store original HTML content


  document.querySelectorAll('.tabs .nav-link').forEach(tabButton => {
    originalTabContents.set(tabButton, tabButton.innerHTML);
  });
  document.querySelectorAll('.tab-content pre code').forEach(snippetElement => {
    originalSnippetContents.set(snippetElement, snippetElement.innerHTML);
  });

  const sidebar = document.getElementById('sidebar');
  sidebar.addEventListener('input', function (event) {
    // Restore original content before replacement
    originalTabContents.forEach((originalContent, tabButton) => {
      tabButton.innerHTML = originalContent;
    });
    originalSnippetContents.forEach((originalContent, snippetElement) => {
      snippetElement.innerHTML = originalContent;
    });
    // Check if the input event originated from input[type="text"] inside .sidebar-params
    if (event.target && event.target.closest('.sidebar-params') && event.target.matches('input[type="text"]')) {
      const paramInputs = document.querySelectorAll('.sidebar-params input[type="text"]');
      paramInputs.forEach(inputToReplace => {
        const paramName = inputToReplace.id;
        const newValue = inputToReplace.value;
        const escapedParamName = escapeRegExp(paramName);

        // Replace in tab names
        const tabButtons = document.querySelectorAll('.tabs .nav-link');

        tabButtons.forEach(tabButton => {
          if (newValue) {
            console.log(tabButton.innerHTML)
            tabButton.innerHTML = tabButton.innerHTML.replace(new RegExp(escapedParamName, 'g'), newValue);
          } else {
            tabButton.innerHTML = tabButton.innerHTML.replace(new RegExp(escapedParamName, 'g'), paramName);
          }
        });

        // Replace in snippets
        const snippets = document.querySelectorAll('.tab-content pre code');
        snippets.forEach(snippetElement => {
          if (newValue) {
            snippetElement.innerHTML = snippetElement.innerHTML.replace(new RegExp(escapedParamName, 'g'), newValue);
          } else {
            snippetElement.innerHTML = snippetElement.innerHTML.replace(new RegExp(escapedParamName, 'g'), paramName);
          }
        });
      });
    }
  });


}