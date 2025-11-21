// Monaco Editor 설정
if (window.require) {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs' } });
    
    // Monaco Editor 초기화
    require(['vs/editor/editor.main'], function () {
        initializeEditor();
    });
} else {
    console.error('Monaco Editor loader is not properly initialized');
}

let editor;
let currentFile = null;
let currentProject = null;

// 프로젝트 데이터 구조
const projects = {};

// 기본 파일 시스템 구조
const createEmptyFileSystem = () => ({
    files: {},
    folders: {}
});

// 에디터 초기화 함수
function initializeEditor() {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: '// Welcome to Monaco Editor\n',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true
    });

    // 자동 저장 및 프리뷰 업데이트 이벤트 설정
    editor.onDidChangeModelContent(() => {
        if (currentFile && currentProject) {
            // 파일 내용 저장
            projects[currentProject].files[currentFile] = editor.getValue();
            
            // 프리뷰 패널이 활성화된 경우에만 업데이트
            if (document.querySelector('.preview-panel').classList.contains('active')) {
                updatePreview();
            }
        }
    });

    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 저장된 프로젝트 로드
    loadProjects();
}

// 프로젝트 로드
function loadProjects() {
    const savedProjects = localStorage.getItem('monaco-projects');
    if (savedProjects) {
        Object.assign(projects, JSON.parse(savedProjects));
        updateProjectSelect();
    }
}

// 프로젝트 저장
function saveProjects() {
    localStorage.setItem('monaco-projects', JSON.stringify(projects));
}

// 프로젝트 선택 업데이트
function updateProjectSelect() {
    const select = document.getElementById('project-select');
    select.innerHTML = '<option value="">Select Project</option>';
    
    Object.keys(projects).forEach(projectName => {
        const option = document.createElement('option');
        option.value = projectName;
        option.textContent = projectName;
        if (projectName === currentProject) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 사이드바 토글
    document.getElementById('toggle-sidebar').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
        editor.layout();
    });

    // 리사이즈 핸들 이벤트
    const sidebar = document.querySelector('.sidebar');
    const resizeHandle = document.querySelector('.resize-handle');
    let isResizing = false;
    let sidebarStartX;
    let sidebarStartWidth;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        sidebarStartX = e.clientX;
        sidebarStartWidth = parseInt(getComputedStyle(sidebar).width, 10);
        document.body.style.cursor = 'ew-resize';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const width = sidebarStartWidth + (e.clientX - sidebarStartX);
        const clampedWidth = Math.max(200, Math.min(800, width));
        sidebar.style.width = clampedWidth + 'px';
        editor.layout();
    });

    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            
            // 에디터 크기 최종 업데이트
            if (editor) {
                editor.layout();
            }
        }
    });

    // 언어 선택
    document.getElementById('language-select').addEventListener('change', (e) => {
        monaco.editor.setModelLanguage(editor.getModel(), e.target.value);
    });

    // 테마 선택
    document.getElementById('theme-select').addEventListener('change', (e) => {
        monaco.editor.setTheme(e.target.value);
    });

    // 프로젝트 선택
    document.getElementById('project-select').addEventListener('change', (e) => {
        currentProject = e.target.value;
        currentFile = null;
        editor.setValue('// Select a file to edit\n');
        
        if (currentProject) {
            updateFileTree();
            document.getElementById('new-file').disabled = false;
            document.getElementById('new-folder').disabled = false;
        } else {
            document.getElementById('file-tree-content').innerHTML = '';
            document.getElementById('new-file').disabled = true;
            document.getElementById('new-folder').disabled = true;
        }
    });

    // 새 프로젝트 생성
    document.getElementById('new-project').addEventListener('click', () => {
        const projectName = prompt('Enter project name:');
        if (projectName && !projects[projectName]) {
            projects[projectName] = createEmptyFileSystem();
            currentProject = projectName;
            saveProjects();
            updateProjectSelect();
            updateFileTree();
        } else if (projects[projectName]) {
            alert('Project already exists!');
        }
    });

    // 프로젝트 삭제
    document.getElementById('delete-project').addEventListener('click', () => {
        if (!currentProject) {
            alert('Please select a project to delete');
            return;
        }
        
        if (confirm(`Are you sure you want to delete project "${currentProject}"?`)) {
            delete projects[currentProject];
            currentProject = null;
            currentFile = null;
            editor.setValue('// Select a project and file to edit\n');
            saveProjects();
            updateProjectSelect();
            updateFileTree();
        }
    });

    // 새 파일 생성
    document.getElementById('new-file').addEventListener('click', () => {
        if (!currentProject) {
            alert('Please select a project first');
            return;
        }
        const fileName = prompt('Enter file name:');
        if (fileName) {
            createFile(fileName);
        }
    });

    // 새 폴더 생성
    document.getElementById('new-folder').addEventListener('click', () => {
        if (!currentProject) {
            alert('Please select a project first');
            return;
        }
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            createFolder(folderName);
        }
    });

    // 프로젝트 다운로드
    document.getElementById('download-project').addEventListener('click', downloadProject);

    // 컨텍스트 메뉴 이벤트
    document.addEventListener('click', () => {
        document.getElementById('context-menu').style.display = 'none';
    });

    // 파일 트리 영역에 드롭 이벤트 추가
    const fileTree = document.querySelector('.file-tree');
    fileTree.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!e.target.closest('.file-tree-item')) {
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        }
    });

    fileTree.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!e.target.closest('.file-tree-item')) {
            const sourcePath = e.dataTransfer.getData('text/plain');
            moveItem(sourcePath, '');
        }
    });

    // 프리뷰 패널 토글
    document.getElementById('toggle-preview').addEventListener('click', () => {
        
        const previewPanel = document.querySelector('.preview-panel');
        previewPanel.classList.toggle('active');
        if (previewPanel.classList.contains('active')) {
            updatePreview();
        }
        editor.layout();
    });

    // 프리뷰 새로고침
    document.getElementById('refresh-preview').addEventListener('click', updatePreview);

    // 프리뷰 패널 리사이즈
    const previewPanel = document.querySelector('.preview-panel');
    const previewResizeHandle = document.querySelector('.resize-handle-left');
    let isResizingPreview = false;
    let previewStartX;
    let previewStartWidth;

    previewResizeHandle.addEventListener('mousedown', (e) => {
        isResizingPreview = true;
        previewStartX = e.clientX;
        previewStartWidth = parseInt(getComputedStyle(previewPanel).width, 10);
        document.body.style.cursor = 'ew-resize';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizingPreview) return;
        
        const width = previewStartWidth - (e.clientX - previewStartX);
        const clampedWidth = Math.max(200, Math.min(800, width));
        previewPanel.style.width = clampedWidth + 'px';
        editor.layout();
    });

    document.addEventListener('mouseup', () => {
        if (isResizingPreview) {
            isResizingPreview = false;
            document.body.style.cursor = '';
            editor.layout();
        }
    });
}

// 파일 생성
function createFile(name) {
    if (!currentProject) return;
    if (!name.includes('.')) name += '.txt';
    projects[currentProject].files[name] = '';
    saveProjects();
    updateFileTree();
}

// 폴더 생성
function createFolder(name) {
    if (!currentProject) return;
    projects[currentProject].folders[name] = { files: {}, folders: {} };
    saveProjects();
    updateFileTree();
}

// 파일 트리 업데이트
function updateFileTree() {
    const container = document.getElementById('file-tree-content');
    container.innerHTML = '';

    if (currentProject) {
        renderFileSystem(container, projects[currentProject]);
    }
}

// 파일 시스템 렌더링
function renderFileSystem(container, system, path = '') {
    // 폴더 먼저 렌더링
    Object.entries(system.folders).forEach(([folderName, folder]) => {
        const folderPath = path ? `${path}/${folderName}` : folderName;
        const folderElement = createFolderElement(folderName, folderPath);
        container.appendChild(folderElement);
        
        // 폴더 컨텐츠 컨테이너 생성
        const contentContainer = document.createElement('div');
        contentContainer.className = 'folder-content';
        folderElement.appendChild(contentContainer);
        
        // 재귀적으로 폴더 내용 렌더링
        renderFileSystem(contentContainer, folder, folderPath);
    });

    // 그 다음 파일 렌더링
    Object.entries(system.files).forEach(([fileName, content]) => {
        const filePath = path ? `${path}/${fileName}` : fileName;
        const fileElement = createFileElement(fileName, filePath);
        container.appendChild(fileElement);
    });
}

// 파일 요소 생성
function createFileElement(fileName, filePath) {
    const div = document.createElement('div');
    div.className = 'file-tree-item';
    div.innerHTML = `<i class="fas fa-file"></i> ${fileName}`;
    div.setAttribute('data-path', filePath);
    
    // 드래그 앤 드롭 설정
    div.draggable = true;
    setupDragAndDrop(div, false);
    
    div.addEventListener('click', () => openFile(filePath));
    div.addEventListener('contextmenu', (e) => showContextMenu(e, filePath));
    
    return div;
}

// 폴더 요소 생성
function createFolderElement(folderName, folderPath) {
    const div = document.createElement('div');
    div.className = 'file-tree-item';
    div.innerHTML = `
        <i class="fas fa-chevron-right folder-icon"></i>
        <i class="fas fa-folder"></i>
        ${folderName}
    `;
    div.setAttribute('data-path', folderPath);
    
    // 드래그 앤 드롭 설정
    setupDragAndDrop(div, true);
    
    // 폴더 토글 이벤트
    const chevron = div.querySelector('.folder-icon');
    div.addEventListener('click', (e) => {
        if (e.target === chevron || e.target === div) {
            const content = div.querySelector('.folder-content');
            content.classList.toggle('expanded');
            chevron.classList.toggle('expanded');
        }
    });
    
    div.addEventListener('contextmenu', (e) => showContextMenu(e, folderPath, true));
    
    return div;
}

// 드래그 앤 드롭 설정
function setupDragAndDrop(element, isFolder) {
    element.draggable = true;

    element.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        e.dataTransfer.setData('text/plain', element.getAttribute('data-path'));
        element.classList.add('dragging');
    });

    element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });

    // 폴더일 경우에만 드롭 대상이 될 수 있음
    if (isFolder) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');

            const sourcePath = e.dataTransfer.getData('text/plain');
            const targetPath = element.getAttribute('data-path');

            if (sourcePath !== targetPath) {
                moveItem(sourcePath, targetPath);
            }
        });
    }
}

// 파일 트리 영역에 드롭 이벤트 추가
document.querySelector('.file-tree').addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!e.target.closest('.file-tree-item')) {
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    }
});

document.querySelector('.file-tree').addEventListener('drop', (e) => {
    e.preventDefault();
    if (!e.target.closest('.file-tree-item')) {
        const sourcePath = e.dataTransfer.getData('text/plain');
        moveItem(sourcePath, '');  // 빈 문자열은 루트 경로를 의미
    }
});

// 파일/폴더 이동
function moveItem(sourcePath, targetPath) {
    const sourcePathParts = sourcePath.split('/');
    const sourceName = sourcePathParts.pop();
    const sourceParentPath = sourcePathParts.join('/');
    
    // 소스 아이템과 부모 찾기
    let sourceItem;
    let sourceParent = projects[currentProject];
    if (sourceParentPath) {
        try {
            sourceParentPath.split('/').forEach(part => {
                if (!sourceParent.folders[part]) {
                    throw new Error('Invalid path');
                }
                sourceParent = sourceParent.folders[part];
            });
        } catch (e) {
            console.error('Source path not found');
            return;
        }
    }

    // 아이템이 파일인지 폴더인지 확인
    const isFolder = sourceName in sourceParent.folders;
    if (isFolder) {
        sourceItem = sourceParent.folders[sourceName];
        delete sourceParent.folders[sourceName];
    } else {
        sourceItem = sourceParent.files[sourceName];
        delete sourceParent.files[sourceName];
    }

    // 타겟 폴더 찾기
    let targetFolder = projects[currentProject];
    if (targetPath) {
        try {
            targetPath.split('/').forEach(part => {
                if (!targetFolder.folders[part]) {
                    throw new Error('Invalid path');
                }
                targetFolder = targetFolder.folders[part];
            });
        } catch (e) {
            console.error('Target path not found');
            return;
        }
    }

    // 아이템 이동
    if (isFolder) {
        targetFolder.folders[sourceName] = sourceItem;
    } else {
        targetFolder.files[sourceName] = sourceItem;
    }

    updateFileTree();
}

// 파일 열기
function openFile(fileName) {
    if (!currentProject) return;
    
    currentFile = fileName;
    const content = projects[currentProject].files[fileName] || '';
    const language = getLanguageFromFileName(fileName);
    
    editor.setValue(content);
    monaco.editor.setModelLanguage(editor.getModel(), language);
}

// 컨텍스트 메뉴 표시
function showContextMenu(e, name, isFolder = false) {
    e.preventDefault();
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';

    const renameItem = menu.querySelector('[data-action="rename"]');
    const deleteItem = menu.querySelector('[data-action="delete"]');

    renameItem.onclick = () => rename(name, isFolder);
    deleteItem.onclick = () => deleteItem(name, isFolder);
}

// 이름 변경
function rename(oldName, isFolder) {
    const newName = prompt('Enter new name:', oldName);
    if (!newName) return;

    if (isFolder) {
        const folder = projects[currentProject].folders[oldName];
        delete projects[currentProject].folders[oldName];
        projects[currentProject].folders[newName] = folder;
    } else {
        const content = projects[currentProject].files[oldName];
        delete projects[currentProject].files[oldName];
        projects[currentProject].files[newName] = content;
        if (currentFile === oldName) currentFile = newName;
    }

    updateFileTree();
}

// 항목 삭제
function deleteItem(name, isFolder) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    if (isFolder) {
        delete projects[currentProject].folders[name];
    } else {
        delete projects[currentProject].files[name];
        if (currentFile === name) {
            currentFile = null;
            editor.setValue('');
        }
    }

    updateFileTree();
}

// 파일 확장자로 언어 감지
function getLanguageFromFileName(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const languageMap = {
        'js': 'javascript',
        'ts': 'typescript',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'py': 'python',
        'txt': 'plaintext'
    };
    return languageMap[ext] || 'plaintext';
}

// 프로젝트 다운로드
async function downloadProject() {
    if (!currentProject) {
        alert('Please select a project to download');
        return;
    }

    const zip = new JSZip();
    const projectData = projects[currentProject];

    // 파일 추가
    Object.entries(projectData.files).forEach(([fileName, content]) => {
        zip.file(fileName, content);
    });

    // 폴더 및 하위 파일 추가
    function addFolderToZip(folder, path = '') {
        Object.entries(folder.files).forEach(([fileName, content]) => {
            zip.file(path + fileName, content);
        });
        Object.entries(folder.folders).forEach(([folderName, subFolder]) => {
            addFolderToZip(subFolder, path + folderName + '/');
        });
    }

    Object.entries(projectData.folders).forEach(([folderName, folder]) => {
        addFolderToZip(folder, folderName + '/');
    });

    // ZIP 파일 생성 및 다운로드
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 프리뷰 업데이트
function updatePreview() {
    const preview = document.getElementById('preview-frame');
    const content = editor.getValue();
    
    // HTML 파일인 경우 직접 표시
    if (currentFile && currentFile.endsWith('.html')) {
        preview.srcdoc = content;
    } else {
        // 다른 파일 타입의 경우 코드를 표시
        preview.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        font-family: monospace;
                        white-space: pre;
                        background: white;
                    }
                </style>
            </head>
            <body>${escapeHtml(content)}</body>
            </html>
        `;
    }
}

// HTML 이스케이프
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
} 