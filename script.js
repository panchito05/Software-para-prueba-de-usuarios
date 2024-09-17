   break;
        default:
            alert('Opción no válida');
    }
}

function downloadFile(index) {
    const file = currentList.files[index];
    if (!file) {
        alert('Archivo no encontrado');
        return;
    }

    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function deleteFile(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
        currentList.files.splice(index, 1);
        saveListsToLocalStorage();
        renderFileList();
    }
}

// Asignar evento al botón y al input de archivo al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const fileButton = document.querySelector('.file-button');
    const fileList = document.querySelector('.file-list');

    if (fileButton && fileList) {
        fileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            fileList.style.display = fileList.style.display === 'none' ? 'block' : 'none';
        });

        // Cerrar la lista si se hace clic fuera de ella
        document.addEventListener('click', (e) => {
            if (!fileButton.contains(e.target) && !fileList.contains(e.target)) {
                fileList.style.display = 'none';
            }
        });
    }

   const uploadButton = document.getElementById('uploadFileButton');
    const fileInput = document.getElementById('fileInput');

    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileUpload);
});


function printTask(task, user) {
    const printWindow = window.open('', '_blank');
    const taskState = currentList.taskStates.find(t => t.id === task.id);
    const sharedUsers = currentList.users.filter(u => task.usuarios.includes(u.id) && u.id !== user.id);


    printWindow.document.write(`
        <html>
        <head>
            <title>Imprimir Tarea</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 20px;
                }
                .task-container {
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                h1 { color: #333; font-size: 24px; margin-bottom: 10px; }
                h2 { color: #666; font-size: 18px; margin-bottom: 15px; }
                .pasos-list { list-style-type: none; padding-left: 0; }
                .pasos-list li { margin-bottom: 10px; }
                .step-content { display: flex; align-items: center; }
                .step-checkbox { margin-right: 10px; }
                .important { font-weight: bold; color: #ff0000; }
                .resultado { margin-top: 20px; font-style: italic; }
                .comment-section, .shared-users { margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
                .comment-area {
                    width: 100%;
                    height: 100px;
                    border: 1px solid #ddd;
                    margin-top: 10px;
                    padding: 5px;
                }
                @media print {
                    .no-print { display: none; }
                    .comment-area {
                        border: 1px solid #000;
                        height: 200px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="task-container">
                <h1>${task.tarea}</h1>
                <h2>Usuario: ${user.name}</h2>
                ${sharedUsers.length > 0 ? `
                    <div class="shared-users">
                        <h3>Compartido con:</h3>
                        <ul>
                            ${sharedUsers.map(u => `<li>${u.name}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <ul class="pasos-list">
                    ${task.pasos.map((paso, index) => `
        <li>
            <div class="step-content">
                <span class="step-number">${index + 1}. </span>
                <input type="checkbox" class="step-checkbox" ${taskState && taskState.pasos[index].completed ? 'checked' : ''} disabled>
                <span class="${paso.importante ? 'important' : ''}">${paso.texto}</span>
            </div>
        </li>
    `).join('')}
                </ul>
                <p class="resultado"><strong>Resultado Esperado:</strong> ${task.resultado}</p>
                <div class="comment-section">
                    <h3>Comentarios:</h3>
                    <p>${taskState && taskState.comment ? taskState.comment : 'No hay comentarios.'}</p>
                    <div class="comment-area"></div>
                </div>
            </div>
            <div class="no-print">
                <button onclick="window.print()">Imprimir</button>
                <button onclick="window.close()">Cerrar</button>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Inicializar al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    loadListsFromLocalStorage();
    if (lists.length === 0) {
        // Si no hay listas, crear una por defecto
        const defaultListName = 'Lista Inicial';
        currentListName = defaultListName;
        currentList = {
            name: defaultListName,
            users: [],
            verificationTasks: [],
            taskStates: [],
            expandedUsers: [],
            files: [] // Inicializar 'files' aquí
        };
        lists.push(currentList);
        saveListsToLocalStorage();
    } else {
        // Seleccionar la primera lista como actual
        currentListName = lists[0].name;
        currentList = lists[0];
        // Verificar si 'files' existe, si no, inicializarlo
        if (!currentList.files) {
            currentList.files = [];
        }
    }
    updateListSelector();
    renderUsers();
    renderFileList();

    // Configurar eventos para el selector de listas y el botón de duplicar
    const listSelector = document.getElementById('listSelector');
    const duplicateListButton = document.getElementById('duplicateListButton');


    listSelector.addEventListener('change', () => {
        selectList(listSelector.value);
    });

    duplicateListButton.addEventListener('click', duplicateCurrentList);

  // Nuevo código para manejar la flecha y la lista de archivos
    const fileArrow = document.querySelector('.file-arrow');
    const fileList = document.querySelector('.file-list');

    if (fileArrow && fileList) {
        fileArrow.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el evento se propague
            fileList.style.display = fileList.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Configurar otros eventos
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const addUserButton = document.getElementById('addUserButton');
    const addUserModal = document.getElementById('addUserModal');
    const closeModalSpan = document.querySelector('.close');
    const addUserForm = document.getElementById('addUserForm');
    const addPasoButton = document.getElementById('addPasoButton');
    const exportButton = document.getElementById('exportButton');
    const importButton = document.getElementById('importButton');
    const importInput = document.getElementById('importInput');

    if (exportButton) {
        exportButton.addEventListener('click', exportData);
    }

    if (importButton && importInput) {
        importButton.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', importData);
    }    

    if (editButton && saveButton) {
        editButton.addEventListener('click', () => {
            makeEditable();
            editButton.style.display = 'none';
            saveButton.style.display = 'inline-block';
        });

        saveButton.addEventListener('click', () => {
            saveChanges();
            saveButton.style.display = 'none';
            editButton.style.display = 'inline-block';
        });
    }

    if (addUserButton && addUserModal && closeModalSpan && addUserForm && addPasoButton) {
        addUserButton.addEventListener('click', openAddUserModal);
        closeModalSpan.addEventListener('click', closeAddUserModal);
        window.addEventListener('click', (event) => {
            if (event.target == addUserModal) {
                closeAddUserModal();
            }
        });
        addUserForm.addEventListener('submit', handleAddUser);
        addPasoButton.addEventListener('click', addPasoField);
    }

    const addNewUserLink = document.getElementById('addNewUserLink');
    const newUserContainer = document.getElementById('newUserContainer');
    const existingUserContainer = document.getElementById('existingUserContainer');

    if (addNewUserLink && newUserContainer && existingUserContainer) {
        addNewUserLink.addEventListener('click', (e) => {
            e.preventDefault();
            newUserContainer.style.display = 'block';
            existingUserContainer.style.display = 'none';
            addNewUserLink.style.display = 'none';
        });
    }

    // Configurar eventos para los nuevos botones de edición y eliminación de listas
    const editListButton = document.getElementById('editListButton');
    const deleteListButton = document.getElementById('deleteListButton');

    if (editListButton) {
        editListButton.addEventListener('click', editListName);
    }

    if (deleteListButton) {
        deleteListButton.addEventListener('click', deleteList);
    }
});

