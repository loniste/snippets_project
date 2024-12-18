const componentContainer = document.getElementById('component-container');
const sidebar = document.getElementById('sidebar');
let timeoutId;
let originalTabContents = new Map();

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}





document.addEventListener('DOMContentLoaded', function () {
  initializeDynamicBehavior();


});

function initializeDynamicBehavior() {
  const mainContainer = document.getElementById('main_container');

  mainContainer.addEventListener('click', function (event) {
    if (event.target.closest('#floatingButton')) {
      window.location.href = '/new';
    }
  });


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
          //securedCopyToClipboard(snippet)
          unsecuredCopyToClipboard(snippet)
        }
      }
    });
  }

  replaceLostImages()
  // Store original HTML content


  document.querySelectorAll('.tabs .nav-link').forEach(tabButton => {
    originalTabContents.set(tabButton, tabButton.innerHTML);
  });


  const sidebar = document.getElementById('sidebar');
  sidebar.addEventListener('input', function (event) {
    // Restore original content before replacement
    originalTabContents.forEach((originalContent, tabButton) => {
      tabButton.innerHTML = originalContent;
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
            tabButton.innerHTML = tabButton.innerHTML.replace(new RegExp(capitalizeFirstLetter(escapedParamName), 'g'), capitalizeFirstLetter(newValue));
            tabButton.innerHTML = tabButton.innerHTML.replace(new RegExp(lowercaseFirstLetter(escapedParamName), 'g'), lowercaseFirstLetter(newValue));
          } else {
            tabButton.innerHTML = tabButton.innerHTML.replace(new RegExp(escapedParamName, 'g'), paramName);
          }
        });

        // Replace in snippets
        const snippets = document.querySelectorAll('.tab-content pre code');
        snippets.forEach(snippetElement => {
          if (newValue) {

            console.log("original snippet: "+snippetElement.dataset.originalSnippet)
            console.log("lowercase param: " + lowercaseFirstLetter(escapedParamName))
            console.log("new snippetElement content: "+snippetElement.dataset.originalSnippet.replace(new RegExp(lowercaseFirstLetter(escapedParamName), 'g'), lowercaseFirstLetter(newValue)))
            snippetElement.innerHTML = snippetElement.dataset.originalSnippet.replace(new RegExp(capitalizeFirstLetter(escapedParamName), 'g'), capitalizeFirstLetter(newValue));
            snippetElement.innerHTML = snippetElement.dataset.originalSnippet.replace(new RegExp(lowercaseFirstLetter(escapedParamName), 'g'), lowercaseFirstLetter(newValue));
            console.log(" new snippetElement.innerHTML: "+snippetElement.dataset.originalSnippet.replace(new RegExp(lowercaseFirstLetter(escapedParamName), 'g'), lowercaseFirstLetter(newValue)))

          } else {
            snippetElement.innerHTML = snippetElement.dataset.originalSnippet.replace(new RegExp(escapedParamName, 'g'), paramName);
          }
          Prism.highlightElement(snippetElement);
        });
      });
    }
  });


}

function unsecuredCopyToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    alert('Snippet copied to clipboard!');


  } catch (err) {
    console.error('Unable to copy to clipboard', err);
    alert("Failed to copy snippet");

  }
  document.body.removeChild(textArea);
}

function securedCopyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    //console.log(snippet);
    alert('Snippet copied to clipboard!');
  })
    .catch(err => {
      console.error('Failed to copy snippet: ', err);
      alert("Failed to copy snippet");
    });
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
function startsWithCapital(str) {
  return /^[A-Z]/.test(str);
}
function capitalizeFirstLetter(str) {
  if (!str) return ""; // Handle empty strings

  let firstLetterIndex = 0;
  while (firstLetterIndex < str.length && !/[a-zA-Z]/.test(str[firstLetterIndex])) {
    firstLetterIndex++;
  }
  if (firstLetterIndex === str.length) {
    return str; // return the same string if no letters are found
  }


  return str.slice(0, firstLetterIndex) + str.charAt(firstLetterIndex).toUpperCase() + str.slice(firstLetterIndex + 1);
}

function lowercaseFirstLetter(str) {
  if (!str) return ""; // Handle empty strings

  let firstLetterIndex = 0;
  while (firstLetterIndex < str.length && !/[a-zA-Z]/.test(str[firstLetterIndex])) {
    firstLetterIndex++;
  }

  if (firstLetterIndex === str.length) {
    return str; // return the same string if no letters are found
  }

  return str.slice(0, firstLetterIndex) + str.charAt(firstLetterIndex).toLowerCase() + str.slice(firstLetterIndex + 1);
}