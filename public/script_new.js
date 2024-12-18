document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('componentForm');
    const picsContainer = document.getElementById('picsContainer');
    const paramsContainer = document.getElementById('paramsContainer');
    const snippetsContainer = document.getElementById('snippetsContainer');
    const jsonOutput = document.getElementById('json-output');
    const jsonPreviewDiv = document.getElementById('json-preview');
    const addPicButton = document.getElementById('addPic');
    const addParamButton = document.getElementById('addParam');
    const addSnippetButton = document.getElementById('addSnippet');


    let picIdCounter = 2;
    let paramIdCounter = 2;
    let snippetIdCounter = 2;

    addPicButton.addEventListener('click', function () {
        const newPicInput = document.createElement('div');
        newPicInput.className = 'input-group mb-2';
        newPicInput.setAttribute("data-pic-id", picIdCounter);
        newPicInput.innerHTML = `
             <input type="file" class="form-control pic-input" accept="image/*" data-pic-id="${picIdCounter}" multiple required>
              <button type="button" class="btn btn-danger remove-pic" data-pic-id = "${picIdCounter}"><i class="fas fa-minus"></i></button>
          `;

        picsContainer.appendChild(newPicInput);
        picIdCounter++;
    });
    addParamButton.addEventListener('click', function () {
        const newParamInput = document.createElement('div');
        newParamInput.className = 'param-group mb-2';
        newParamInput.setAttribute("data-param-id", paramIdCounter)
        newParamInput.innerHTML = `
            <div class="input-group mb-2">
              <input type="text" class="form-control param-input" placeholder="Param" data-param-id="${paramIdCounter}" data-field="param" required>
              <input type="text" class="form-control param-input" placeholder="Description" data-param-id="${paramIdCounter}" data-field="desc" required>
              <div class="input-group-text">
              <input type="checkbox" class="param-input" data-param-id="${paramIdCounter}" data-field="required" aria-label="Checkbox for following text input">
                <label for="checkbox" class="ms-2">Required</label>
              </div>
              <button type="button" class="btn btn-danger remove-param" data-param-id="${paramIdCounter}"><i class="fas fa-minus"></i></button>
            </div>
        `;
        paramsContainer.appendChild(newParamInput);
        paramIdCounter++;
    });

    addSnippetButton.addEventListener('click', function () {
        const newSnippetInput = document.createElement('div');
        newSnippetInput.className = 'snippet-group mb-2';
        newSnippetInput.setAttribute("data-snippet-id", snippetIdCounter);

        newSnippetInput.innerHTML = `
              <div class="input-group mb-2">
              <input type="text" class="form-control snippet-input" placeholder="File Name" data-snippet-id = "${snippetIdCounter}" data-field = "file_name" required>
                  <textarea class="form-control snippet-input" placeholder="Snippet Content" data-snippet-id = "${snippetIdCounter}" data-field = "snippet" rows="3"
                            required></textarea>
              <button type="button" class="btn btn-danger remove-snippet" data-snippet-id = "${snippetIdCounter}"><i class="fas fa-minus"></i></button>
            </div>
          `;
        snippetsContainer.appendChild(newSnippetInput);
        snippetIdCounter++;
    });

    picsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('remove-pic')) {
            const removeButton = event.target;
            const picIdToRemove = removeButton.getAttribute('data-pic-id');
            const picInputToRemove = picsContainer.querySelector(`.input-group[data-pic-id="${picIdToRemove}"]`);

            if (picInputToRemove)
                picInputToRemove.remove();
        }
    });

    paramsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('remove-param')) {
            const removeButton = event.target;
            const paramIdToRemove = removeButton.getAttribute('data-param-id');
            const paramGroupToRemove = paramsContainer.querySelector(`.param-group[data-param-id="${paramIdToRemove}"]`);

            if (paramGroupToRemove) {
                paramGroupToRemove.remove();
            }
        }
    });
    snippetsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('remove-snippet')) {
            const removeButton = event.target;
            const snippetIdToRemove = removeButton.getAttribute('data-snippet-id');
            const snippetGroupToRemove = snippetsContainer.querySelector(`.snippet-group[data-snippet-id="${snippetIdToRemove}"]`);

            if (snippetGroupToRemove) {
                snippetGroupToRemove.remove();
            }
        }
    })


    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const tags = document.getElementById('tags').value;
        const programming_language = document.getElementById('programming_language').value;


        const params = Array.from(paramsContainer.querySelectorAll('.param-group')).map(group => {
            const paramId = group.getAttribute('data-param-id');
            return {
                param: paramsContainer.querySelector(`.param-input[data-param-id="${paramId}"][data-field="param"]`).value,
                desc: paramsContainer.querySelector(`.param-input[data-param-id="${paramId}"][data-field="desc"]`).value,
                required: paramsContainer.querySelector(`.param-input[data-param-id="${paramId}"][data-field="required"]`).checked
            };
        });
        const snippets = Array.from(snippetsContainer.querySelectorAll('.snippet-group')).map(group => {
            const snippetId = group.getAttribute('data-snippet-id');
            return {
                file_name: snippetsContainer.querySelector(`.snippet-input[data-snippet-id="${snippetId}"][data-field="file_name"]`).value,
                snippet: snippetsContainer.querySelector(`.snippet-input[data-snippet-id="${snippetId}"][data-field="snippet"]`).value
            }
        });
        const formData = new FormData();
        const picInputs = picsContainer.querySelectorAll('.pic-input');
        picInputs.forEach(input => {
            const picId = input.getAttribute('data-pic-id');
            const files = input.files;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    formData.append(`pics_${picId}`, files[i]);
                }
            }
        });
        formData.append('name', name);
        formData.append('tags', tags);
        formData.append('programming_language', programming_language);
        formData.append('params', JSON.stringify(params));
        formData.append('snippets', JSON.stringify(snippets));
        try {
            const response = await fetch('/submit-component', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const responseData = await response.text();
            jsonOutput.textContent = JSON.stringify(JSON.parse(responseData).formData, null, 2);
            jsonPreviewDiv.style.display = 'block';
            console.log("Data saved correctly")

        } catch (error) {
            console.error('Error:', error);
            alert("Error: Data not saved, check the logs for more information")
        }
    });
});